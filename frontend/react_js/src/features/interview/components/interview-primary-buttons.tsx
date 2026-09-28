import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInterview } from './interview-provider'

export function InterviewPrimaryButtons() {
  const { setOpen } = useInterview()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>면접후기 등록</span> <Plus size={18} />
      </Button>
    </div>
  )
}
