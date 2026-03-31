<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isVisible" class="popup-overlay">
        <transition name="zoom">
          <div v-if="isVisible" class="popup-content">
            <!-- 팝업 이미지 및 링크 -->
            <div class="popup-image-container">
              <a
                :href="POPUP_CONFIG.linkUrl"
                target="_self"
                rel="noopener noreferrer"
                @click="closePopup"
              >
                <img
                  :src="POPUP_CONFIG.imageUrl"
                  alt="Promotion"
                  class="popup-image"
                />
              </a>
            </div>

            <!-- 하단 제어 바 -->
            <div class="popup-footer">
              <div class="dont-show-again">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="dontShowCheck"
                    v-model="dontShowToday"
                  />
                  <label class="form-check-label" for="dontShowCheck">
                    오늘 하루 보지 않기
                  </label>
                </div>
              </div>
              <button class="btn-close-popup" @click="handleClose">닫기</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { POPUP_CONFIG } from '@/fo/config/popup-config'

const isVisible = ref(false)
const dontShowToday = ref(false)
const POPUP_STORAGE_KEY = `popup-hidden-${POPUP_CONFIG.id}`

onMounted(() => {
  const hiddenUntil = localStorage.getItem(POPUP_STORAGE_KEY)
  const now = new Date().getTime()

  // 24시간 제한 체크
  if (hiddenUntil && now < parseInt(hiddenUntil)) {
    isVisible.value = false
  } else {
    // 0.3초 후 자연스러운 노출
    setTimeout(() => {
      isVisible.value = true
    }, 300)
  }
})

const closePopup = () => {
  isVisible.value = false
}

const handleClose = () => {
  if (dontShowToday.value) {
    const expirationDate = new Date()
    expirationDate.setDate(
      expirationDate.getDate() + POPUP_CONFIG.showAgainAfterDays,
    )
    localStorage.setItem(POPUP_STORAGE_KEY, expirationDate.getTime().toString())
  }
  isVisible.value = false
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.popup-content {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  position: relative;
  border: none;
}

.popup-image-container {
  position: relative;
  width: 100%;
}

.popup-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.popup-image:hover {
  transform: scale(1.01);
}

.popup-close-x {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
}

.popup-content:hover .popup-close-x {
  opacity: 1;
}

.popup-close-x:hover {
  background: rgba(0, 0, 0, 0.5);
}

.popup-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fdfdfd;
}

.form-check-label {
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.btn-close-popup {
  background: transparent;
  border: none;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close-popup:hover {
  background: #f0f0f0;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
