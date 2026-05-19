'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CommonPagination from '@/components/community/CommonPagination'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { ResumeItem } from '@/types'

const PAGE_SIZE = 5

export default function ResumeListClient() {
  const router = useRouter()
  const { userSq } = useUserStore()

  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const fetchResumes = useCallback(async (page = 1) => {
    try {
      const { data } = await api.get('/mypage/resume/list', {
        params: { currentPage: page, size: PAGE_SIZE, userSq },
      })
      const output = data.output ?? {}
      setResumes(Array.isArray(output.output) ? output.output : [])
      setTotalPages(output.totalCount ? Math.ceil(output.totalCount / PAGE_SIZE) : 1)
    } catch {
      toast.error('이력서 목록을 불러올 수 없습니다.')
    }
  }, [userSq])

  useEffect(() => { fetchResumes(currentPage) }, [fetchResumes, currentPage])

  async function handleDelete() {
    if (deleteTarget === null) return
    try {
      await api.patch(`/mypage/resume/${deleteTarget}/delete`)
      toast.success('삭제되었습니다.')
      fetchResumes(currentPage)
    } catch {
      toast.error('삭제에 실패했습니다.')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleSetRepresentative(resumeSq: number) {
    try {
      await api.patch(`/mypage/resume/representative/${resumeSq}`)
      fetchResumes(currentPage)
    } catch {
      toast.error('대표 이력서 설정에 실패했습니다.')
    }
  }

  async function handleCopy(resumeSq: number, withFiles: boolean) {
    try {
      await api.post(`/mypage/resume/${resumeSq}/copy`, { withFiles })
      toast.success(`이력서 복사(${withFiles ? '파일 포함' : '파일 제외'})가 완료되었습니다.`)
      fetchResumes(currentPage)
    } catch {
      toast.error('이력서 복사에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">이력서 목록</h2>
      <hr />

      {resumes.length === 0 && (
        <p className="text-muted-foreground text-sm py-4">등록된 이력서가 없습니다.</p>
      )}

      <ul className="divide-y">
        {resumes.map((resume) => (
          <li key={resume.resumeSq} className="py-4 relative">
            <button
              className="absolute top-3 right-0 text-muted-foreground hover:text-foreground text-2xl leading-none"
              onClick={() => setDeleteTarget(resume.resumeSq)}
            >
              &times;
            </button>

            <div className="flex items-center gap-2 pr-8">
              <button
                className="text-base font-medium hover:underline text-left"
                onClick={() => router.push(`/mypage/resume/${resume.resumeSq}`)}
              >
                {resume.resumeTtl}
              </button>
              {resume.resumeIsRepresentativeYn === 'Y' && (
                <Badge>대표 이력서</Badge>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">등록일자</span>{' '}
                | {resume.resumeCreatedAtDtm?.substring(0, 10).replaceAll('-', '.')}
              </span>

              <div className="flex gap-2">
                {resume.resumeIsRepresentativeYn !== 'Y' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetRepresentative(resume.resumeSq)}
                  >
                    대표이력서 설정
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/mypage/resume/${resume.resumeSq}`)}
                >
                  수정하기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(resume.resumeSq, true)}
                >
                  복사하기
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end mt-4">
        <Button onClick={() => router.push('/mypage/resume/new')}>이력서 등록하기</Button>
      </div>

      <CommonPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="이력서 삭제"
        message="정말 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
