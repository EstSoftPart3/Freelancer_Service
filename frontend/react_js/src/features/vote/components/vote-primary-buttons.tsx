import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVote } from './vote-provider'

export function VotePrimaryButtons() {
  const { setOpen } = useVote()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>투표 등록</span> <Plus size={18} />
      </Button>
    </div>
  )
}
