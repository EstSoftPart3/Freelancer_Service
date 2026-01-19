<template>
  <div class="social-integration-modal">
    <section class="card-custom">
      <header class="card-header-custom">
        <h2 class="card-title-custom">중복 계정 통합 안내</h2>
      </header>

      <div class="card-body-custom">
        <div class="modal-wrapper-custom">
          <template v-if="step === 1">
            <div class="modal-icon-custom">
              <i class="fas fa-question-circle"></i>
            </div>
            <div class="modal-text-custom">
              <h4>
                이미 <strong>[{{ email }}]</strong>으로 가입된 계정이
                있습니다.<br />
              </h4>
              <p>구글 계정을 연결하여 간편하게 로그인하시겠습니까?</p>
            </div>
          </template>
          <template v-else>
            <div class="modal-text-custom">
              <h4>보안을 위해 기존 계정의 비밀번호를 입력해주세요.</h4>
              <p>비밀번호</p>
              <div class="password-form">
                <input
                  v-model="password"
                  type="password"
                  class="form-control-custom"
                  placeholder=" "
                  @keyup.enter="handleIntegration"
                  autofocus
                />
                <div v-if="errorMessage" class="error-msg-custom">
                  <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
                </div>
              </div>
            </div>
          </template>
          <div class="clearfix"></div>
        </div>
      </div>

      <footer class="card-footer-custom">
        <div class="row-custom">
          <div class="col-end-custom">
            <template v-if="step === 1">
              <button class="btn-primary-custom" @click="step = 2">
                계정 통합
              </button>
              <button class="btn-default-custom" @click="closeModal">
                다음에
              </button>
            </template>
            <template v-else>
              <button class="btn-primary-custom" @click="handleIntegration">
                인증 및 통합완료
              </button>
              <button class="btn-default-custom" @click="step = 1">
                이전으로
              </button>
            </template>
          </div>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { api } from '@/axios'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/fo/stores/alertStore'

const props = defineProps({
  email: { type: String, default: '' },
  socialId: { type: String, default: '' },
})

const modalStore = useModalStore()
const alertStore = useAlertStore()
const router = useRouter()
const step = ref(1)
const password = ref('')
const errorMessage = ref('')

const closeModal = () => modalStore.closeModal()

const handleIntegration = async () => {
  if (!password.value) {
    errorMessage.value = '비밀번호를 입력해주세요.'
    return
  }
  errorMessage.value = ''
  try {
    const payload = {
      userEmail: props.email,
      userPw: password.value,
      socialId: props.socialId,
    }

    const res = await api.$post('/auth/social/link', payload)

    if (res.status === 'OK' || res.message === 'success') {
      alertStore.show(
        '계정 통합이 완료되었습니다. 다시 로그인해 주세요.',
        'success',
      )
      closeModal()

      router.push('/login')
    } else {
      errorMessage.value = res.message || '비밀번호가 일치하지 않습니다.'
    }
  } catch (error) {
    errorMessage.value =
      '에러 발생: ' + (error.response?.status || '네트워크 오류')
  }
}
</script>

<style scoped>
/* 모달 레이아웃 설정 */
.social-integration-modal {
  width: 600px;
  margin: 0 auto;
  font-family: 'Poppins', Arial, sans-serif;
}

/* 카드 본체 */
.card-custom {
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.125);
  overflow: hidden;
  width: 100%;
  margin-top: 200px;
}

/* 헤더 스타일 */
.card-header-custom {
  background: #f6f6f6;
  border-bottom: 1px solid #dadada;
  padding: 18px;
}
.card-title-custom {
  color: #333;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

/* 바디 스타일 */
.card-body-custom {
  padding: 1rem;
  background: #fdfdfd;
}
.modal-wrapper-custom {
  position: relative;
  padding: 25px 0;
  min-height: 125px; /* 높이 고정용 */
}

/* 아이콘 및 텍스트 배치 (20/80 Float) */
.modal-icon-custom {
  float: left;
  width: 15%;
  text-align: center;
}
.modal-icon-custom i {
  font-size: 52px;
  color: #0088cc;
  position: relative;
  top: -10px;
  line-height: 1;
}
.modal-text-custom {
  float: left;
  width: 80%;
  padding: 0 5px;
  box-sizing: border-box;
}
.modal-text-custom h4 {
  font-size: 17px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}
.modal-text-custom p {
  color: #777;
  font-size: 13px;
  line-height: 22px;
  margin-bottom: 1px;
}

/* 푸터 스타일 */
.card-footer-custom {
  padding: 0.5rem 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.125);
  background: #fff;
  border-radius: 0 0 5px 5px;
}
.col-end-custom {
  text-align: right !important;
}

/* 버튼 스타일 */
.btn-primary-custom {
  background-color: #0088cc;
  border: 1px solid #0088cc;
  border-bottom-color: #006699;
  color: #fff;
  padding: 0.47rem 0.75rem;
  font-size: 0.9rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
.btn-default-custom {
  background-color: #fff;
  border: 1px solid #ccc;
  color: #333;
  padding: 0.47rem 0.75rem;
  font-size: 0.9rem;
  border-radius: 0.25rem;
  margin-left: 8px;
  cursor: pointer;
}

/* 폼 요소 및 에러 */
.form-control-custom {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.error-msg-custom {
  color: #dc3545;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
}
.clearfix {
  clear: both;
}
</style>

<style>
/* 부모 컴포넌트 강제 스타일 제어 (너비 및 배경 투명화) */
.modal-dialog:has(.social-integration-modal) {
  max-width: 600px !important;
  width: 600px !important;
}

.modal-content:has(.social-integration-modal) {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}
</style>
