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
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary mb-3" role="status"></div>
              <p class="text-muted">공고 목록을 불러오는 중입니다...</p>
            </div>
            <template v-else>
              <div class="row" v-if="afltnList.length > 0">
                <div
                  v-for="afltn in afltnList"
                  :key="afltn.sq"
                  class="col-md-4 col-lg-3 mb-4"
                >
                  <article
                    class="post post-medium border-0 pb-0 mb-0 shadow-sm rounded overflow-hidden bg-white d-flex flex-column h-100"
                  >
                    <div
                      class="post-image position-relative d-flex align-items-center justify-content-center bg-light"
                      style="height: 160px; padding: 10px"
                    >
                      <div
                        class="d-block h-100 w-100 position-relative d-flex align-items-center justify-content-center"
                      >
                        <img
                          :src="
                            afltn.profileImg || '/img/logos/Company_logo.png'
                          "
                          @error="
                            $event.target.src = '/img/logos/Company_logo.png'
                          "
                          class="img-fluid rounded-0"
                          style="
                            max-height: 100%;
                            max-width: 100%;
                            object-fit: contain;
                          "
                          alt="기업 이미지"
                        />
                        <div
                          class="position-absolute top-0 end-0 m-2 px-2 py-1 text-white rounded d-flex align-items-center gap-1"
                          style="
                            background-color: rgba(0, 0, 0, 0.5);
                            font-size: 0.8rem;
                          "
                        >
                          <i class="bi bi-eye"></i>
                          <span>{{ formatNum(afltn.viewCnt) }}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      class="post-content p-3 bg-white d-flex flex-column flex-grow-1"
                    >
                      <div
                        class="d-flex justify-content-between align-items-start mb-2"
                      >
                        <h2
                          class="font-weight-bold line-height-2 mb-0 text-truncate"
                          style="font-size: 1rem; max-width: 85%"
                        >
                          <button
                            type="button"
                            class="text-primary fw-bold text-decoration-none border-0 bg-transparent p-0 text-start"
                            @click="clickApplication(afltn)"
                          >
                            {{ afltn.companyNm }}
                          </button>
                        </h2>
                        <button
                          type="button"
                          class="text-muted border-0 bg-transparent p-0"
                          @click="clickScrap(afltn.sq)"
                        >
                          <i
                            class="bi bi-heart-fill"
                            :class="{ active: afltn.isScrap }"
                          ></i>
                        </button>
                      </div>

                      <div
                        class="d-flex flex-wrap gap-1 mb-2 overflow-hidden"
                        style="height: 25px"
                      >
                        <span
                          v-for="tag in afltn.tags"
                          :key="tag"
                          class="badge bg-light text-grey border fw-normal"
                          style="font-size: 0.7rem"
                          >{{ tag }}</span
                        >
                      </div>

                      <div
                        class="description p-2 mb-3 rounded bg-color-grey flex-grow-1"
                        style="min-height: 70px"
                      >
                        <p
                          class="mb-0 text-dark line-clamp-3"
                          style="font-size: 0.85rem; line-height: 1.4"
                        >
                          {{
                            afltn.greeting && afltn.greeting.trim() !== ''
                              ? afltn.greeting
                              : '등록된 소개 문구가 없습니다.'
                          }}
                        </p>
                      </div>

                      <div class="d-grid mt-auto">
                        <button
                          type="button"
                          class="btn btn-sm"
                          :class="
                            userStore.affiliatedCompanySq === afltn.sq
                              ? 'btn-light disabled'
                              : afltn.isApply
                                ? 'btn-light disabled'
                                : 'btn-outline-primary'
                          "
                          @click="clickApplication(afltn)"
                        >
                          {{
                            userStore.affiliatedCompanySq === afltn.sq
                              ? '소속 중'
                              : afltn.isApply
                                ? '소속 신청 완료'
                                : '소속 신청하기'
                          }}
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
              <div v-else class="text-center py-5 border rounded bg-light">
                <i class="bi bi-info-circle text-muted fs-1 mb-3"></i>
                <p class="mb-0 text-muted">등록된 소속 공고가 없습니다.</p>
              </div>
              <CommonPagination
                :currentPage="currentPage"
                :totalPages="totalPages"
                @update:currentPage="currentPage = $event"
              />
            </template>
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
import { useUserStore } from '@/fo/stores/userStore'
import { onMounted, ref, watch } from 'vue'

const isLoading = ref(false)

const modalStore = useModalStore()
const alertStore = useAlertStore()
const affiliationStore = useAffiliationStore()
const userStore = useUserStore()

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
  isLoading.value = true
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
    // console.log(res.output)
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
  } finally {
    isLoading.value = false
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
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 보여줄 줄 수 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
.bi.bi-heart-fill {
  color: lightgray;
}
.bi.bi-heart-fill.active {
  color: red;
}

article.post:hover {
  transform: translateY(-5px);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
