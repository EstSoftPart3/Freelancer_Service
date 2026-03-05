// src/features/board/components/board-primary-buttons.tsx
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBoard } from './board-provider'

export function BoardPrimaryButtons() {
  const { setOpen, setCurrentRow } = useBoard()

  return (
    <div className='flex gap-2'>
      {/* <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>가져오기</span> <Download size={18} />
      </Button> */}
      <Button
        className='space-x-1'
        onClick={() => {
          setCurrentRow(null)
          setOpen('create') // Dialogs의 'create'와 매칭
        }}
      >
        <span>게시글 등록</span> <Plus size={18} />
      </Button>
    </div>
  )
}
