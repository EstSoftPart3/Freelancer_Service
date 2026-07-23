<template>
  <div class="project-inquery-page d-flex">
    <!-- 왼쪽: 채팅방 목록 -->
    <div class="chat-room-list-area">
      <h4 class="mb-3">채팅방 목록</h4>
      <ul class="list-group">
        <li
          v-for="room in chatStore.rooms"
          :key="room.chatRoomSq"
          class="list-group-item list-group-item-action"
          :class="{
            active:
              selectedChatRoom &&
              selectedChatRoom.chatRoomSq === room.chatRoomSq,
          }"
          @click="selectChatRoom(room)"
        >
          <div class="d-flex w-100 justify-content-between align-items-center">
            <h6 class="mb-1">{{ room.projectNm }}</h6>
            <div class="d-flex align-items-center gap-2">
              <small>{{ formatTime(room.lastMsgAt) }}</small>
              <span
                v-if="room.unreadCnt > 0"
                class="badge bg-danger rounded-pill"
              >
                {{ room.unreadCnt }}
              </span>
            </div>
          </div>
          <p class="mb-1">{{ room.lastMsg }}</p>
          <small>{{ room.companyNm }}</small>
        </li>
        <li
          v-if="chatStore.rooms.length === 0"
          class="list-group-item text-center text-muted"
        >
          채팅방이 없습니다.
        </li>
      </ul>
    </div>

    <!-- 오른쪽: 채팅 내역 -->
    <div class="chat-history-area">
      <div v-if="selectedChatRoom" class="selected-chat-header mb-3">
        <h5>
          {{ selectedChatRoom.projectNm }} /
          {{ selectedChatRoom.companyNm }}
        </h5>
      </div>
      <div class="chat-message-display">
        <div v-if="!selectedChatRoom" class="text-center text-muted p-5">
          채팅방을 선택해주세요.
        </div>
        <div v-else class="chat-message-area-inner" ref="messageAreaRef">
          <div v-if="hasMore" class="text-center py-2">
            <button class="btn btn-sm btn-link" @click="loadMoreMessages">
              이전 메시지 더 보기
            </button>
          </div>
          <div
            v-for="msg in messages"
            :key="msg.chatMsgSq"
            class="d-flex align-items-end"
            :class="
              msg.senderSq === myUserSq
                ? 'justify-content-end'
                : 'justify-content-start'
            "
          >
            <span
              v-if="msg.senderSq === myUserSq && isUnreadByOpponent(msg)"
              class="text-primary unread-badge"
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useChatStore } from '@/fo/stores/ChatStore'
import { useUserStore } from '@/fo/stores/userStore'
import { api } from '@/axios'

const chatStore = useChatStore()
const userStore = useUserStore()
const myUserSq = userStore.userSq
const myReaderType = userStore.userType === 'COMPANY' ? 'COMPANY' : 'PERSONAL'

const selectedChatRoom = ref(null)
const messages = ref([])
const inputContent = ref('')
const messageAreaRef = ref(null)

const oldestCursor = ref(null)
const hasMore = ref(true)
const opponentLastReadMsgSq = ref(null)

const isUnreadByOpponent = (msg) => {
  const cursor = opponentLastReadMsgSq.value
  return cursor == null || msg.chatMsgSq > cursor
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageAreaRef.value) {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight
    }
  })
}

const fetchHistory = async (chatRoomSq, cursor = null) => {
  try {
    const response = await api.$get(`/chatrooms/${chatRoomSq}/messages`, {
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
  if (!hasMore.value || !selectedChatRoom.value) return
  const el = messageAreaRef.value
  const prevScrollHeight = el ? el.scrollHeight : 0

  await fetchHistory(selectedChatRoom.value.chatRoomSq, oldestCursor.value)

  nextTick(() => {
    if (el) el.scrollTop = el.scrollHeight - prevScrollHeight
  })
}

// WS 이벤트 분기 - 메시지 / 읽음 이벤트
const onSocketEvent = (body) => {
  if (body.eventType === 'READ') {
    if (body.readerType !== myReaderType) {
      opponentLastReadMsgSq.value = body.lastReadMsgSq
    }
    return
  }

  // 지금 열려있는 방으로 온 메시지만 화면에 추가
  if (
    selectedChatRoom.value &&
    body.chatRoomSq === selectedChatRoom.value.chatRoomSq
  ) {
    messages.value.push(body)
    scrollToBottom()
  }
}

const selectChatRoom = async (room) => {
  if (selectedChatRoom.value) {
    chatStore.unsubscribeFromRoom(selectedChatRoom.value.chatRoomSq)
  }

  selectedChatRoom.value = room
  chatStore.setActiveRoom(room.chatRoomSq)

  opponentLastReadMsgSq.value =
    myReaderType === 'PERSONAL'
      ? room.companyLastReadMsgSq
      : room.userLastReadMsgSq

  oldestCursor.value = null
  hasMore.value = true

  await fetchHistory(room.chatRoomSq)
  chatStore.subscribeToRoom(room.chatRoomSq, onSocketEvent)
}

const sendMessage = () => {
  const content = inputContent.value.trim()
  if (!content || !selectedChatRoom.value) return

  chatStore.sendMessage(selectedChatRoom.value.chatRoomSq, myUserSq, content)
  inputContent.value = ''
}

onMounted(async () => {
  const token = localStorage.getItem('accessToken')
  await chatStore.connect(token)
  await chatStore.fetchRooms()

  if (chatStore.rooms.length > 0) {
    await selectChatRoom(chatStore.rooms[0])
  }
})

onUnmounted(() => {
  if (selectedChatRoom.value) {
    chatStore.unsubscribeFromRoom(selectedChatRoom.value.chatRoomSq)
  }
  chatStore.clearActiveRoom()
})
</script>

<style scoped>
.project-inquery-page {
  height: calc(100vh - 100px); /* 헤더/푸터 등을 제외한 높이 */
  gap: 0; /* 두 영역 사이의 간격 */
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.chat-room-list-area {
  flex: 0 0 350px; /* 고정 너비 */
  border-right: 1px solid #e9ecef; /* 오른쪽 테두리만 */
  border-radius: 0; /* 라운드 제거 */
  padding: 15px;
  background-color: #fff;
  overflow-y: auto;
}

.chat-room-list-area .list-group-item {
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 5px;
}

.chat-room-list-area .list-group-item.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.chat-room-list-area .list-group-item.active h6,
.chat-room-list-area .list-group-item.active p,
.chat-room-list-area .list-group-item.active small {
  color: white;
}

.chat-history-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border: none; /* 테두리 제거 */
  border-radius: 0; /* 라운드 제거 */
  background-color: #fff;
  padding: 20px;
}

.chat-message-display {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 0; /* flex-grow가 작동하도록 초기 높이 설정 */
}

.chat-message-area-inner {
  flex-grow: 1;
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
  margin-top: 15px;
}

.selected-chat-header h5 {
  margin-bottom: 0;
  color: #343a40;
}
.unread-badge {
  font-size: 0.7rem;
  margin-right: 2px;
  margin-bottom: 4px;
}
</style>
