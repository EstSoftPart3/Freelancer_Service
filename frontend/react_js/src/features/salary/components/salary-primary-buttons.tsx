import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSalary } from './salary-provider'

export function SalaryPrimaryButtons() {
  const { setOpen } = useSalary()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>제출건 등록</span> <Plus size={18} />
      </Button>
    </div>
  )
}
