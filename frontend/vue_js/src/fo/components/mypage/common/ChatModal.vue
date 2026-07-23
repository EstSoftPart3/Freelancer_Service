<template>
  <div class="chat-modal-overlay" @click.self="closeModal">
    <div class="chat-modal-content">
      <div class="chat-modal-header">
        <h5 class="modal-title">
          {{ props.projectTitle || '가상 프로젝트명' }} /
          {{ props.companyTitle || '가상 기업명' }}
        </h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>
      <div class="chat-modal-body">
        <div class="chat-message-area" ref="messageAreaRef">
          <div v-if="hasMore" class="text-center py-2">
            <button class="btn btn-sm btn-link" @click="loadMoreMessages">
              이전 메시지 더 보기
            </button>
          </div>

          <div
            v-for="msg in messages"
            :key="msg.chatMsgSq"
            class="d-flex"
            :class="
              msg.senderSq === myUserSq
                ? 'justify-content-end'
                : 'justify-content-start'
            "
          >
            <span
              v-if="msg.senderSq === myUserSq && isUnreadByOpponent(msg)"
              class="unread-badge align-self-end me-1"
              >1</span
            >
            <div
              class="chat-message"
              :class="msg.senderSq === myUserSq ? 'sent' : 'received'"
            >
              <p>{{ msg.content }}</p>
              <span class="message-time">{{ formatTime(msg.sentAt) }}</span>
            </div>
          </div>
        </div>
        <div class="chat-input-area d-flex gap-2 mt-3">
          <input
            v-model="inputContent"
            type="text"
            class="form-control"
            placeholder="메시지를 입력하세요"
            @keyup.enter="sendMessage"
          />
          <button class="btn btn-primary" @click="sendMessage">전송</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { useChatStore } from '@/fo/stores/ChatStore'
import { useUserStore } from '@/fo/stores/userStore'
import { api } from '@/axios'

const modalStore = useModalStore()
const chatStore = useChatStore()
const userStore = useUserStore()

const props = defineProps({
  chatRoomSq: Number,
  isNewRoom: Boolean,
  projectTitle: String,
  companyTitle: String,
  userLastReadMsgSq: Number,
  companyLastReadMsgSq: Number,
})

const myUserSq = userStore.userSq
const myReaderType = userStore.userType === 'COMPANY' ? 'COMPANY' : 'PERSONAL'

// 상대방 읽음 커서 - 처음엔 props로 받은 값으로 초기화
const opponentLastReadMsgSq = ref(
  myReaderType === 'PERSONAL'
    ? props.companyLastReadMsgSq
    : props.userLastReadMsgSq,
)

const isUnreadByOpponent = (msg) => {
  const cursor = opponentLastReadMsgSq.value
  return cursor == null || msg.chatMsgSq > cursor
}

const messages = ref([])
const inputContent = ref('')
const messageAreaRef = ref(null)

const oldestCursor = ref(null)
const hasMore = ref(true)

const fetchHistory = async (cursor = null) => {
  try {
    const response = await api.$get(`/chatrooms/${props.chatRoomSq}/messages`, {
      params: { size: 30, ...(cursor ? { cursor } : {}) },
    })
    const newMessages = response.output ?? []
    if (newMessages.length < 30) hasMore.value = false

    const reversed = [...newMessages].reverse()
    messages.value = cursor ? [...reversed, ...messages.value] : reversed

    if (newMessages.length > 0) {
      oldestCursor.value = newMessages[newMessages.length - 1].chatMsgSq
    }
    if (!cursor) scrollToBottom()
  } catch (error) {
    console.error('채팅 이력 조회 실패', error)
  }
}

const loadMoreMessages = async () => {
  if (!hasMore.value) return
  const el = messageAreaRef.value
  const prevScrollHeight = el ? el.scrollHeight : 0

  await fetchHistory(oldestCursor.value)

  nextTick(() => {
    if (el) el.scrollTop = el.scrollHeight - prevScrollHeight
  })
}

// WS 이벤트 분기 - 메시지 / 읽음 이벤트
const onSocketEvent = (body) => {
  console.log('[WS event]', body)
  if (body.eventType === 'READ') {
    // 상대방이 읽었을 때만 반영 (내가 읽음 처리한 이벤트는 무시)
    if (body.readerType !== myReaderType) {
      opponentLastReadMsgSq.value = body.lastReadMsgSq
    }
    return
  }

  // MESSAGE
  messages.value.push(body)
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageAreaRef.value) {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  const content = inputContent.value.trim()
  if (!content) return
  chatStore.sendMessage(props.chatRoomSq, myUserSq, content)
  inputContent.value = ''
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const closeModal = () => {
  modalStore.closeModal()
}

onMounted(async () => {
  chatStore.setActiveRoom(props.chatRoomSq) // 내가 읽음 처리 -> 서버가 브로드캐스트 -> 상대방 화면에 반영됨
  await fetchHistory()
  chatStore.subscribeToRoom(props.chatRoomSq, onSocketEvent)
})

onUnmounted(() => {
  chatStore.unsubscribeFromRoom(props.chatRoomSq)
  chatStore.clearActiveRoom()
})
</script>

<style scoped>
.chat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.chat-modal-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  width: 90%;
  max-width: 600px;
  height: 80vh;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.chat-modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.modal-title {
  margin-bottom: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
}

.chat-modal-body {
  padding: 20px;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chat-message-area {
  flex: 1 1 auto;
  min-height: 0;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.chat-message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 15px;
  max-width: 75%;
  word-wrap: break-word;
  position: relative;
}

.chat-message p {
  margin: 0;
  font-size: 0.9rem;
}

.chat-message.sent {
  align-self: flex-end;
  background-color: #dcf8c6;
  color: #333;
}

.chat-message.received {
  align-self: flex-start;
  background-color: #e0e0e0;
  color: #333;
  margin-right: auto;
}

.message-time {
  font-size: 0.75rem;
  color: #888;
  margin-top: 2px;
  display: block;
  text-align: right;
}

.chat-message.received .message-time {
  text-align: left;
}

.chat-input-area {
  flex-shrink: 0;
}
.unread-badge {
  font-size: 0.7rem;
  color: #007bff;
  flex-shrink: 0;
}
</style>
