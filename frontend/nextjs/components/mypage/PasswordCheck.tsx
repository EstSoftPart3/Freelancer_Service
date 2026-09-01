'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'

interface Props {
  title: string
  onConfirmed: () => void
}

export default function PasswordCheck({ title, onConfirmed }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // 비밀번호가 틀리면 백엔드는 HTTP 200 + { status:"UNAUTHORIZED", message:"비밀번호가 일치하지 않습니다." }
      // 를 준다. lib/api.ts 의 성공 인터셉터가 이를 reject 로 바꾸므로 실패는 전부 catch 로 온다.
      await api.post('/mypage/edit/check-password', { currentPassword: password })
      onConfirmed()
    } catch (err) {
      setError(getApiErrorMessage(err, '서버와 통신 중 오류가 발생했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <h4 className="text-xl font-bold">{title}</h4>
      <p className="text-muted-foreground">계속하려면 비밀번호를 확인해주세요.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">비밀번호</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '확인 중...' : '확인'}
        </Button>
      </form>
    </div>
  )
}
