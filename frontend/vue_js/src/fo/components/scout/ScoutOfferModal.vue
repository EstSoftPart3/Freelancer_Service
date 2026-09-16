<template>
  <div
    class="modal fade"
    id="scoutOfferModal"
    tabindex="-1"
    aria-labelledby="scoutOfferModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border shadow-sm rounded-2 overflow-hidden">
        
        <!-- 모달 헤더 -->
        <div class="modal-header px-4 py-3 border-bottom bg-white d-flex align-items-center justify-content-between">
          <h4 class="modal-title fs-4 fw-bold text-dark m-0" id="scoutOfferModalLabel">스카우트 제안하기</h4>
          <button
            type="button"
            class="btn-close fs-6"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <!-- 제안 폼 -->
        <form @submit.prevent="submitScoutOffer">
          <div class="modal-body bg-light p-4">
            
            <!-- 받는 사람 (프리랜서) -->
            <div class="mb-4">
              <label class="form-label text-primary fw-bold mb-1">받는 사람</label>
              <div class="text-dark fw-normal py-1">
                {{ freelancerInfo.name || '이름없음' }} (프리랜서)
              </div>
            </div>

            <!-- 연관 프로젝트 -->
            <div class="mb-4">
              <label for="projectSq" class="form-label text-primary fw-bold mb-2">연관 프로젝트</label>
              <select
                v-model="form.project_sq"
                class="form-select border-0 shadow-sm bg-white text-dark py-2 px-3 rounded-2"
                id="projectSq"
              >
                <option :value="null" selected>선택하세요 (선택 사항)</option>
                <option v-for="proj in projectList" :key="proj.projectSq || proj.project_sq" :value="proj.projectSq || proj.project_sq">
                  {{ proj.projectTtl || proj.title }}
                </option>
              </select>
              <div class="form-text text-muted mt-2 fs-7">* 등록하신 프로젝트 중 연관된 프로젝트를 선택하세요.</div>
            </div>

            <!-- 제안 제목 -->
            <div class="mb-4">
              <label for="scoutOfferTtl" class="form-label text-primary fw-bold mb-2">
                제안 제목 <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                v-model="form.title"
                class="form-control border-0 shadow-sm bg-white text-dark py-2 px-3 rounded-2"
                id="scoutOfferTtl"
                maxlength="100"
                placeholder="제안 제목을 입력해주세요."
                required
              >
            </div>

            <!-- 제시 단가 -->
            <div class="mb-4">
              <label for="scoutOfferSalary" class="form-label text-primary fw-bold mb-2">제시 단가</label>
              <div class="input-group shadow-sm rounded-2 overflow-hidden">
                <input
                  type="number"
                  v-model.number="form.offered_pay"
                  class="form-control border-0 bg-white text-dark py-2 px-3"
                  id="scoutOfferSalary"
                  step="100000"
                  placeholder="단가를 입력해주세요. (예: 4000000)"
                >
                <span class="input-group-text border-0 bg-white text-dark px-3 fw-normal">원 / 월 (선택)</span>
              </div>
            </div>

            <!-- 제안 내용 -->
            <div class="mb-2">
              <label for="scoutOfferCnt" class="form-label text-primary fw-bold mb-2">
                제안 내용 <span class="text-danger">*</span>
              </label>
              <textarea
                v-model="form.content"
                class="form-control border-0 shadow-sm bg-white text-dark p-3 rounded-2"
                id="scoutOfferCnt"
                rows="5"
                placeholder="제안 내용을 상세히 입력해주세요."
                required
              ></textarea>
            </div>

          </div>

          <!-- 모달 푸터 -->
          <div class="modal-footer px-4 py-3 border-top bg-white d-flex justify-content-end align-items-center gap-2">
            <button type="submit" class="btn btn-primary px-4 py-2 fw-bold" :disabled="isSubmitting">
              {{ isSubmitting ? '발송 중...' : '제안서 발송' }}
            </button>
            <button type="button" class="btn btn-outline-secondary px-4 py-2" data-bs-dismiss="modal">
              닫기
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
/* global bootstrap, defineExpose */
import { ref, reactive } from 'vue';
import axios from 'axios';

const modalRef = ref(null);
let bsModal = null;
const isSubmitting = ref(false);

const freelancerInfo = reactive({
  name: '',
  freelancerSq: null
});

const projectList = ref([]);

const form = reactive({
  freelancer_sq: null,
  project_sq: null,
  title: '',
  content: '',
  offered_pay: null,
});

const openModal = (freelancer) => {
  const target = freelancer || {};
  
  freelancerInfo.name = target.name || target.userNm || target.userName || '';
  
  const fSq = target.freelancerSq || target.freelancer_sq || target.userSq || target.user_sq || target.resumeSq;
  freelancerInfo.freelancerSq = fSq ? Number(fSq) : null;

  form.freelancer_sq = freelancerInfo.freelancerSq;
  form.project_sq = null;
  form.title = target.jobTitle 
    ? `${target.jobTitle} 스카우트 제안건입니다.` 
    : '백엔드 Java 개발자 스카우트 제안건입니다.';
  form.offered_pay = target.salary ? Number(target.salary) : null;
  form.content = '안녕하세요. 채용 담당자입니다.';
  
  const defaultExpireDate = new Date();
  defaultExpireDate.setDate(defaultExpireDate.getDate() + 14);
  form.expired_at = defaultExpireDate.toISOString().replace('T', ' ').substring(0, 19);

  loadCompanyProjects();

  if (!bsModal) {
    bsModal = new bootstrap.Modal(modalRef.value);
  }
  bsModal.show();
};

const loadCompanyProjects = async () => {
  try {
    const res = await axios.get('/api/v1/company/projects');
    projectList.value = res.data.data || [];
  } catch (err) {
    console.error('프로젝트 목록 로드 실패:', err);
  }
};

const submitScoutOffer = async () => {
  if (!form.freelancer_sq) {
    alert('제안할 프리랜서 정보가 정확하지 않습니다.');
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await axios.post('/api/v1/scouts', form);
    
    if (res.data) {
      alert('스카우트 제안이 성공적으로 발송되었습니다.');
      if (bsModal) bsModal.hide();
    }
  } catch (error) {
    console.error('스카우트 제안 실패:', error);
    alert(error.response?.data?.message || '스카우트 제안 전송에 실패했습니다.');
  } finally {
    isSubmitting.value = false;
  }
};

defineExpose({ openModal });
</script>

<style scoped>
.fs-7 {
  font-size: 0.825rem;
}

.modal-title {
  font-size: 1.35rem !important;
  letter-spacing: -0.5px;
}

.form-control:focus,
.form-select:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15) !important;
}
</style>