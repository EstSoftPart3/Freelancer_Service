<template>
  <div class="modal fade" id="scoutOfferModal" tabindex="-1" aria-labelledby="scoutOfferModalLabel" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow">
        
        <!-- 모달 헤더 -->
        <div class="modal-header bg-white border-bottom-0 pb-0">
          <h5 class="modal-title fw-bold text-dark" id="scoutOfferModalLabel">스카우트 제안하기</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- 제안 폼 -->
        <form @submit.prevent="submitScoutOffer">
          <div class="modal-body bg-f5 p-4">
            
            <!-- 받는 사람 (프리랜서) -->
            <div class="mb-3">
              <label class="form-label text-primary fw-bold">받는 사람</label>
              <div class="form-control-plaintext bg-white px-3 py-2 rounded fw-semibold text-dark">
                {{ freelancerInfo.name }} (프리랜서)
              </div>
            </div>

            <!-- 연관 프로젝트 -->
            <div class="mb-3">
              <label for="projectSq" class="form-label text-primary fw-bold">연관 프로젝트</label>
              <select v-model="form.projectSq" class="form-select border-0 bg-white text-dark" id="projectSq">
                <option value="" selected>선택하세요 (선택 사항)</option>
                <option v-for="proj in projectList" :key="proj.projectSq" :value="proj.projectSq">
                  {{ proj.projectTtl }}
                </option>
              </select>
              <div class="form-text text-muted">* 등록하신 프로젝트 중 연관된 프로젝트를 선택하세요.</div>
            </div>

            <!-- 제안 제목 -->
            <div class="mb-3">
              <label for="scoutOfferTtl" class="form-label text-primary fw-bold">제안 제목 <span class="text-danger">*</span></label>
              <input type="text" v-model="form.scoutOfferTtl" class="form-control border-0 bg-white text-dark" 
                     id="scoutOfferTtl" maxlength="100" placeholder="제안 제목을 입력해주세요." required>
            </div>

            <!-- 제시 단가 -->
            <div class="mb-3">
              <label for="scoutOfferSalary" class="form-label text-primary fw-bold">제시 단가</label>
              <div class="input-group">
                <input type="number" v-model="form.scoutOfferSalary" class="form-control border-0 bg-white text-dark" 
                       id="scoutOfferSalary" step="100000" placeholder="단가를 입력해주세요. (예: 7000000)">
                <span class="input-group-text border-0 bg-white text-secondary">원 / 월 (선택)</span>
              </div>
            </div>

            <!-- 제안 내용 -->
            <div class="mb-3">
              <label for="scoutOfferCnt" class="form-label text-primary fw-bold">제안 내용 <span class="text-danger">*</span></label>
              <textarea v-model="form.scoutOfferCnt" class="form-control border-0 bg-white text-dark" 
                        id="scoutOfferCnt" rows="5" placeholder="제안 내용을 상세히 입력해주세요." required></textarea>
            </div>
          </div>

          <!-- 모달 푸터 -->
          <div class="modal-footer bg-white border-top-0 pt-0 px-4 pb-3">
            <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">취소</button>
            <button type="submit" class="btn btn-primary px-4 fw-bold">제안서 발송</button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
/* global bootstrap, defineExpose */
import { ref, reactive} from 'vue';
import axios from 'axios';

const modalRef = ref(null);
let bsModal = null;

const freelancerInfo = reactive({
  name: '',
  resumeSq: null
});

const projectList = ref([]);

const form = reactive({
  resumeSq: null,
  projectSq: '',
  scoutOfferTtl: '',
  scoutOfferSalary: null,
  scoutOfferCnt: ''
});

const openModal = (freelancer) => {
  freelancerInfo.name = freelancer.name;
  freelancerInfo.resumeSq = freelancer.resumeSq;

  form.resumeSq = freelancer.resumeSq;
  form.projectSq = '';
  form.scoutOfferTtl = `[스카우트 제안] ${freelancer.jobTitle || '개발자'} 스카우트 제안건입니다.`;
  form.scoutOfferSalary = null;
  form.scoutOfferCnt = `안녕하세요 ${freelancer.name}님,\n작성해주신 이력서를 확인하고 스카우트 제안을 드립니다.`;

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
  try {
    await axios.post('/api/v1/scout-offers', form);
    alert('스카우트 제안이 성공적으로 발송되었습니다.');
    if (bsModal) bsModal.hide();
  } catch (error) {
    alert(error.response?.data?.message || '스카우트 제안 전송에 실패했습니다.');
  }
};

defineExpose({ openModal });
</script>