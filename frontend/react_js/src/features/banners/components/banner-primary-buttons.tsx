import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBanner } from './banner-provider'

export function BannerPrimaryButtons() {
  const { setOpen, setCurrentRow } = useBanner()

  return (
    <Button
      className='space-x-1'
      onClick={() => {
        setCurrentRow(null)
        setOpen('create')
      }}
    >
      <span>배너 등록</span>
      <Plus size={18} />
    </Button>
  )
}
