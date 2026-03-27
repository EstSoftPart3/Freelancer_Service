// [Freelancer Service] 소속(회사) 검색 모달
import { useEffect, useState } from 'react'
import { Search, Building2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { type Company, userCompanyApi } from '../api/users-api'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (companySq: number, companyNm: string) => void
}

export function CompanySearchDialog({ open, onOpenChange, onSelect }: Props) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedKeyword = useDebounce(keyword, 300)

  // 디바운스된 키워드가 변경되면 검색 실행
  useEffect(() => {
    if (!open) return

    let cancelled = false

    const fetchCompanies = async () => {
      setIsLoading(true)
      try {
        const data = await userCompanyApi.getCompanies({
          keyword: debouncedKeyword,
        })
        if (!cancelled) setResults(data.output)
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchCompanies()

    return () => {
      cancelled = true
    }
  }, [debouncedKeyword, open])

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (open) {
      setKeyword('')
      setResults([])
    }
  }, [open])

  const handleSelect = (company: Company) => {
    onSelect(company.companySq, company.companyNm)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>소속 검색</DialogTitle>
          <DialogDescription>회사를 검색하고 선택하세요.</DialogDescription>
        </DialogHeader>

        {/* 검색 Input */}
        <div className='relative'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='회사명을 입력하세요...'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className='pl-9'
            autoFocus
          />
        </div>

        {/* 결과 리스트 */}
        <div className='max-h-64 overflow-y-auto rounded-md border'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8 text-sm text-muted-foreground'>
              검색 중...
            </div>
          ) : results.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-sm text-muted-foreground'>
              <Building2 className='mb-2 h-8 w-8' />
              {debouncedKeyword
                ? '검색 결과가 없습니다.'
                : '키워드를 입력해 검색하세요.'}
            </div>
          ) : (
            <ul className='divide-y'>
              {results.map((company) => (
                <li
                  key={company.companySq}
                  className='flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50'
                >
                  <div className='flex items-center gap-2'>
                    <Building2 className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      {company.companyNm}
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleSelect(company)}
                  >
                    선택
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
