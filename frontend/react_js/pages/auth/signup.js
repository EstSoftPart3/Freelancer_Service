import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import PersonalSignUpForm from '@/components/auth/PersonalSignUpForm'
import CompanySignUpForm from '@/components/auth/CompanySignUpForm'

export default function SignUpPage() {
  const router = useRouter()
  const { showAlert } = useAlert()
  const [signUpType, setSignUpType] = useState('')

  useEffect(() => {
    const type = router.query.loginType
    if (type === 'PERSONAL' || type === 'COMPANY') {
      setSignUpType(type)
      // query 제거 (URL을 깔끔하게)
      router.replace({ pathname: router.pathname }, undefined, { shallow: true })
    }
  }, [router.query.loginType])

  const handleSubmit = async (rawFormData) => {
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
      companyOpenDt: rawFormData.companyOpenDate,
      companyBizNum: rawFormData.companyBizNumber,
      companyViewCnt: 0,
    }

    try {
      const response = await api.$post('/signup', formData)
      if (response.status === 'OK') {
        showAlert(
          response.message || '회원 정보가 성공적으로 수정되었습니다.',
          'success'
        )
        router.push('/auth/login')
      } else {
        showAlert(
          response.message || '회원 정보 수정에 실패하였습니다.',
          'danger'
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
      showAlert(errorMessage, 'danger')
    }
  }

  return (
    <section>
      <div>
        <CommonPageHeader
          title={signUpType === 'PERSONAL' ? '개인' : '기업'}
          strongText="회원가입"
          breadcrumbs={[{ text: 'Home', link: '/' }, { text: 'SignUp' }]}
        />

        <div className="row justify-content-md-center">
          <div className="col-md-7">
            <div className="featured-box featured-box-primary text-start mt-0">
              <div className="box-content">
                <h4 className="color-primary font-weight-semibold text-7 text-uppercase mb-3">
                  {signUpType === 'PERSONAL' ? '개인 회원가입' : '기업 회원가입'}
                </h4>
                {signUpType === 'PERSONAL' ? (
                  <PersonalSignUpForm onSubmit={handleSubmit} />
                ) : signUpType === 'COMPANY' ? (
                  <CompanySignUpForm onSubmit={handleSubmit} />
                ) : (
                  <div className="alert alert-warning">
                    회원 유형을 선택해주세요.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}




