<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="소속 모집 공고"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '소속' }]"
    />
    <div class="container py-4">
      <!-- 검색창 및 필터 영역 -->
      <div
        class="row align-items-center justify-content-between py-3 border-bottom mb-3"
      >
        <!-- 왼쪽: 정렬, 지역 필터 -->
        <div class="col-md-auto">
          <div class="d-flex">
            <select
              class="form-select w-auto me-2"
              v-model="sortType"
              @change="getAfltnList"
            >
              <option selected value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="view">조회순</option>
              <option value="scrap">스크랩순</option>
              <option value="applicant">지원자순</option>
              <option value="distance">거리순</option>
            </select>
            <!-- 부모 선택 -->
            <select
              v-model="selectedParent"
              @change="onParentChange"
              class="form-select w-auto me-2"
            >
              <option selected value="all">시/도 선택</option>
              <option
                v-for="parent in addressCdList"
                :key="parent.areaCodeSq"
                :value="parent.areaCodeSq"
              >
                {{ removeAllTxt(parent.areaSigungu) }}
              </option>
            </select>

            <!-- 자식 선택 -->
            <select
              v-model="addressCd"
              @change="changeFilter"
              class="form-select w-auto"
            >
              <option :value="selectedParent">전체</option>
              <option
                v-for="address in childrenAddressCdList.children"
                :key="address.areaCodeSq"
                :value="address.areaCodeSq"
              >
                {{ address.areaSigungu }}
              </option>
            </select>
          </div>
        </div>
        <!-- 오른쪽: 검색 -->
        <div class="col-md-auto mt-3 mt-md-0">
          <form class="d-flex" @submit.prevent="changeFilter">
            <select v-model="searchType" class="form-select w-auto me-2">
              <option selected value="all">전체</option>
              <option value="company">회사명</option>
              <option value="content">내용</option>
              <option value="tag">태그</option>
            </select>
            <input
              v-model="keyword"
              class="form-control w-auto me-2"
              type="search"
              placeholder="검색어 입력"
              @keyup.enter="submit"
            />
            <button class="btn btn-primary px-3" type="submit">검색</button>
          </form>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="blog-posts">
            <div class="row" v-if="afltnList.length > 0">
              <!-- 카드 -->
              <div
                v-for="afltn in afltnList"
                :key="afltn"
                class="col-md-4 col-lg-3"
              >
                <article
                  class="post post-medium border-0 pb-0 mb-5 shadow-sm rounded overflow-hidden bg-white"
                >
                  <!-- 이미지 영역 -->
                  <div
                    class="post-image position-relative"
                    style="height: 160px"
                  >
                    <div class="d-block h-100 w-100 position-relative">
                      <img
                        :src="
                          afltn.profileImg ||
                          'https://freelancer-service.s3.ap-northeast-2.amazonaws.com/12461_3.png'
                        "
                        @error="
                          $event.target.src =
                            'https://freelancer-service.s3.ap-northeast-2.amazonaws.com/12461_3.png'
                        "
                        class="img-fluid img-thumbnail img-thumbnail-no-borders rounded-0 h-100 w-100"
                        style="object-fit: cover"
                        alt="기업 이미지"
                      />
                      <!-- 조회수 뱃지 -->
                      <div
                        class="position-absolute top-0 end-0 m-2 px-2 py-1 text-white rounded d-flex align-items-center gap-1"
                        style="
                          background-color: rgba(0, 0, 0, 0.5);
                          font-size: 0.85rem;
                        "
                      >
                        <i class="bi bi-eye"></i>
                        <span>{{ formatNum(afltn.viewCnt) }}</span>
                      </div>
                    </div>
                  </div>
                  <!-- 내용 영역 -->
                  <div class="post-content p-3 bg-white">
                    <div
                      class="d-flex justify-content-between align-items-center mb-2"
                    >
                      <h2
                        class="font-weight-semibold text-5 line-height-6 mb-0"
                        style="font-size: 1.1rem"
                      >
                        <button
                          type="button"
                          class="text-primary fw-bold text-decoration-none"
                          @click="clickApplication(afltn)"
                        >
                          {{ afltn.companyNm }}
                        </button>
                      </h2>
                      <button
                        type="button"
                        class="text-muted"
                        style="text-decoration: none"
                        @click="clickScrap(afltn.sq)"
                      >
                        <i
                          class="bi bi-heart-fill"
                          :class="{ active: afltn.isScrap }"
                        ></i>
                      </button>
                    </div>
                    <!-- 키워드 태그 뱃지 -->
                    <div class="d-flex flex-wrap gap-2 mb-3">
                      <span
                        v-for="tag in afltn.tags"
                        :key="tag"
                        class="badge bg-light text-grey border"
                        >{{ tag }}</span
                      >
                    </div>
                    <!-- 설명 영역 -->
                    <div
                      class="description p-3 mb-3 rounded bg-color-grey"
                      v-if="afltn.greeting && afltn.greeting.trim() != ''"
                    >
                      <p class="mb-0 text-dark">
                        {{ afltn.greeting }}
                      </p>
                    </div>
                    <div class="d-grid">
                      <button
                        type="button"
                        class="btn btn-sm btn-light"
                        :class="{ 'text-primary': !afltn.isApply }"
                        @click="clickApplication(afltn)"
                      >
                        {{ afltn.isApply ? '소속 신청 완료' : '소속 신청하기' }}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>
            <div v-else>소속 공고가 없습니다.</div>
            <CommonPagination
              :currentPage="currentPage"
              :totalPages="totalPages"
              @update:currentPage="currentPage = $event"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
import { api } from '@/axios'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import AffiliationRecruit from '@/fo/components/company/AffiliationRecruit.vue'
import { useAffiliationStore } from '@/fo/stores/AffiliationStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import { onMounted, ref, watch } from 'vue'

const modalStore = useModalStore()
const alertStore = useAlertStore()
const affiliationStore = useAffiliationStore()

const afltnList = ref([])

const formatNum = (num) => {
  if (num < 1000) {
    return num.toString()
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  } else {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
}

// 한 화면에 보일 박스 숫자 설정
const size = 8

const currentPage = ref(1)

const totalPages = ref(1)

// 필터
const searchType = ref('all')
const keyword = ref('')
const sortType = ref('latest')

// 주소 코드 리스트
const addressCdList = ref([])
const childrenAddressCdList = ref({})
const selectedParent = ref('all') // 선택된 부모 코드
const addressCd = ref('all')

// 부모 변경 시 자식 초기화
const onParentChange = () => {
  addressCd.value = 'all' // 자식 초기화
  childrenAddressCdList.value = {}
  const parent = addressCdList.value.find(
    (item) => item.areaCodeSq === selectedParent.value,
  )
  childrenAddressCdList.value = parent || {}
  addressCd.value = selectedParent.value
  getAfltnList()
}

// 주소 필터 리스트 불러오기
const getAllAddress = async () => {
  try {
    const res = await api.$get(`/affiliation/address`)
    if (res.status == 'OK') {
      addressCdList.value = res.output
        .filter((tag) => tag.parentAreaCodeSq === null)
        .map((parent) => {
          const children = res.output.filter(
            (cd) => cd.parentAreaCodeSq === parent.areaCodeSq,
          )
          return {
            ...parent,
            children,
          }
        })
    }
  } catch (error) {
    alertStore.show('주소 정보 로드에 실패하였습니다.', 'danger')
  }
}

// 공고 목록 가져오기
const getAfltnList = async () => {
  try {
    const searchKeyword = keyword.value.trim()
    const searchFilter =
      searchKeyword == null || searchKeyword == ''
        ? ''
        : `&searchType=${searchType.value}&keyword=${searchKeyword}`

    const address = addressCd.value
    const addressFilter =
      address == null || address == 'all' ? '' : `&addressCd=${addressCd.value}`

    const res = await api.$get(
      `/affiliation?page=${currentPage.value}&size=${size}&sortType=${sortType.value}${searchFilter}${addressFilter}`,
    )
    console.log(res.output)
    if (res) {
      if (res.output.totalElements == 0) {
        totalPages.value = 1
      } else {
        totalPages.value = Math.floor(
          (res.output.totalElements + size - 1) / size,
        )
      }
      afltnList.value = res.output.companies
      affiliationStore.viewerSq = res.output.viewerSq
    }
  } catch (error) {
    alertStore.show('소속 공고를 불러올 수 없습니다.', 'danger')
  }
}

// 스크랩 버튼 클릭
const clickScrap = async (sq) => {
  if (!affiliationStore.viewerSq) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
  }
  try {
    const res = await api.$post(`/affiliation/${sq}/scrap`)
    if (res.status == 'OK') {
      alertStore.show(res.message, 'success')
      getAfltnList()
    } else {
      alertStore.show('추천 반영에 실패하였습니다.', 'danger')
    }
  } catch (error) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
  }
}

// 소속 신청하기 모달
const clickApplication = async (afltnInfo) => {
  await api.$patch(`/affiliation/${afltnInfo.sq}/increment-view`)

  modalStore.openModal(AffiliationRecruit, {
    afltnInfo: afltnInfo,
    onConfirm: getAfltnList,
  })
}

// 검색 또는 채택 상태 변경 시 전체 페이지 수가 변경되므로 현재 페이지를 1페이지로 초기화 후 리스트 갱신
const changeFilter = () => {
  currentPage.value = 1
  getAfltnList()
}

// 전체 글자 없애기
const removeAllTxt = (str) => {
  if (str.endsWith('전체')) {
    return str.slice(0, -2)
  }
  return str
}

watch(currentPage, () => {
  getAfltnList()
})

onMounted(() => {
  getAllAddress()
  getAfltnList()
})
</script>
<style>
.bi.bi-heart-fill {
  color: pink;
}
.bi.bi-heart-fill.active {
  color: red;
}
</style>
