'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

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
      const { data } = await api.post('/mypage/edit/check-password', {
        currentPassword: password,
      })
      if (data.output === true) {
        onConfirmed()
      } else {
        setError(data.message || '비밀번호가 일치하지 않습니다.')
      }
    } catch {
      setError('서버와 통신 중 오류가 발생했습니다.')
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
