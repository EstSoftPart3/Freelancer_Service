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
        <div class="text-dark" id="companyLocation">
          {{ info.address }}
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
      <div class="mb-3" v-if="!afltnInfo.isApply">
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
      <div class="mb-3" v-if="!afltnInfo.isApply">
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
        v-if="!afltnInfo.isApply"
        type="button"
        class="btn btn-primary"
        @click="clickRecruit"
      >
        소속 신청하기
      </button>
      <button
        v-if="afltnInfo.isApply"
        type="button"
        class="btn btn-light"
        disabled
      >
        소속 신청 완료
      </button>
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

  modalStore.openModal(CommonConfirmModal, {
    title: '소속 신청',
    message: `${info.value.companyNm} 소속 신청하시겠습니까?`,
    onConfirm: async () => {
      // 1. 권한 체크
      if (localStorage.getItem('userType') == 'COMPANY') {
        alertStore.show('기업 회원은 소속 신청할 수 없습니다.', 'danger')
        modalStore.closeModal() // 컨펌창만 닫기
        return
      }

      // 1-1. 현재 소속 중인 회사에 재신청 차단
      if (userStore.affiliatedCompanySq && info.value.sq == userStore.affiliatedCompanySq) {
        alertStore.show('현재 소속 중인 기업에는 소속 신청을 할 수 없습니다.', 'danger')
        modalStore.closeModal()
        return
      }

      // 2. 이력서 선택 체크
      if (
        !affiliationStore.resume.resumeSq ||
        affiliationStore.resume.resumeSq == 0
      ) {
        alertStore.show('이력서를 선택해주세요.', 'danger')
        modalStore.closeModal() // 컨펌창만 닫기
        return
      }

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
</script>
<style>
.text-bold {
  font-weight: bold;
}
.bg-f5 {
  background: #f5f5f5;
}
</style>
