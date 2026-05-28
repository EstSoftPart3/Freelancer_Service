import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Edit, ToggleLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { bannerSchema } from '../data/schema'
import { useBanner } from './banner-provider'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const banner = bannerSchema.parse(row.original)
  const { setOpen, setCurrentRow, toggleActive } = useBanner()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>메뉴 열기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuItem
          onClick={() => {
            toggleActive(banner.bannerSq)
            // await bannerApi.toggleActive(banner.bannerSq)
          }}
        >
          {banner.isActive ? '비활성화' : '활성화'}
          <DropdownMenuShortcut>
            <ToggleLeft size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(banner)
            setOpen('update')
            // await bannerApi.getBanner(banner.bannerSq)
          }}
        >
          수정
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={() => {
            setCurrentRow(banner)
            setOpen('delete')
          }}
        >
          삭제
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
