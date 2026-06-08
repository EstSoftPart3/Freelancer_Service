<template>
  <div class="modal-content chat-modal-content">
    <div class="modal-header chat-modal-header">
      <h4 class="modal-title">
        {{ viewMode === 'LIST' ? '상담 목록' : '상담 채팅' }}
      </h4>

      <div class="chat-header-actions">
        <button
          v-if="viewMode === 'CHAT'"
          type="button"
          class="btn btn-sm btn-outline-secondary chat-header-btn"
          @click="goList"
        >
          목록
        </button>

        <button type="button" class="btn-close" @click="closeModal" />
      </div>
    </div>

    <div v-if="viewMode === 'LIST'" class="modal-body chat-modal-body">
      <div class="chat-room-list">
        <div v-if="chatrooms.length === 0" class="empty-room">
          채팅방이 없습니다.
        </div>

        <div
          v-for="room in chatrooms"
          :key="room.chatroomSq"
          class="chat-room-item"
          @click="openChat(room)"
        >
          <div class="chat-room-icon">
            <i
              :class="
                room.chatroomType === 'AI'
                  ? 'bi bi-robot'
                  : 'bi bi-person-badge'
              "
            ></i>
          </div>

          <div class="chat-room-content">
            <div class="chat-room-top">
              <!-- <strong class="chat-room-title">
                {{ room.title }}
              </strong> -->

              <span class="chat-room-time">
                {{ room.lastMessageAt }}
              </span>
            </div>

            <p class="chat-room-message">
              {{ room.lastMessage }}
            </p>
          </div>
        </div>
      </div>
      <button type="button" class="chat-create-btn" @click="startChat">
        <i class="bi bi-plus-lg"></i>
      </button>
    </div>

    <div v-else class="modal-body chat-modal-body chat-body-with-status">
      <div class="chat-status-bar">
        <span
          class="badge chat-status-badge"
          :class="
            currentRoom?.chatroomType === 'AI' ? 'bg-primary' : 'bg-success'
          "
        >
          {{
            currentRoom?.chatroomType === 'AI' ? 'AI 상담 중' : '상담사 상담 중'
          }}
        </span>

        <button
          type="button"
          class="btn btn-sm btn-outline-primary chat-switch-btn"
          @click.stop="requestCounselor"
        >
          {{
            currentRoom?.chatroomType === 'AI' ? '상담사 전환' : 'AI 상담 전환'
          }}
        </button>
      </div>

      <div ref="chatScroll" class="chat-scroll">
        <div v-if="chatMessages.length === 0" class="welcome-message">
          {{
            currentRoom?.chatroomType === 'COUNSELOR'
              ? '상담사 상담으로 전환되었습니다. 질문을 말씀해주세요.'
              : '안녕하세요. AI 상담사입니다. 궁금한 내용을 입력해주세요.'
          }}
        </div>
        <div
          v-for="chat in chatMessages"
          :key="chat.chatMessageSq"
          class="chat-message"
          :class="isMyMessage(chat) ? 'my-message' : 'other-message'"
        >
          <div class="chat-bubble">
            {{ chat.messageContent }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="viewMode === 'CHAT'" class="modal-footer chat-modal-footer">
      <input
        ref="messageInputRef"
        v-model="message"
        class="form-control"
        placeholder="메시지를 입력하세요"
        @keyup.enter="sendMessage"
      />

      <button type="button" class="btn btn-primary" @click="sendMessage">
        전송
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useUserStore } from '@/fo/stores/userStore'
import { api } from '@/axios'

const modalStore = useModalStore()

const chatScroll = ref(null)
const messageInputRef = ref(null)

const viewMode = ref('LIST')
const message = ref('')
const currentRoom = ref(null)
const chatMessages = ref([])
const chatrooms = ref([])

const userStore = useUserStore()

const WS_BASE_URL = 'http://localhost:8080'
const stompClient = ref(null)
const subscription = ref(null)
const isConnected = ref(false)
const isCounselor = computed(() => {
  return userStore.userType === 'COMPANY' && userStore.userNm === '김상담'
})

const fetchMessages = async (chatroomSq) => {
  try {
    const url = isCounselor.value
      ? `/chatmessages/counselor/${chatroomSq}/messages`
      : `/chatmessages/${chatroomSq}/messages`

    const response = await api.$get(url)

    chatMessages.value = response.output?.messageList ?? []
  } catch (e) {
    console.error(e)

    chatMessages.value = []
  }
}

const fetchChatrooms = async () => {
  try {
    const isCounselor =
      userStore.userType === 'COMPANY' && userStore.userNm === '김상담'

    const url = isCounselor ? '/chat/counselor' : '/chat'

    const response = await api.$get(url)
    chatrooms.value = response.output.chatroomList
  } catch (e) {
    console.log('채팅방 조회에 실패했습니다.')
  }
}

const subscribe = (chatroomSq) => {
  if (!stompClient.value || !isConnected.value) {
    console.error('구독 실패: websocket 연결 안됨')
    return
  }

  if (!chatroomSq) {
    return
  }

  if (subscription.value) {
    subscription.value.unsubscribe()
    subscription.value = null
  }

  const destination = `/sub/chat/room/${chatroomSq}`

  subscription.value = stompClient.value.subscribe(destination, (response) => {
    const receivedMessage = JSON.parse(response.body)

    chatMessages.value.push(receivedMessage)

    scrollToBottom()
  })
}

const connect = (chatroomSq) => {
  const token = localStorage.getItem('accessToken')

  if (!token) {
    console.error('websocket 연결 실패 : accessToken 없음')
    return
  }

  if (stompClient.value && isConnected.value) {
    subscribe(chatroomSq)
    return
  }

  stompClient.value = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/api/ws-chat`),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 3000,

    onConnect: () => {
      console.log('websocket 연결 성공')
      console.log('onConnect chatroomSq:', chatroomSq)
      isConnected.value = true
      subscribe(chatroomSq)
    },

    onStompError: (frame) => {
      console.error('STOMP 에러', frame)
    },

    onWebSocketError: (error) => {
      console.error('WebSocket 에러', error)
    },

    onDisconnect: () => {
      console.log('websocket 연결 종료')
      isConnected.value = false
    },
  })

  stompClient.value.activate()
}

const afterChatRendered = () => {
  scrollToBottom()
  focusInput()
}

const startChat = async () => {
  try {
    const response = await api.$post('/chat')

    const chatroomSq = response.output.chatroomSq

    currentRoom.value = {
      chatroomSq,
      chatroomType: 'AI',
    }

    chatMessages.value = []
    message.value = ''
    viewMode.value = 'CHAT'

    connect(chatroomSq)

    nextTick(() => {
      afterChatRendered()
    })
  } catch (e) {
    console.error(e)
  }
}

const openChat = async (room) => {
  currentRoom.value = room

  chatMessages.value = []
  message.value = ''
  viewMode.value = 'CHAT'

  await fetchMessages(currentRoom.value.chatroomSq)
  connect(currentRoom.value.chatroomSq)

  nextTick(() => {
    afterChatRendered()
  })
}

const requestCounselor = async () => {
  if (!currentRoom.value) return

  const currentType = currentRoom.value.chatroomType

  const nextChatroomType = currentType === 'AI' ? 'COUNSELOR' : 'AI'

  try {
    await api.$patch(`/chat/${currentRoom.value.chatroomSq}/type`, {
      chatroomType: nextChatroomType,
    })

    currentRoom.value.chatroomType = nextChatroomType

    chatMessages.value.push({
      senderType: nextChatroomType,
      messageContent:
        nextChatroomType === 'COUNSELOR'
          ? '상담사 상담으로 전환되었습니다.'
          : 'AI 상담으로 전환되었습니다.',
    })

    afterChatRendered()
  } catch (e) {
    console.log(e)
  }
}

const isMyMessage = (chat) => {
  if (isCounselor.value) {
    return chat.senderType === 'COUNSELOR'
  }

  return chat.senderType === 'USER'
}

const sendMessage = () => {
  const content = message.value.trim()

  if (!content) return

  if (!currentRoom.value) {
    console.error('현재 채팅방 없음')
    return
  }

  if (!stompClient.value || !isConnected.value) {
    console.error('websocket 연결 안 됨')
    return
  }

  const sendDestination = isCounselor.value
    ? '/pub/counselor/chat/send'
    : '/pub/chat/send'
  stompClient.value.publish({
    destination: sendDestination,
    body: JSON.stringify({
      chatroomSq: currentRoom.value.chatroomSq,
      messageContent: content,
    }),
  })

  message.value = ''

  focusInput()
}

const goList = async () => {
  disconnect()

  currentRoom.value = null
  chatMessages.value = []
  message.value = ''
  viewMode.value = 'LIST'

  await fetchChatrooms()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (!chatScroll.value) return

    chatScroll.value.scrollTop = chatScroll.value.scrollHeight
  })
}

const focusInput = () => {
  nextTick(() => {
    messageInputRef.value?.focus()
  })
}

const disconnect = () => {
  if (subscription.value) {
    subscription.value.unsubscribe()
    subscription.value = null
  }

  if (stompClient.value) {
    stompClient.value.deactivate()
    stompClient.value = null
  }

  isConnected.value = false
}

const closeModal = () => {
  disconnect()
  modalStore.closeModal()
}

onMounted(async () => {
  await fetchChatrooms()
})

onUnmounted(() => {
  disconnect()
})
</script>

<style>
.chat-modal-content {
  width: 600px;
  height: 650px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-modal-body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-room-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f1f3f5;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.chat-create-btn {
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  background: var(--primary);
  color: #ffffff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chat-body-with-status {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #f5f5f5;
}
.chat-status-bar {
  flex-shrink: 0;
  margin: 14px 16px 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 8px;
}

.chat-status-bar .badge,
.chat-status-bar .btn {
  height: 32px;
  min-width: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
}

.chat-status-bar .btn {
  padding: 0 12px;
}

.chat-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px 16px;
  background: #f5f5f5;
}
.chat-modal-footer {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.chat-modal-footer input {
  flex: 1;
}

.chat-message {
  display: flex;
  margin-bottom: 12px;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.ai,
.chat-message.counselor {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 72%;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.5;
  word-break: break-word;
  font: inherit;
}

.chat-message.user .chat-bubble {
  background-color: var(--primary);
  color: #ffffff;
}

.chat-message.ai .chat-bubble,
.chat-message.counselor .chat-bubble {
  background-color: #ffffff;
  color: inherit;
  border: 1px solid #eeeeee;
}

.chat-room-list {
  margin-top: 16px;
}

.chat-room-item {
  display: flex;
  gap: 12px;
  padding: 14px 8px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;
}

.chat-room-item:hover {
  background-color: #f8f9fa;
}

.chat-room-content {
  flex: 1;
  min-width: 0;
}

.chat-room-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.chat-room-title {
  font-size: 16px;
  font-weight: 700;
  color: #333333;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chat-room-time {
  font-size: 13px;
  color: #999999;
  flex-shrink: 0;
}

.chat-room-message {
  margin: 0;
  font-size: 14px;
  color: #777777;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.my-message {
  justify-content: flex-end;
}

.my-message .chat-bubble {
  background-color: var(--bs-primary);
  color: white;
}

.other-message {
  justify-content: flex-start;
}

.other-message .chat-bubble {
  background-color: var(--bs-secondary-bg);
  color: var(--bs-body-color);
}
</style>
