'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useFormErrors } from '@/hooks/useFormErrors'
import { InvalidFrame } from '@/components/ui/invalid-frame'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'
import { VOTE_CATEGORIES } from './types'

type FieldKey = 'ttl' | 'endDt' | 'options' | 'category'

export default function VoteCreateForm() {
  const router = useRouter()
  const [ttl, setTtl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<number | null>(null)
  const [endDt, setEndDt] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [submitting, setSubmitting] = useState(false)
  const { validate, fieldProps, isInvalid } = useFormErrors<FieldKey>()

  const addOption = () => setOptions((prev) => [...prev, ''])
  const removeOption = (idx: number) => setOptions((prev) => prev.filter((_, i) => i !== idx))
  const changeOption = (idx: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)))

  const handleSubmit = async () => {
    const trimmedOptions = options.map((o) => o.trim()).filter((o) => o.length > 0)

    const ok = validate([
      { key: 'ttl', invalid: ttl.trim().length === 0, message: '제목을 입력해주세요.' },
      { key: 'category', invalid: category == null, message: '카테고리를 선택해주세요.' },
      { key: 'endDt', invalid: endDt.trim().length === 0, message: '마감 일시를 선택해주세요.' },
      { key: 'options', invalid: trimmedOptions.length < 2, message: '선택지는 2개 이상 입력해주세요.' },
    ])
    if (!ok) return

    setSubmitting(true)
    try {
      await api.post('/votes', {
        voteTtl: ttl.trim(),
        voteDescriptionEdt: description.trim() || null,
        voteCategoryCd: category,
        voteEndDt: endDt,
        options: trimmedOptions,
      })
      alertStore.show('투표가 등록되었습니다.', 'success')
      router.push('/vote')
    } catch (err) {
      alertStore.show(getApiErrorMessage(err, '투표 등록에 실패했습니다.'), 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">제목</label>
        <Input
          {...fieldProps('ttl')}
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
          placeholder="투표 제목을 입력해주세요"
        />
      </div>

      <InvalidFrame invalid={isInvalid('category')} {...fieldProps('category')}>
        <label className="mb-1 block text-sm font-medium">카테고리</label>
        <div className="flex gap-2">
          {VOTE_CATEGORIES.map((c) => (
            <button
              key={c.commonCodeSq}
              type="button"
              onClick={() => setCategory(c.commonCodeSq)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c.commonCodeSq
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              {c.commonCodeNm}
            </button>
          ))}
        </div>
      </InvalidFrame>

      <div>
        <label className="mb-1 block text-sm font-medium">설명 (선택)</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="투표에 대한 부연 설명을 입력해주세요"
          rows={4}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">마감 일시</label>
        <Input
          {...fieldProps('endDt')}
          type="datetime-local"
          value={endDt}
          onChange={(e) => setEndDt(e.target.value)}
        />
      </div>

      <InvalidFrame invalid={isInvalid('options')} {...fieldProps('options')}>
        <label className="mb-1 block text-sm font-medium">선택지 (2개 이상)</label>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={opt}
                onChange={(e) => changeOption(idx, e.target.value)}
                placeholder={`선택지 ${idx + 1}`}
              />
              {options.length > 2 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addOption}>
          <Plus className="mr-1 h-4 w-4" /> 선택지 추가
        </Button>
      </InvalidFrame>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="button" disabled={submitting} onClick={handleSubmit}>
          {submitting ? '등록 중...' : '등록'}
        </Button>
      </div>
    </div>
  )
}
