<template>
  <div>
    <div class="modal-header">
      <h4 class="modal-title text-bold" id="schoolSearchModalLabel">
        {{ info.isApply ? '소속 정보' : '소속 신청하기' }}
      </h4>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        @click="closeModal"
        aria-hidden="true"
      ></button>
    </div>
    <div class="modal-body bg-f5">
      <!-- 회색 배경 -->

      <!-- 회사명 -->
      <div class="mb-3">
        <label for="companyName" class="form-label text-primary text-bold"
          >회사명</label
        >
        <div class="text-dark" id="companyName">
          {{ info.companyNm }}
        </div>
      </div>

      <!-- 대표자명 -->
      <div class="mb-3">
        <label for="ceoName" class="form-label text-primary text-bold"
          >대표자명</label
        >
        <div class="text-dark" id="ceoName">{{ info.ceoNm }}</div>
      </div>

      <!-- 개업년수 -->
      <div class="mb-3">
        <label for="yearsInBusiness" class="form-label text-primary text-bold"
          >개업년수</label
        >
        <!-- [수정] 오픈일자부터 개업일수 계산 -->
        <div class="text-dark" id="yearsInBusiness">
          {{ info.openYear }}년차
        </div>
      </div>

      <!-- 회사위치 -->
      <div class="mb-3">
        <label for="companyLocation" class="form-label text-primary text-bold"
          >회사위치</label
        >
        <div
          class="text-dark d-flex align-items-center gap-2"
          id="companyLocation"
        >
          {{ info.address }}
          <button
            type="button"
            class="btn btn-primary btn-xs py-1 px-2 text-1"
            @click="openKakaoRoute"
            title="카카오 맵 경로찾기"
          >
            <i class="bi bi-cursor-fill me-1"></i>경로 찾기
          </button>
        </div>
      </div>

      <!-- 회사 링크 -->
      <div class="mb-3">
        <label
          for="companyDescription"
          class="form-label text-primary text-bold"
          >회사 홈페이지</label
        >
        <div class="text-dark" id="companyDescription">
          <a
            :href="companyUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="company-link"
          >
            <span>{{ info.companyUrl }}</span>
            <i class="bi bi-link-45deg ms-1" aria-hidden="true"></i>
          </a>
        </div>
      </div>

      <!-- 간단한 설명 -->
      <div class="mb-3">
        <label
          for="companyDescription"
          class="form-label text-primary text-bold"
          >회사 설명</label
        >
        <div class="text-dark" id="companyDescription">
          {{ info.greeting }}
        </div>
      </div>

      <!-- 관련 태그 -->
      <div class="mb-3">
        <label
          for="companyDescription"
          class="form-label text-primary text-bold"
          >관련 태그</label
        >
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            v-for="tag in afltnInfo.tags"
            :key="tag"
            class="btn btn-rounded btn-3d btn-light"
            >{{ tag }}</span
          >
        </div>
      </div>

      <!-- 이력서 선택 -->
      <div
        class="mb-3"
        v-if="!afltnInfo.isApply && userStore.userType !== 'COMPANY'"
      >
        <label for="resume" class="form-label text-primary text-bold"
          >소속 신청할 이력서</label
        >

        <!-- [추가] 선택한 이력서로 이력서 이름 변경 -->
        <div class="text-dark" id="resume">
          선택한 이력서:
          <a href="#" class="text-primary" @click="openResumeModal">
            <span
              v-if="
                affiliationStore.resume.resumeTtl != null &&
                affiliationStore.resume.resumeTtl != ''
              "
              >{{ affiliationStore.resume.resumeTtl }}</span
            >
            <span v-else>이력서를 선택하세요.</span></a
          >
        </div>
      </div>

      <!-- 간단한 자기소개 -->
      <div
        class="mb-3"
        v-if="!afltnInfo.isApply && userStore.userType !== 'COMPANY'"
      >
        <label for="selfIntroduction" class="form-label text-primary text-bold"
          >간단한 자기소개</label
        >
        <textarea
          class="form-control border-0 bg-white"
          id="selfIntroduction"
          rows="4"
          placeholder="자기소개를 입력해주세요."
          v-model="affiliationStore.greeting"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button
        v-if="!afltnInfo.isApply && userStore.userType !== 'COMPANY'"
        type="button"
        class="btn btn-primary"
        @click="clickRecruit"
      >
        소속 신청하기
      </button>
      <template v-if="afltnInfo.isApply">
        <button
          v-if="userStore.affiliatedCompanySq === afltnInfo.sq"
          type="button"
          class="btn btn-light"
          disabled
        >
          소속 중
        </button>
        <button
          v-else
          type="button"
          class="btn btn-primary"
          @click="clickCancel"
        >
          신청 취소
        </button>
      </template>
      <button
        type="button"
        class="btn btn-light"
        data-bs-dismiss="modal"
        @click="closeModal"
      >
        닫기
      </button>
    </div>
  </div>
</template>
<script setup>
import { api } from '@/axios'
import { useAffiliationStore } from '@/fo/stores/AffiliationStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import { useUserStore } from '@/fo/stores/userStore'
import { computed, defineProps } from 'vue'
import CommonConfirmModal from '../common/CommonConfirmModal.vue'
import ResumeListModal from '../mypage/common/ResumeListModal.vue'

const props = defineProps({
  afltnInfo: { type: Object, default: () => ({}) },
  onConfirm: { type: Function, default: () => {} },
})
// [수정] 변수명 충돌 방지를 위해 info로 명칭 변경
const info = computed(() => props.afltnInfo)

const modalStore = useModalStore()
const alertStore = useAlertStore()
const affiliationStore = useAffiliationStore()
const userStore = useUserStore()

const closeModal = () => {
  affiliationStore.resetGreeting()
  affiliationStore.resetResume()
  modalStore.closeModal()
}

// 소속 신청하기 버튼 클릭 이벤트
const clickRecruit = async () => {
  if (affiliationStore.viewerSq == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }

  // 1. 권한 체크 (사전 검사)
  // if (userStore.userType === 'COMPANY') {
  //   alertStore.show('기업 회원은 소속 신청할 수 없습니다.', 'danger')
  //   return
  // }

  //이력서 선택 체크
  if (
    !affiliationStore.resume.resumeSq ||
    affiliationStore.resume.resumeSq == 0
  ) {
    alertStore.show('이력서를 선택해주세요.', 'danger')
    return
  }

  modalStore.openModal(CommonConfirmModal, {
    title: '소속 신청',
    message: `${info.value.companyNm} 소속 신청하시겠습니까?`,
    onConfirm: async () => {
      try {
        const res = await api.$post(`/affiliation/apply`, {
          companySq: info.value.sq,
          resumeSq: affiliationStore.resume.resumeSq,
          companyApplicationGreetingTxt: affiliationStore.greeting,
        })

        if (res.status == 'CREATED') {
          // [성공 시 시나리오]
          alertStore.show(res.message, 'success')

          // 부모 리스트 갱신 (onConfirm 실행)
          if (props.onConfirm) props.onConfirm()

          // [핵심] 모든 모달창을 닫아버림 (컨펌창 + 신청창 동시 제거)
          modalStore.closeAllModals()
        } else {
          alertStore.show(res.message, 'danger')
          modalStore.closeModal() // 실패 시 컨펌창만 닫기
        }
      } catch (error) {
        alertStore.show('소속 신청에 실패했습니다.', 'danger')
        modalStore.closeModal() // 에러 시 컨펌창만 닫기
      }
    },
  }) // 수정 요청이 아닌 확인용 코드입니다.
  console.log('현재 스토어의 내 위치 위도:', userStore.userLat)
  console.log('현재 스토어의 내 위치 경도:', userStore.userLng)
}

// 소속 신청 취소 버튼 클릭 이벤트
const clickCancel = async () => {
  modalStore.openModal(CommonConfirmModal, {
    title: '신청 취소',
    message: '소속 신청을 취소하시겠습니까?',
    onConfirm: async () => {
      try {
        // [수정] AffiliatedJobApplicationsPage.vue와 동일한 API 경로 및 방식($patch) 사용
        const res = await api.$patch(
          `/mypage/applications/${info.value.applicationSq}`,
        )

        if (res.status == 'OK') {
          alertStore.show(res.message, 'success')

          // 목록 갱신 및 모든 모달 닫기
          if (props.onConfirm) props.onConfirm()
          modalStore.closeAllModals()
        }
      } catch (error) {
        alertStore.show('신청 취소 처리에 실패했습니다.', 'danger')
        modalStore.closeModal()
      }
    },
  })
}

// 이력서 선택
const openResumeModal = () => {
  if (affiliationStore.viewerSq == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  modalStore.openModal(ResumeListModal)
}

// 카카오 맵 경로찾기 오픈
const openKakaoRoute = () => {
  const baseUrl = 'https://map.kakao.com/link/to/'
  const destName = encodeURIComponent(info.value.companyNm)
  const destLat = info.value.latitude
  const destLng = info.value.longitude

  if (!destLat || !destLng) {
    alertStore.show('해당 기업의 위치 정보가 등록되지 않았습니다.', 'danger')
    return
  }

  let url = `${baseUrl}${destName},${destLat},${destLng}`

  // 출발지 정보(내 위치)가 있다면 추가
  if (userStore.userLat && userStore.userLng) {
    const startName = encodeURIComponent('내 위치')
    url += `/from/${startName},${userStore.userLat},${userStore.userLng}`
  }

  window.open(url, '_blank')
}

//회사 사이트 주소
const companyUrl = computed(() => {
  const url = info.value.companyUrl?.trim()

  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  return `https://${url}`
})
</script>
<style>
.text-bold {
  font-weight: bold;
}
.bg-f5 {
  background: #f5f5f5;
}
.btn-xs {
  font-size: 0.75rem;
}
.company-link {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

.company-link:hover,
.company-link:focus,
.company-link:active,
.company-link:visited {
  color: #000 !important;
  text-decoration: none !important;
  cursor: pointer;
}
</style>
