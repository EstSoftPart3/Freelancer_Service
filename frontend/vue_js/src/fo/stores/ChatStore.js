// src/stores/ChatStore.js
import { defineStore } from 'pinia'
import { Client } from '@stomp/stompjs'
import { api } from '@/axios'

export const useChatStore = defineStore('chat', {
  state: () => ({
    client: null,
    connected: false,
    subscriptions: new Map(), // chatRoomSq -> subscription

    rooms: [], // 채팅방 목록 (ChatroomListItemDto[])
    roomsLoading: false,
    activeChatRoomSq: null, // 현재 모달로 열려있는 방 (있으면 이 방은 unreadCnt 증가 스킵)
  }),

  getters: {
    // 헤더 뱃지 등에서 쓸 전체 안읽은 수
    totalUnreadCnt: (state) =>
      state.rooms.reduce((sum, room) => sum + (room.unreadCnt || 0), 0),
  },

  actions: {
    connect(token) {
      // 이미 연결되어 있으면 즉시 resolve
      if (this.client && this.connected) {
        return Promise.resolve()
      }

      return new Promise((resolve, reject) => {
        this.client = new Client({
          brokerURL: 'ws://localhost:8080/api/ws',
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 5000,
          onConnect: () => {
            this.connected = true
            console.log('[WS] connected')
            resolve()
          },
          onDisconnect: () => {
            this.connected = false
            console.log('[WS] disconnected')
          },
          onStompError: (frame) => {
            console.error(
              '[WS] STOMP error',
              frame.headers['message'],
              frame.body,
            )
            reject(frame)
          },
        })

        this.client.activate()
      })
    },

    disconnect() {
      if (this.client) {
        this.subscriptions.forEach((sub) => sub.unsubscribe())
        this.subscriptions.clear()
        this.client.deactivate()
        this.connected = false
        this.client = null
      }
    },

    // 채팅방 목록 조회 (개인/기업 공통 - 서버가 회원타입 보고 분기)
    async fetchRooms() {
      this.roomsLoading = true
      try {
        const response = await api.$get('/chatrooms')
        this.rooms = response.output.list ?? response.output
      } catch (error) {
        console.error('채팅방 목록 조회 실패', error)
      } finally {
        this.roomsLoading = false
      }
    },

    subscribeToRoom(chatRoomSq, onEvent) {
      if (!this.client || !this.connected) {
        console.warn('[WS] not connected yet, cannot subscribe')
        return
      }
      if (this.subscriptions.has(chatRoomSq)) return

      const sub = this.client.subscribe(
        `/topic/chatrooms/${chatRoomSq}`,
        (message) => {
          const body = JSON.parse(message.body)

          if (onEvent) onEvent(body)

          // 목록 미리보기/안읽은수 갱신은 실제 메시지일 때만
          if (body.eventType === 'MESSAGE') {
            this.updateRoomOnNewMessage(body)
          }
        },
      )
      this.subscriptions.set(chatRoomSq, sub)
    },

    unsubscribeFromRoom(chatRoomSq) {
      const sub = this.subscriptions.get(chatRoomSq)
      if (sub) {
        sub.unsubscribe()
        this.subscriptions.delete(chatRoomSq)
      }
    },

    sendMessage(chatRoomSq, senderSq, content) {
      if (!this.client || !this.connected) {
        console.warn('[WS] not connected yet, cannot send')
        return
      }
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ chatRoomSq, senderSq, content }),
      })
    },

    // 새 메시지 수신 시 목록의 해당 방 갱신 + 최신순 재정렬
    updateRoomOnNewMessage(message) {
      const room = this.rooms.find((r) => r.chatRoomSq === message.chatRoomSq)
      if (!room) {
        // 목록에 없는 방(목록 로드 전에 새 방이 생긴 경우 등) - 재조회로 보정
        this.fetchRooms()
        return
      }

      room.lastMsg = message.content
      room.lastMsgAt = message.sentAt

      // 지금 보고 있는 방이 아니면 안읽은 수 증가
      if (this.activeChatRoomSq !== message.chatRoomSq) {
        room.unreadCnt = (room.unreadCnt || 0) + 1
      }

      // 최신 메시지 온 방을 목록 맨 위로
      this.rooms = [
        room,
        ...this.rooms.filter((r) => r.chatRoomSq !== message.chatRoomSq),
      ]
    },

    // 모달 열 때 호출
    setActiveRoom(chatRoomSq) {
      this.activeChatRoomSq = chatRoomSq
      this.markAsRead(chatRoomSq)
    },

    // 모달 닫을 때 호출
    clearActiveRoom() {
      this.activeChatRoomSq = null
    },

    async markAsRead(chatRoomSq) {
      try {
        await api.$patch(`/chatrooms/${chatRoomSq}/messages/read`)
        const room = this.rooms.find((r) => r.chatRoomSq === chatRoomSq)
        if (room) room.unreadCnt = 0
      } catch (error) {
        console.error('읽음 처리 실패', error)
      }
    },
  },
})
