'use client'
// 회원가입 폼(개인·기업)의 필드별 값/에러/유효 상태 훅.
// PersonalSignUpForm·CompanySignUpForm 에 똑같이 중복 정의돼 있던 것을 공용화하면서
// ref 와 props(ref + aria-invalid)를 얹어 검증 실패 시 빨간 프레임·포커스 이동이 가능해졌다.
import { useRef, useState } from 'react'
import { focusInvalidElement } from '@/hooks/useFormErrors'

export function useField(initialValue = '') {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const [valid, setValid] = useState(false)
  const ref = useRef<HTMLInputElement | null>(null)

  return {
    value, setValue,
    error, setError,
    valid, setValid,
    ref,
    // <Input {...idField.props} /> 로 ref 와 빨간 프레임을 한 번에 붙인다.
    props: { ref, 'aria-invalid': !!error || undefined } as const,
  }
}

export type Field = ReturnType<typeof useField>

// 서버가 거절한 사유(예: "이미 사용 중인 휴대폰 번호입니다.")를 문구의 키워드로 해당 필드에 붙이고 그리로 이동한다.
// 클라이언트 검증을 통과해 체크 표시가 붙은 칸도 서버 중복 검사에서 걸릴 수 있다(휴대폰·이메일은 사전 확인 API 가 없다).
export function markServerError(msg: string, fields: Array<[keyword: string, field: Field]>) {
  const hit = fields.find(([k]) => msg.includes(k))
  if (!hit) return
  const field = hit[1]
  field.setError(msg)
  field.setValid(false)
  focusInvalidElement(field.ref.current)
}
