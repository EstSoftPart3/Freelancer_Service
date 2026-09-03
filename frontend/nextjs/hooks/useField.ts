'use client'
// 회원가입 폼(개인·기업)의 필드별 값/에러/유효 상태 훅.
// PersonalSignUpForm·CompanySignUpForm 에 똑같이 중복 정의돼 있던 것을 공용화하면서
// ref 와 props(ref + aria-invalid)를 얹어 검증 실패 시 빨간 프레임·포커스 이동이 가능해졌다.
import { useRef, useState } from 'react'

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
