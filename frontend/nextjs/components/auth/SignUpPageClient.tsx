'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import PersonalSignUpForm from '@/components/auth/PersonalSignUpForm'
import CompanySignUpForm from '@/components/auth/CompanySignUpForm'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'

export default function SignUpPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isCompany = searchParams.get('loginType') === 'COMPANY'

  const handleSubmit = async (data: Record<string, unknown>) => {
    const {
      id, password, name, nickname, dob, gender, phone,
      address, addressDetail, postcode, sigunguCode, latitude, longitude,
      emailId, emailDomain, terms, typeCode, signupTypeCode,
      companyName, companyCeoName, companyBizNumber, companyOpenDate,
    } = data

    const payload = {
      userId: id,
      userPw: password,
      userNm: name,
      userNickname: nickname,
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
      // Daum sigunguCode는 문자열 "11320" 형태 — DTO Long 필드에 맞게 숫자로 변환
      sigunguCode: sigunguCode ? Number(sigunguCode) : undefined,
      // Kakao 지오코딩 실패 시 0 전송 (Vue 원본 동일 처리, DB NOT NULL 대응)
      latitude: latitude ? Number(latitude) : 0,
      longitude: longitude ? Number(longitude) : 0,
      companyNm: companyName ?? undefined,
      companyCeoNm: companyCeoName ?? undefined,
      companyOpenDt: companyOpenDate ?? undefined,
      companyBizNum: companyBizNumber ?? undefined,
    }

    try {
      // /signup은 실패해도 ApiResponse를 그대로 반환해 HTTP는 200이다.
      // 그 판별은 lib/api.ts의 성공 인터셉터가 이미 하므로(status!=OK면 reject),
      // 여기서 status를 또 보면 CREATED까지 실패로 오판하는 죽은 분기가 된다 — catch만 남긴다.
      await api.post('/signup', payload)
      alertStore.show('회원가입이 완료되었습니다. 로그인해주세요.', 'success')
      router.push('/login')
    } catch (err) {
      // 중복 아이디·닉네임 등 서버가 보낸 가입 거절 사유를 그대로 노출한다.
      alertStore.show(getApiErrorMessage(err, '회원가입에 실패했습니다.'), 'danger')
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
