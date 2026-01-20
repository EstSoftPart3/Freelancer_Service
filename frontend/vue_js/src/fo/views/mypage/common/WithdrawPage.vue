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

      <div class="form-group row">
        <label
          class="col-lg-3 col-form-label form-control-label text-2 required"
        >
          {{ isSocialUser ? '본인 확인 이메일' : '아이디' }}
        </label>
        <div class="col-lg-9">
          <input
            class="form-control text-3 h-auto py-2"
            type="text"
            v-model="userInput"
            :placeholder="
              isSocialUser
                ? '보안을 위해 가입된 이메일을 입력해 주세요'
                : '아이디를 입력해 주세요'
            "
          />
          <div class="invalid-feedback text-danger" v-if="isInvalidUserId">
            {{
              isSocialUser
                ? '이메일 주소가 일치하지 않습니다.'
                : '아이디를 올바르게 입력해 주세요.'
            }}
          </div>
          <small v-if="isSocialUser" class="text-muted mt-1 d-block">
            소셜 계정은 아이디 대신 가입된 이메일 주소 인증을 통해 탈퇴가
            가능합니다.
          </small>
        </div>
      </div>

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
import { onMounted } from 'vue'

const isConfirmed = ref(false)
const isSocialUser = ref(false)

const router = useRouter()
const alertStore = useAlertStore()
const userStore = useUserStore()
const modalStore = useModalStore()

const userId = ref('') // 서버 전송용 실제 ID (S_...)
const userEmail = ref('') // 소셜 유저 확인용 이메일
const userInput = ref('') // 화면 입력값 (ID 또는 이메일)
const applicantName = ref('')
const agreeCheck = ref(false)

const isInvalidUserId = ref(false)
const isInvalidApplicantName = ref(false)
const isInvalidAgreeCheck = ref(false)

const handleSubmit = async (event) => {
  event.preventDefault()

  // 본인 확인 검증: 소셜 유저는 이메일과 비교, 일반 유저는 아이디와 비교
  const targetValue = isSocialUser.value ? userEmail.value : userId.value
  isInvalidUserId.value = userInput.value.trim() !== targetValue

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
          userId: userId.value, // 서버로는 실제 식별자인 S_... 값을 보냄
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

//추가 소셜 유저 탈퇴 페이지
async function fetchUserInfo() {
  try {
    const response = await api.$get('/mypage/edit/info', null)
    const data = response.output

    if (
      data.userId?.startsWith('S_') ||
      Number(data.userSignupTypeCd) === 203
    ) {
      isSocialUser.value = true
      isConfirmed.value = true // 비밀번호 체크창 스킵
    }

    // 데이터 저장
    userId.value = data.userId
    userEmail.value = data.userEmail
    applicantName.value = data.userNm

    // [중요] 소셜 유저는 UI에서 S_ 아이디를 보여주지 않기 위해 userInput을 빈 값으로 유지
    // 일반 유저의 경우 편의상 미리 채워줄 수 있으나, 보안상 비워두는 것을 추천하여 userInput은 초기화 상태 유지
  } catch (err) {
    console.error('정보 조회 실패', err)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>
