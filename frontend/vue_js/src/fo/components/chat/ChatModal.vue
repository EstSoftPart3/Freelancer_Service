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
          class="btn btn-sm btn-light"
          @click="goList"
        >
          목록
        </button>

        <button type="button" class="btn-close" @click="closeModal" />
      </div>
    </div>

    <div v-if="viewMode === 'LIST'" class="modal-body chat-modal-body">
      <button class="btn btn-primary w-100" @click="startChat">
        새 상담 시작
      </button>

      <div class="chat-room-list">
        <div
          v-for="room in chatRooms"
          :key="room.chatRoomSeq"
          class="chat-room-item"
          @click="openChat(room)"
        >
          <span
            class="badge"
            :class="room.chatRoomType === 'AI' ? 'bg-primary' : 'bg-success'"
          >
            {{ room.chatRoomType === 'AI' ? 'AI 상담' : '상담사 상담' }}
          </span>

          <div class="chat-room-content">
            <div class="chat-room-top">
              <strong class="chat-room-title">
                {{ room.title }}
              </strong>

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
    </div>

    <div v-else class="modal-body chat-modal-body chat-body-with-status">
      <div
        class="chat-status-bar d-flex justify-content-between align-items-center"
      >
        <div>
          <span
            class="badge"
            :class="
              currentRoom?.chatRoomType === 'AI' ? 'bg-primary' : 'bg-success'
            "
          >
            {{
              currentRoom?.chatRoomType === 'AI'
                ? 'AI 상담 중'
                : '상담사 상담 중'
            }}
          </span>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          @click="requestCounselor"
        >
          {{
            currentRoom?.chatRoomType === 'AI' ? '상담사 전환' : 'AI 상담 전환'
          }}
        </button>
      </div>

      <div ref="chatScroll" class="chat-scroll">
        <div
          v-for="chat in chatMessages"
          :key="chat.chatMessageSeq"
          class="chat-message"
          :class="chat.senderType === 'USER' ? 'user' : 'bot'"
        >
          <div class="chat-bubble">
            <p class="mb-0">{{ chat.messageContent }}</p>
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
import { nextTick, ref } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'

const modalStore = useModalStore()

const chatScroll = ref(null)
const messageInputRef = ref(null)

const viewMode = ref('LIST')
const message = ref('')
const currentRoom = ref(null)

let chatMessageSeq = 3

const chatRooms = ref([
  {
    chatRoomSeq: 1,
    title: '프로젝트 견적 문의',
    lastMessage: '프로젝트 견적 문의하고 싶습니다.',
    lastMessageAt: '15:30',
    chatRoomType: 'AI',
  },
  {
    chatRoomSeq: 2,
    title: '서비스 개발 문의',
    lastMessage: '상담 가능할까요?',
    lastMessageAt: '어제',
    chatRoomType: 'COUNSELOR',
  },
])

const chatMessages = ref([
  {
    chatMessageSeq: 1,
    senderType: 'AI',
    messageContent: '안녕하세요. 무엇을 도와드릴까요?',
  },
  {
    chatMessageSeq: 2,
    senderType: 'USER',
    messageContent: '프로젝트 견적 문의하고 싶습니다.',
  },
])

const startChat = () => {
  currentRoom.value = {
    chatRoomSeq: null,
    title: '새 상담',
    chatRoomType: 'AI',
  }

  chatMessages.value = [
    {
      chatMessageSeq: chatMessageSeq++,
      senderType: 'AI',
      messageContent: '안녕하세요. AI 상담입니다. 무엇을 도와드릴까요?',
    },
  ]

  viewMode.value = 'CHAT'
  scrollToBottom()
  focusInput()
}

const openChat = (room) => {
  currentRoom.value = room
  viewMode.value = 'CHAT'

  chatMessages.value = [
    {
      chatMessageSeq: chatMessageSeq++,
      senderType: room.chatRoomType,
      messageContent:
        room.chatRoomType === 'AI'
          ? '안녕하세요. AI 상담입니다. 무엇을 도와드릴까요?'
          : '안녕하세요. 상담사 상담입니다. 문의 내용을 남겨주세요.',
    },
  ]

  scrollToBottom()
  focusInput()
}

const requestCounselor = () => {
  if (!currentRoom.value) return

  currentRoom.value.chatRoomType =
    currentRoom.value.chatRoomType === 'AI' ? 'COUNSELOR' : 'AI'

  chatMessages.value.push({
    chatMessageSeq: chatMessageSeq++,
    senderType: currentRoom.value.chatRoomType,
    messageContent:
      currentRoom.value.chatRoomType === 'AI'
        ? 'AI 상담으로 전환되었습니다.'
        : '상담사 상담으로 전환되었습니다.',
  })

  scrollToBottom()
  focusInput()
}

const sendMessage = () => {
  if (!message.value.trim()) return

  chatMessages.value.push({
    chatMessageSeq: chatMessageSeq++,
    senderType: 'USER',
    messageContent: message.value,
  })

  message.value = ''

  scrollToBottom()
  focusInput()

  setTimeout(() => {
    chatMessages.value.push({
      chatMessageSeq: chatMessageSeq++,
      senderType: currentRoom.value?.chatRoomType || 'AI',
      messageContent:
        currentRoom.value?.chatRoomType === 'AI'
          ? '현재는 AI 데모 응답입니다.'
          : '상담사가 확인 중입니다.',
    })

    scrollToBottom()
    focusInput()
  }, 150)
}

const goList = () => {
  viewMode.value = 'LIST'
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

const closeModal = () => {
  modalStore.closeModal()
}
</script>

<style>
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

.chat-modal-content {
  width: 600px;
  height: 650px;
  display: flex;
  flex-direction: column;
}

.chat-modal-body {
  flex: 1;
  min-height: 450px;
  overflow-y: auto;
}

.chat-body-with-status {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-status-bar {
  flex-shrink: 0;
  padding: 10px 14px;
  border-bottom: 1px solid #eeeeee;
  background-color: #ffffff;
}

.chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
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

.chat-message.bot {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  word-break: break-word;
  background-color: #d7ec14;
  color: #000000;
}

.chat-message.user .chat-bubble {
  background-color: #d8dee7;
  color: #180f0f;
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
  margin: 0 0 6px;
  font-size: 14px;
  color: #777777;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
