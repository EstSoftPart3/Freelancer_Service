import { Client } from '@stomp/stompjs'
import { defineStore } from 'pinia'
import SockJS from 'sockjs-client'
import { computed, ref } from 'vue'

const WS_BASE_URL = 'http://localhost:8080'

export const useChatSocketStore = defineStore('chatSocket', () => {
  const stompClient = ref(null)
  const isConnected = ref(false)

  const reconnectAttempts = ref(0)
  const MAX_RECONNECT_ATTEMPTS = 5

  const notifySubscription = ref(null)
  const roomSubscription = ref(null)

  const unreadRoomIds = ref(new Set())
  const unreadChatCount = computed(() => unreadRoomIds.value.size)

  const unreadMessageCountByRoom = ref({})
  const unreadMessageTotalCount = computed(() =>
    Object.values(unreadMessageCountByRoom.value).reduce(
      (sum, count) => sum + count,
      0,
    ),
  )

  const UNREAD_STORAGE_KEY = 'EST_CHAT_UNREAD'

  const saveUnreadState = () => {
    localStorage.setItem(
      UNREAD_STORAGE_KEY,
      JSON.stringify({
        unreadRoomIds: Array.from(unreadRoomIds.value),
        unreadMessageCountByRoom: unreadMessageCountByRoom.value,
      }),
    )
  }

  const loadUnreadState = () => {
    const saved = localStorage.getItem(UNREAD_STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)

      unreadRoomIds.value = new Set(parsed.unreadRoomIds || [])
      unreadMessageCountByRoom.value = parsed.unreadMessageCountByRoom || {}
    } catch (e) {
      console.error('채팅 알림 복구 실패', e)
      localStorage.removeItem(UNREAD_STORAGE_KEY)
    }
  }

  // const clearUnreadState = () => {
  //   unreadRoomIds.value = new Set()
  //   unreadMessageCountByRoom.value = {}
  //   localStorage.removeItem(UNREAD_STORAGE_KEY)
  // }

  const connectWebSocket = ({ token, userSq, isCounselor }) => {
    if (!token) {
      console.error('전역 websocket 연결 실패: accessToken 없음')
      return
    }

    if (!isCounselor && !userSq) {
      console.error('전역 websocket 연결 실패: userSq 없음')
      return
    }

    if (stompClient.value && isConnected.value) return

    stompClient.value = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE_URL}/api/ws-chat`),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('전역 websocket 연결 성공')

        isConnected.value = true
        reconnectAttempts.value = 0

        const notifyDestination = isCounselor
          ? '/sub/chat/notify/counselor'
          : `/sub/chat/notify/user/${userSq}`

        subscribeNotify(notifyDestination)
      },

      onWebSocketClose: () => {
        isConnected.value = false
        reconnectAttempts.value += 1

        console.warn(
          `WebSocket 재연결 시도 ${reconnectAttempts.value}/${MAX_RECONNECT_ATTEMPTS}`,
        )

        if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
          console.error('WebSocket 최대 재연결 횟수 초과. 재연결 중단')

          if (stompClient.value) {
            stompClient.value.reconnectDelay = 0
            stompClient.value.deactivate()
          }
        }
      },

      onDisconnect: () => {
        console.log('전역 websocket 연결 종료')
        isConnected.value = false
      },

      onStompError: (frame) => {
        console.error('STOMP 에러', frame)
      },

      onWebSocketError: (error) => {
        console.error('WebSocket 에러', error)
      },
    })

    stompClient.value.activate()
  }

  const subscribeNotify = (destination) => {
    if (!stompClient.value || !isConnected.value) return
    if (notifySubscription.value) return

    notifySubscription.value = stompClient.value.subscribe(
      destination,
      (response) => {
        const notification = JSON.parse(response.body)

        if (!notification.chatroomSq) return

        const roomId = notification.chatroomSq

        unreadRoomIds.value.add(roomId)
        unreadRoomIds.value = new Set(unreadRoomIds.value)

        unreadMessageCountByRoom.value = {
          ...unreadMessageCountByRoom.value,
          [roomId]: (unreadMessageCountByRoom.value[roomId] || 0) + 1,
        }

        saveUnreadState()
      },
    )
  }

  const subscribeRoom = (chatroomSq, callback) => {
    if (!chatroomSq) return

    if (!stompClient.value || !isConnected.value) {
      console.error('방 구독 실패: websocket 연결 안됨')
      return
    }

    unsubscribeRoom()

    roomSubscription.value = stompClient.value.subscribe(
      `/sub/chat/room/${chatroomSq}`,
      (response) => {
        const receivedMessage = JSON.parse(response.body)
        callback(receivedMessage)
      },
    )
  }

  const unsubscribeRoom = () => {
    if (roomSubscription.value) {
      roomSubscription.value.unsubscribe()
      roomSubscription.value = null
    }
  }

  const publishMessage = (destination, body) => {
    if (!stompClient.value || !isConnected.value) {
      console.error('메시지 전송 실패: websocket 연결 안됨')
      return
    }

    stompClient.value.publish({
      destination,
      body: JSON.stringify(body),
    })
  }

  const markAsRead = (chatroomSq) => {
    unreadRoomIds.value.delete(chatroomSq)
    unreadRoomIds.value = new Set(unreadRoomIds.value)

    const copiedUnreadMessageCountByRoom = {
      ...unreadMessageCountByRoom.value,
    }

    delete copiedUnreadMessageCountByRoom[chatroomSq]

    unreadMessageCountByRoom.value = copiedUnreadMessageCountByRoom

    saveUnreadState()
  }

  const disconnectWebSocket = () => {
    unsubscribeRoom()

    if (notifySubscription.value) {
      notifySubscription.value.unsubscribe()
      notifySubscription.value = null
    }

    if (stompClient.value) {
      stompClient.value.deactivate()
      stompClient.value = null
    }

    isConnected.value = false
    reconnectAttempts.value = 0
  }

  return {
    stompClient,
    isConnected,

    unreadRoomIds,
    unreadChatCount,
    unreadMessageCountByRoom,
    unreadMessageTotalCount,

    connectWebSocket,
    subscribeRoom,
    unsubscribeRoom,
    publishMessage,
    markAsRead,
    disconnectWebSocket,

    loadUnreadState,
  }
})
