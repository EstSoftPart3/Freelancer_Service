'use client'
// 인증 남은 시간 안내 — 인증번호(3분)·인증 완료 후 다음 단계(5분)·비밀번호 재설정(5분).
import type { EmailVerification } from '@/hooks/useEmailVerification'

export const formatMmSs = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

export default function VerifyTimer({ ev, action }: { ev: EmailVerification; action: string }) {
  if (!ev.phase) return null
  const expired = ev.remaining === 0
  const text = ev.phase === 'code'
    ? expired
      ? '인증번호가 만료되었습니다. [인증 요청]을 다시 눌러 주세요.'
      : `인증번호 유효 시간 ${formatMmSs(ev.remaining)}`
    : expired
      ? '인증 유효 시간이 지났습니다. [인증 요청]부터 다시 해 주세요.'
      : `인증 완료 — ${formatMmSs(ev.remaining)} 안에 ${action} 완료해 주세요.`
  return (
    <p className={`mt-1 text-xs ${expired ? 'text-destructive' : 'text-muted-foreground'}`} aria-live="polite">
      {text}
    </p>
  )
}
