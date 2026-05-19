'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import PersonalSignUpForm from '@/components/auth/PersonalSignUpForm'
import CompanySignUpForm from '@/components/auth/CompanySignUpForm'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'

export default function SignUpPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isCompany = searchParams.get('loginType') === 'COMPANY'

  const handleSubmit = async (data: Record<string, unknown>) => {
    const {
      id, password, name, dob, gender, phone,
      address, addressDetail, postcode, sigunguCode, latitude, longitude,
      emailId, emailDomain, terms, typeCode, signupTypeCode,
      companyName, companyCeoName, companyBizNumber, companyOpenDate,
    } = data

    const payload = {
      userId: id,
      userPw: password,
      userNm: name,
      userGenderCd: gender ? Number(gender) : undefined,
      userPhoneNum: phone,
      userEmail: `${emailId}@${emailDomain}`,
      userAgreedPrivacyPolicyYn: terms ? 'Y' : 'N',
      userBirthDt: dob ?? undefined,
      userTypeCd: Number(typeCode),
      userSignupTypeCd: Number(signupTypeCode),
      zonecode: postcode,
      address,
      detailAddress: addressDetail,
      sigunguCode,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      companyNm: companyName ?? undefined,
      companyCeoNm: companyCeoName ?? undefined,
      companyOpenDt: companyOpenDate ?? undefined,
      companyBizNum: companyBizNumber ?? undefined,
    }

    try {
      await api.post('/signup', payload)
      alertStore.show('회원가입이 완료되었습니다. 로그인해주세요.', 'success')
      router.push('/login')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '회원가입에 실패했습니다.'
      alertStore.show(msg, 'danger')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {isCompany ? '기업회원' : '개인회원'} 회원가입
        </h1>
        <div className="rounded-xl border bg-card p-6 shadow-lg">
          {isCompany
            ? <CompanySignUpForm onSubmit={handleSubmit} />
            : <PersonalSignUpForm onSubmit={handleSubmit} />}
        </div>
      </div>
    </div>
  )
}
