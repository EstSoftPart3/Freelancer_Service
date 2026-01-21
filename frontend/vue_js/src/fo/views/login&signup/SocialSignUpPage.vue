<template>
  <section>
    <div>
      <CommonPageHeader
        title="소셜"
        strongText="회원가입"
        :breadcrumbs="[{ text: 'Home', link: '/' }, { text: 'SignUp' }]"
      />

      <div class="row justify-content-md-center">
        <div class="col-md-7">
          <div class="featured-box featured-box-primary text-start mt-0">
            <div class="box-content">
              <h4
                class="color-primary font-weight-semibold text-7 text-uppercase mb-3"
              >
                추가 정보 입력
              </h4>
              <PersonalSignUpForm
                :isSocial="true"
                :socialData="socialInfo"
                @submit="handleSubmit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import PersonalSignUpForm from '@/fo/components/login&signup/PersonalSignUpForm.vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useSocialStore } from '@/fo/stores/socialStore'

const router = useRouter()
const alertStore = useAlertStore()
const socialStore = useSocialStore()

// 폼에 전달할 소셜 사용자 정보 상태
const socialInfo = ref({})

onMounted(() => {
  // 스토어에 보관된 임시 소셜 데이터 추출
  const { email, userNm, socialId } = socialStore.tempUser

  // 필수 인증 정보 존재 여부 확인 및 비정상 접근 차단
  if (!email || !socialId) {
    alertStore.show(
      '인증 정보가 만료되었습니다. 다시 로그인해 주세요.',
      'danger',
    )
    router.push('/login')
    return
  }

  // 화면 표시를 위한 소셜 정보 할당
  socialInfo.value = { email, userNm, socialId }
})

/**
 * 회원가입 폼 제출 처리 함수
 * @param {Object} rawFormData
 */
async function handleSubmit(rawFormData) {
  const formData = {
    user_id: rawFormData.id,
    user_nm: rawFormData.name,
    user_email: `${rawFormData.emailId}@${rawFormData.emailDomain}`,
    user_phone_num: rawFormData.phone,
    user_gender_cd: Number(rawFormData.gender),
    user_birth_dt: rawFormData.dob,
    address_sq: rawFormData.postcode,
    address: rawFormData.address,
    detail_address: rawFormData.addressDetail,
    sigungu_code: rawFormData.sigunguCode,
    latitude: rawFormData.latitude,
    longitude: rawFormData.longitude,
    user_signup_type_cd: 203,
    social_id: socialInfo.value.socialId,
    user_agreed_privacy_policy_yn: rawFormData.terms ? 'Y' : 'N',
  }

  try {
    // 소셜 가입 최종 승인 API 호출
    const response = await api.$post('/auth/social/join', formData)

    // 가입 성공 여부 판단 (응답 상태 혹은 토큰 존재 확인)
    if (response.status === 'OK' || response.output?.accessToken) {
      alertStore.show('소셜 회원가입이 완료되었습니다!', 'success')

      // 보안을 위해 사용 완료된 임시 데이터 초기화
      socialStore.clearTempUser()

      // 로그인 페이지로 이동하여 서비스 이용 유도
      router.push('/login')
    }
  } catch (err) {
    alertStore.show(
      err.response?.data?.message || '가입 처리 중 오류가 발생했습니다.',
      'danger',
    )
  }
}
</script>
