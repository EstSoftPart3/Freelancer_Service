<template>
  <PasswordCheck v-if="!isConfirmed" @confirmed="isConfirmed = true">
    <h4 class="mb-3" style="font-size: 24px">회원 탈퇴</h4>
  </PasswordCheck>
  <div v-else>
    <div class="overflow-hidden mb-3">
      <h4 class="mb-3" style="font-size: 24px">회원 탈퇴</h4>
    </div>

    <form
      @submit="handleSubmit"
      class="needs-validation"
      novalidate
      @keydown.enter.prevent
    >
      <!-- 탈퇴 유의사항 textarea -->
      <div class="form-group row mb-4">
        <label class="col-lg-3 col-form-label form-control-label text-2"
          >회원 탈퇴 안내</label
        >
        <div class="col-lg-9">
          <textarea
            class="form-control text-2"
            rows="8"
            readonly
            style="resize: none; overflow-y: scroll"
          >
※ 회원 탈퇴 전 꼭 확인해주세요.

1. 탈퇴 시 해당 계정으로 등록된 모든 정보는 삭제되며, 복구가 불가능합니다.
2. 탈퇴 후에는 동일한 아이디로 재가입이 제한될 수 있습니다.
3. 작성하신 게시물, 댓글 등 일부 콘텐츠는 탈퇴 후에도 사이트에 남아있을 수 있습니다.
4. 유료 서비스 이용 중 탈퇴할 경우, 잔여 이용 기간에 대한 보상 또는 환불은 제공되지 않습니다.

위의 내용을 충분히 확인하신 후 탈퇴를 진행해 주세요.
          </textarea>
        </div>
      </div>

      <!-- 아이디 입력 -->
      <div class="form-group row">
        <label
          class="col-lg-3 col-form-label form-control-label text-2 required"
          >아이디</label
        >
        <div class="col-lg-9">
          <input
            class="form-control text-3 h-auto py-2"
            type="text"
            v-model="userId"
          />
          <div class="invalid-feedback text-danger" v-if="isInvalidUserId">
            아이디를 입력해 주세요.
          </div>
        </div>
      </div>

      <!-- 탈퇴 신청자 입력 -->
      <div class="form-group row">
        <label
          class="col-lg-3 col-form-label form-control-label text-2 required"
          >탈퇴 신청자</label
        >
        <div class="col-lg-9">
          <input
            class="form-control text-3 h-auto py-2"
            type="text"
            v-model="applicantName"
          />
          <div
            class="invalid-feedback text-danger"
            v-if="isInvalidApplicantName"
          >
            탈퇴 신청자명을 입력해 주세요.
          </div>
        </div>
      </div>

      <!-- 체크박스 -->
      <div class="form-group row">
        <div class="col-lg-12">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="agreeCheck"
              v-model="agreeCheck"
            />
            <label class="form-check-label text-2" for="agreeCheck">
              회원 탈퇴 안내 사항을 모두 읽었으며, 이에 동의합니다.
            </label>
          </div>
          <div
            class="invalid-feedback text-danger ps-4"
            v-if="isInvalidAgreeCheck"
          >
            안내 사항에 동의해야 탈퇴가 가능합니다.
          </div>
        </div>
      </div>

      <!-- 탈퇴하기 버튼 -->
      <div class="form-group row mt-4">
        <div class="col text-center">
          <button type="submit" class="btn btn-danger btn-modern">
            탈퇴하기
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import PasswordCheck from '@/fo/components/mypage/common/PasswordCheck.vue'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useUserStore } from '@/fo/stores/userStore'
import { useModalStore } from '@/fo/stores/modalStore'

const isConfirmed = ref(false)

const router = useRouter()
const alertStore = useAlertStore()
const userStore = useUserStore()
const modalStore = useModalStore()

const userId = ref('')
const applicantName = ref('')
const agreeCheck = ref(false)

const isInvalidUserId = ref(false)
const isInvalidApplicantName = ref(false)
const isInvalidAgreeCheck = ref(false)

const handleSubmit = async (event) => {
  event.preventDefault()

  isInvalidUserId.value = !userId.value.trim()
  isInvalidApplicantName.value = !applicantName.value.trim()
  isInvalidAgreeCheck.value = !agreeCheck.value

  if (
    isInvalidUserId.value ||
    isInvalidApplicantName.value ||
    isInvalidAgreeCheck.value
  ) {
    return
  }

  modalStore.openModal(CommonConfirmModal, {
    title: '회원 탈퇴 확인',
    message: '정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    onConfirm: async () => {
      try {
        const response = await api.$post('/mypage/withdraw', {
          userId: userId.value,
          userNm: applicantName.value,
        })

        if (response.status === 'OK') {
          localStorage.clear()
          userStore.$reset()
          alertStore.show(
            response.message || '회원 탈퇴가 완료되었습니다.',
            'success',
          )
          router.push('/')
        } else {
          alertStore.show(
            response.message || '회원 탈퇴에 실패했습니다.',
            'danger',
          )
        }
      } catch (error) {
        alertStore.show('서버 오류로 인해 탈퇴 처리에 실패했습니다.', 'danger')
      } finally {
        modalStore.closeModal() // 모달 닫기
      }
    },
  })
}
</script>
