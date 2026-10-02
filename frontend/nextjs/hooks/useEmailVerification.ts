'use client'
// 이메일 인증 코드 발송/확인 로직 — PersonalSignUpForm, FindIdForm, ResetPasswordForm 공용
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'
import { alertStore } from '@/stores/alertStore'

interface Options {
  sendCodeEndpoint: string  // '/email/send-code' | '/email/find/send-code'
}

// 서버 Redis TTL 과 맞춘다(RedisRepository: 인증번호 3분, 인증 완료 표식 5분).
const CODE_TTL_MS = 3 * 60 * 1000
const VERIFIED_TTL_MS = 5 * 60 * 1000

export function useEmailVerification({ sendCodeEndpoint }: Options) {
  const [verified, setVerified] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  // 'code' = 인증번호 유효 시간, 'verified' = 인증 완료 표식 유효 시간. 남은 시간을 화면에 보여준다.
  const [phase, setPhase] = useState<'code' | 'verified' | null>(null)
  const [expiresAt, setExpiresAt] = useState(0)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!phase) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
      setRemaining(left)
      // 서버 표식이 사라졌으니 화면도 미인증으로 돌려 [인증 요청]부터 다시 하게 한다.
      if (left === 0 && phase === 'verified') setVerified(false)
      return left
    }
    if (tick() === 0) return
    const id = setInterval(() => { if (tick() === 0) clearInterval(id) }, 1000)
    return () => clearInterval(id)
  }, [phase, expiresAt])

  const start = (p: 'code' | 'verified', ttl: number) => {
    setPhase(p)
    setExpiresAt(Date.now() + ttl)
    setRemaining(Math.ceil(ttl / 1000))
  }

  const sendCode = async (email: string): Promise<boolean> => {
    if (!email) return false
    setSending(true)
    try {
      await api.post(sendCodeEndpoint, { email })
      // 새 코드를 보냈으면 이전 인증은 무효 — 서버의 인증 표식은 5분 뒤 사라지므로, 가입이
      // "이메일 인증을 먼저 완료해주세요"로 막히면 [인증 요청]부터 다시 할 수 있어야 한다.
      setVerified(false)
      start('code', CODE_TTL_MS)
      alertStore.show('인증 코드를 전송했습니다.', 'success')
      return true
    } catch (err: unknown) {
      alertStore.show(getApiErrorMessage(err, '이메일 인증 요청에 실패했습니다.'), 'danger')
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
      start('verified', VERIFIED_TTL_MS)
      return true
    } catch (err: unknown) {
      // 실제 서버 사유(만료·요청 초과 등)를 보존한다 — 하드코딩된 "코드 불일치" 문구는
      // 네트워크 오류·서버 오류일 때도 항상 떠서 사용자가 원인을 알 수 없게 만들었다.
      alertStore.show(getApiErrorMessage(err, '인증번호가 일치하지 않습니다.'), 'danger')
      setVerified(false)
      return false
    } finally {
      setVerifying(false)
    }
  }

  const reset = () => { setVerified(false); setPhase(null) }

  return { verified, sending, verifying, sendCode, verifyCode, reset, phase, remaining }
}

export type EmailVerification = ReturnType<typeof useEmailVerification>
