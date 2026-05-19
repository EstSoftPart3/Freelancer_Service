'use client'
// 이메일 인증 코드 발송/확인 로직 — PersonalSignUpForm, FindIdForm, ResetPasswordForm 공용
import { useState } from 'react'
import api from '@/lib/api'
import { alertStore } from '@/stores/alertStore'

interface Options {
  sendCodeEndpoint: string  // '/email/send-code' | '/email/find/send-code'
}

export function useEmailVerification({ sendCodeEndpoint }: Options) {
  const [verified, setVerified] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const sendCode = async (email: string): Promise<boolean> => {
    if (!email) return false
    setSending(true)
    try {
      await api.post(sendCodeEndpoint, { email })
      alertStore.show('인증 코드를 전송했습니다.', 'success')
      return true
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '이메일 인증 요청에 실패했습니다.'
      alertStore.show(msg, 'danger')
      return false
    } finally {
      setSending(false)
    }
  }

  const verifyCode = async (email: string, code: string): Promise<boolean> => {
    if (!code) return false
    setVerifying(true)
    try {
      await api.post('/email/verify-code', { email, code })
      alertStore.show('이메일 인증에 성공하였습니다.', 'success')
      setVerified(true)
      return true
    } catch {
      alertStore.show('인증번호가 일치하지 않습니다.', 'danger')
      setVerified(false)
      return false
    } finally {
      setVerifying(false)
    }
  }

  const reset = () => setVerified(false)

  return { verified, sending, verifying, sendCode, verifyCode, reset }
}
