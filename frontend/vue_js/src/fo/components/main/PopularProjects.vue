<template>
  <section class="popular-projects-section">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="section-header-left">
          <h2>인기 프로젝트</h2>
          <p class="text-muted mb-0">현재 인기 프로젝트를 확인해보세요.</p>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="filter-tabs">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              :class="['btn', 'btn-sm', 'me-2', activeFilter === tab.key ? 'btn-primary' : 'btn-outline-secondary']"
              @click="setActiveFilter(tab.key)"
            >
              {{  tab.label }}
            </button>
          </div>
          <button class="btn btn-outline-primary btn-sm" @click="$emit('go-to-list')">
            더보기 <i class="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>

      <div v-if="isLoadingProjects" class="text-center py-5" style="min-height: 300px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩 중</span>
        </div>
      </div>

      <div v-else-if="popularProjects.length === 0" class="text-center py-5 empty-message" style="min-height: 300px;">
        <p class="text-muted">표시할 프로젝트가 없습니다.</p>
      </div>

      <div v-else class="row" style="min-height: 300px;">
        <div
          v-for="project in displayedProjects"
          :key="project.projectSq"
          class="col mb-4"
        >
          <div class="project-card card h-100" @click="handleProjectCardClick(project)" style="cursor: pointer;">
            <img
              v-if="project.projectImageUrl"
              :src="project.projectImageUrl"
              class="card-img-top"
              alt="프로젝트 이미지"
            />
            <div class="card-body">
              <h5 class="card-title">{{ project.projectTtl }}</h5>
              <p class="card-text text-muted">{{ project.companyNm }}</p>
              <p class="card-text small text-muted">
                {{ project.address }} / {{ project.devGradeNm }} / {{ project.requiredEduLv1 }}
              </p>
              <div class="d-flex gap-1 flex-wrap mt-2">
                <span
                  v-for="skill in project.reqSkills?.slice(0, 3)"
                  :key="skill"
                  class="badge bg-primary"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/fo/stores/userStore';
import { api } from '@/axios';

const router = useRouter();
const userStore = useUserStore();

defineEmits(['go-to-list']);

const filterTabs = [
  { key: 'views', label: '조회순' },
  { key: 'scraps', label: '스크랩순' },
  { key: 'applications', label: '지원순' }
];

const activeFilter = ref('views');
const popularProjects = ref([]);
const allPopularProjectsData = ref({
  viewCount: [],
  scrapCount: [],
  applicantCount: []
});

const isLoadingProjects = ref(false);

const displayedProjects = computed(() => {
  return popularProjects.value.slice(0, 5);
});

const loadPopularProjects = async () => {
  try {
    isLoadingProjects.value = true;
    const response = await api.$get('/projects/top');

    if (response.output) {
      allPopularProjectsData.value = {
        viewCount: response.output.viewCount || [],
        scrapCount: response.output.scrapCount || [],
        applicantCount: response.output.applicantCount || []
      };
    }

    updatePopularProjects('views');
  } catch (error) {
    console.error('인기 프로젝트 로드 실패: ', error);
    popularProjects.value = [];
  } finally {
    isLoadingProjects.value = false;
  }
};

const updatePopularProjects = (filter) => {
  switch(filter) {
    case 'views':
      popularProjects.value = allPopularProjectsData.value.viewCount || [];
      break;
    case 'scraps':
      popularProjects.value = allPopularProjectsData.value.scrapCount || [];
      break;
    case 'applications':
      popularProjects.value = allPopularProjectsData.value.applicantCount || [];
      break;
    default:
      popularProjects.value = allPopularProjectsData.value.viewCount || [];
  }
};

const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  updatePopularProjects(filter);
};

const handleProjectCardClick = (project) => {
  const userType = userStore.getUserType;
  if (userType === 'PERSONAL') {
    router.push(`/api/project/spec/user/${project.projectSq}`);
  } else if (userType === 'COMPANY') {
    router.push(`/api/project/spec/company/${project.projectSq}`);
  } else {
    router.push(`/api/project/spec/user/${project.projectSq}`);
  }
}

onMounted(() => {
  loadPopularProjects();
});

</script>

<style scoped>
.popular-projects-section {
  padding: 84px 0;
  margin-bottom: 140px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.section-header-left h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.section-header-left p {
  font-size: 1rem;
}

.filter-tabs .btn {
  border-radius: 25px;
  padding: 0.4rem 1.2rem;
  font-weight: 500;
  white-space: nowrap;
}

.empty-message p {
  padding-top: 10%;
  font-size: 1.4rem;
  font-weight: 500;
}

.popular-projects-section .container {
  max-width: 1600px;
}

.popular-projects-section .row {
  display: grid;
  grid-template-columns: repeat(5, minmax(240px, 1fr));
  gap: 1.5rem;
}

.popular-projects-section .col {
  padding: 0;
}

.project-card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
}

.project-card .card-body {
  padding: 1.375rem;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.project-card .card-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.project-card .card-text {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

@media (max-width: 1400px) {
  .popular-projects-section .row {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .popular-projects-section .row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .section-header-left h2 {
    font-size: 2rem;
  }

  .empty-message p {
    padding-top: 10%;
    font-size: 1.3rem;
  }

  .popular-projects-section .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }

  .popular-projects-section .row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .popular-projects-section {
    padding: 63px 0;
    margin-bottom: 90px;
  }

  .empty-message p {
    padding-top: 10%;
    font-size: 1.3rem;
  }

  .popular-projects-section .row {
    grid-template-columns: 1fr;
  }
}

</style>