<template>
  <section>
    <div>
      <CommonPageHeader
        :title="signUpType === 'PERSONAL' ? '개인' : '기업'"
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
                {{
                  signUpType === 'PERSONAL' ? '개인 회원가입' : '기업 회원가입'
                }}
              </h4>
              <component
                :is="
                  signUpType === 'PERSONAL'
                    ? PersonalSignUpForm
                    : CompanySignUpForm
                "
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
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import CompanySignUpForm from '@/fo/components/login&signup/CompanySignUpForm.vue'
import PersonalSignUpForm from '@/fo/components/login&signup/PersonalSignUpForm.vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useCompanyProfileStore } from '@/fo/stores/companyProfileStore'

const route = useRoute()
const router = useRouter()
const alertStore = useAlertStore()
const signUpType = ref('')
const companyProfileStore = useCompanyProfileStore()

onMounted(() => {
  const type = route.query.loginType
  if (type === 'PERSONAL' || type === 'COMPANY') {
    signUpType.value = type

    router.replace({ path: route.path })
  }
  // console.log('signUpType.value', signUpType.value)
})

async function handleSubmit(rawFormData) {
  const formatDate = (dateStr) => {
    if (!dateStr) return dateStr
    // 숫자만 남기고 정규식을 통해 하이픈 추가
    const cleanDate = dateStr.replace(/\D/g, '')
    if (cleanDate.length === 8) {
      return cleanDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
    }
    return dateStr // 8자리가 아니면 그대로 반환
  }

  // 백엔드 DTO에 맞게 키를 변환
  const formData = {
    userId: rawFormData.id,
    userPw: rawFormData.password,
    userNm: rawFormData.name,
    userGenderCd: Number(rawFormData.gender),
    userPhoneNum: rawFormData.phone,
    userEmail: `${rawFormData.emailId}@${rawFormData.emailDomain}`,
    userAgreedPrivacyPolicyYn: rawFormData.terms ? 'Y' : 'N',
    userBirthDt: rawFormData.dob,
    userTypeCd: Number(rawFormData.typeCode),
    userSignupTypeCd: Number(rawFormData.signupTypeCode),
    zonecode: rawFormData.postcode,
    address: rawFormData.address,
    detailAddress: rawFormData.detailAddress || rawFormData.addressDetail,
    sigunguCode: rawFormData.sigunguCode,
    latitude: Number(rawFormData.latitude),
    longitude: Number(rawFormData.longitude),

    // 기업 관련 추가
    companyNm: rawFormData.companyName,
    companyCeoNm: rawFormData.companyCeoName,
    companyOpenDt: formatDate(rawFormData.companyOpenDate),
    companyBizNum: rawFormData.companyBizNumber,
  }
  // console.log('formData', formData)
  try {
    const response = await api.$post('/signup', formData)
    if (response.status === 'OK') {
      alertStore.show(
        response.message || '회원 정보가 성공적으로 수정되었습니다.',
        'success',
      )
      companyProfileStore.resetProfile() // ✅ 스토어 초기화
      router.push('/login')
    } else {
      alertStore.show(
        response.message || '회원 정보 수정에 실패하였습니다.',
        'danger',
      )
    }
  } catch (err) {
    const status = err.response?.status
    let errorMessage = '회원가입에 실패하였습니다'
    if (status === 400) {
      errorMessage = err.response?.data?.message || '입력값을 확인해주세요.'
    } else if (status === 500) {
      errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
    alertStore.show(errorMessage, 'danger')
  }
}
</script>
