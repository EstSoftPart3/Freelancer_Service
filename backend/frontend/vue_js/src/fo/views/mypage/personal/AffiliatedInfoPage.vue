<template>
  <div>
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">소속 정보</h4>
      </div>
    </div>
    <hr class="my-2" />

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="card p-4 mt-3">
      <p class="text-muted mb-0">{{ error }}</p>
    </div>

    <template v-else-if="info">
      <!-- 프로필 이미지 -->
      <div class="text-center mb-4">
        <div class="d-inline-block">
          <div class="rounded-circle overflow-hidden">
            <img
              v-if="info.profileImageUrl"
              :src="info.profileImageUrl"
              alt="Profile Image"
              class="img-fluid object-fit-cover"
            />
            <div v-else class="rounded-circle">
              <i class="fas fa-building text-muted"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 기업명 + 채용 뱃지 -->
      <div class="form-group row align-items-center">
        <label class="col-lg-2 col-form-label text-2">기업명</label>
        <div class="col-lg-10 d-flex align-items-center gap-2">
          <span
            class="form-control text-3 h-auto py-2 border-0"
            style="flex: none; width: auto; padding-right: 0"
            >{{ info.companyNm }}</span
          >
          <span
            v-if="info.companyIsRecruitingYn === 'Y'"
            class="badge bg-primary"
            >채용중</span
          >
          <span v-else class="badge bg-secondary">채용 마감</span>
        </div>
      </div>

      <!-- 대표자 이름 -->
      <div class="form-group row align-items-center">
        <label class="col-lg-2 col-form-label text-2">대표자 이름</label>
        <div class="col-lg-10">
          <input
            class="form-control text-3 h-auto py-2 border-0"
            type="text"
            :value="info.companyCeoNm || '-'"
            readonly
          />
        </div>
      </div>

      <!-- 개업일자 -->
      <div class="form-group row align-items-center">
        <label class="col-lg-2 col-form-label text-2">개업일자</label>
        <div class="col-lg-10">
          <input
            class="form-control text-3 h-auto py-2 border-0"
            type="text"
            :value="info.companyOpenDt || '-'"
            readonly
          />
        </div>
      </div>

      <!-- 기업 URL -->
      <div v-if="info.companyUrl" class="form-group row align-items-center">
        <label class="col-lg-2 col-form-label text-2">기업 URL</label>
        <div class="col-lg-10">
          <input
            class="form-control text-3 h-auto py-2 border-0"
            type="text"
            :value="info.companyUrl"
            readonly
          />
        </div>
      </div>

      <!-- 주소 -->
      <div class="form-group row align-items-center">
        <label class="col-lg-2 col-form-label text-2">주소</label>
        <div class="col-lg-10">
          <input
            class="form-control text-3 h-auto py-2 border-0"
            type="text"
            :value="info.address || '-'"
            readonly
          />
        </div>
      </div>

      <!-- 입사일 -->
      <div class="form-group row align-items-center">
        <label class="col-lg-2 col-form-label text-2">입사일</label>
        <div class="col-lg-10">
          <input
            class="form-control text-3 h-auto py-2 border-0"
            type="text"
            :value="info.joinDt || '-'"
            readonly
          />
        </div>
      </div>

      <!-- 소속 탈퇴 -->
      <div class="d-flex justify-content-end mt-3">
        <button type="button" class="btn btn-danger" @click="confirmLeave">
          소속 탈퇴
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/axios'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'

const router = useRouter()
const userStore = useUserStore()
const alertStore = useAlertStore()
const modalStore = useModalStore()

const info = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await api.$get('/mypage/applications/info')
    info.value = res.output
  } catch (e) {
    const msg = e.response?.data?.message
    if (msg === '현재 소속된 기업이 없습니다.') {
      error.value = '현재 소속된 기업이 없습니다.'
    } else {
      error.value = '소속 정보를 불러올 수 없습니다.'
    }
  } finally {
    loading.value = false
  }
})

const confirmLeave = () => {
  modalStore.openModal(CommonConfirmModal, {
    title: '소속 탈퇴 안내',
    message:
      '• 소속 탈퇴 시 해당 소속에서 즉시 제외됩니다.\n• 탈퇴 후 동일 소속에 재가입하려면 처음부터 다시 신청해야 합니다.\n• 탈퇴 처리된 이력은 취소할 수 없습니다.',
    confirmText: '탈퇴',
    confirmClass: 'btn-danger',
    cancelText: '취소',
    onConfirm: async () => {
      try {
        await api.$patch(
          '/mypage/applications/withdraw',
          {},
          { withCredentials: true },
        )
        userStore.isAffiliated = 'N'
        userStore.affiliatedCompanySq = null
        localStorage.setItem('isAffiliated', 'N')
        modalStore.closeModal()
        alertStore.show('소속 탈퇴가 완료되었습니다.', 'success')
        router.push('/mypage')
      } catch (e) {
        modalStore.closeModal()
        alertStore.show('소속 탈퇴 중 오류가 발생했습니다.', 'danger')
      }
    },
  })
}
</script>

<style scoped>
.rounded-circle {
  width: 120px;
  height: 120px;
  background-color: #f2f2f2;
  display: flex;
  justify-content: center;
  align-items: center;
}
.fas.fa-building.text-muted {
  font-size: 50px;
}

.form-group.row.align-items-center {
  margin-bottom: 20px;
}

.form-group label {
  font-size: 16px;
}

.form-control {
  font-size: 16px;
}

.recruitment-content {
  min-height: 120px;
  background-color: #f9f9f9;
  white-space: pre-line;
}

input[readonly] {
  border: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  pointer-events: none;
}
</style>
