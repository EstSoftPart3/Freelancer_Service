<template>
  <div>
    <div class="overflow-hidden mb-3">
      <h4 class="mb-3" style="font-size: 24px">연결된 계정</h4>
    </div>

    <div v-if="!isLoading">
      <form class="needs-validation" @submit.prevent>
        <div class="form-group row mb-4">
          <div class="col-lg-9">
            <div
              v-if="userStore.socialId || isSocialOnlyUser"
              class="d-flex align-items-center justify-content-between p-3 border rounded bg-white shadow-sm"
            >
              <div class="d-flex align-items-center">
                <span v-if="isSocialOnlyUser" class="badge-primary-account me-3"
                  >기본 계정</span
                >
                <span v-else class="badge-integrated me-3">통합된 계정</span>

                <div class="d-flex flex-column">
                  <span class="text-2 fw-bold">Google</span>
                  <span class="text-2 text-muted">{{
                    userStore.userEmail
                  }}</span>
                </div>
              </div>

              <button
                v-if="!isSocialOnlyUser"
                type="button"
                class="btn btn-primary btn-modern"
                @click="handleUnlink"
              >
                해제하기
              </button>
            </div>

            <div
              v-else
              class="form-control text-3 h-auto py-3 bg-light text-center"
            >
              현재 연결된 소셜 계정이 없습니다.
            </div>

            <div
              class="mt-2"
              :style="{
                color: isSocialOnlyUser ? '#6c757d' : '#007bff',
                fontSize: '13px',
              }"
            >
              <i class="bi bi-info-circle-fill me-1"></i>
              <span v-if="isSocialOnlyUser">
                소셜 계정으로 가입된 상태입니다.
              </span>
              <span v-else>
                연동 해제 시 구글 로그인을 이용하실 수 없으며, 기존 아이디와
                비밀번호로 로그인해야 합니다.
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>

    <div v-else class="p-4 text-center">정보 확인 중...</div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import { api } from '@/axios'
import { ref, onMounted } from 'vue'

const userStore = useUserStore()
const alertStore = useAlertStore()
const modalStore = useModalStore()

const isLoading = ref(true)
const isSocialOnlyUser = ref(false)

async function initAccountInfo() {
  try {
    isLoading.value = true
    const response = await api.$get('/mypage/edit/info')
    const data = response.output

    // 1. 소셜 전용 유저 판별
    const isS =
      data.userId?.startsWith('S_') || Number(data.userSignupTypeCd) === 203
    isSocialOnlyUser.value = isS

    // 2. 스토어 업데이트
    userStore.setUser({
      userSq: data.userSq || userStore.userSq,
      userNm: data.userNm || userStore.userNm,
      userEmail: data.userEmail || userStore.userEmail,
      // 소셜ID 보존 (해제 버튼 실종 방지)
      socialId:
        data.socialId || userStore.socialId || (isS ? data.userId : null),
      // 소셜유저(203)면 301(PERSONAL)로 강제 매핑 (유형 오류 방지)
      userTypeCd: isS ? 301 : data.userTypeCd || 301,
    })
  } catch (err) {
    console.error('계정 정보 로드 실패:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initAccountInfo()
})

const handleUnlink = () => {
  if (!userStore.userSq) {
    alertStore.show(
      '사용자 정보를 확인할 수 없습니다. 다시 시도해주세요.',
      'danger',
    )
    return
  }

  modalStore.openModal(CommonConfirmModal, {
    title: '소셜 연동 해제',
    message:
      '     정말로 구글 계정 연동을 해제하시겠습니까?\n     해제 후에는 기존 아이디로 로그인해야 합니다.',
    onConfirm: async () => {
      try {
        const response = await api.$patch('/auth/social/unlink', {
          userSq: userStore.userSq,
        })

        if (response.status === 'OK') {
          userStore.setSocialId(null)
          alertStore.show('연동이 해제되었습니다.', 'success')
          await initAccountInfo()
        }
      } catch (error) {
        alertStore.show('연동 해제 처리에 실패했습니다.', 'danger')
      } finally {
        modalStore.closeModal()
      }
    },
  })
}
</script>

<style scoped>
.text-2 {
  font-size: 14px;
}
.text-3 {
  font-size: 16px;
}

.badge-integrated {
  background-color: #0088cc;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-primary-account {
  background-color: #6c757d;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.btn-modern {
  font-size: 13px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
}
</style>
