// src/features/report/components/report-primary-buttons.tsx
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ReportPrimaryButtons() {
  // 현재는 'view'와 'delete' 다이얼로그만 사용하므로
  // 상단 버튼에서 다이얼로그를 열 일이 없다면 hook만 선언해 둡니다.

  const handleExport = () => {
    // 실제 엑셀 다운로드 API 연결부 (예시)
    toast.info('신고 목록을 엑셀로 다운로드합니다.')
  }

  return (
    <div className='flex gap-2'>
      {/* '가져오기'는 제거하고, 관리자에게 필요한 '내보내기(다운로드)' 기능만 유지 */}
      <Button variant='outline' className='space-x-1' onClick={handleExport}>
        <span>목록 내보내기</span> <Download size={18} />
      </Button>
    </div>
  )
}
