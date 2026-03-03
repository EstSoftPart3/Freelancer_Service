// [Freelancer Service]
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: '파일을 업로드해주세요.',
    })
    .refine(
      (files) => ['text/csv'].includes(files?.[0]?.type),
      'CSV 형식만 업로드 가능합니다.'
    ),
})

type BoardImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BoardImportDialog({
  open,
  onOpenChange,
}: BoardImportDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = () => {
    const file = form.getValues('file')
    if (file && file[0]) {
      const fileDetails = {
        name: file[0].name,
        size: file[0].size,
        type: file[0].type,
      }
      showSubmittedData(fileDetails, '다음 파일을 가져왔습니다:')
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-start'>
          <DialogTitle>게시글 가져오기</DialogTitle>
          <DialogDescription>
            CSV 파일을 통해 게시글 데이터를 빠르게 대량 등록합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='board-import-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='my-2'>
                  <FormLabel>파일 선택</FormLabel>
                  <FormControl>
                    <Input type='file' {...fileRef} className='h-8 py-0' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>닫기</Button>
          </DialogClose>
          <Button type='submit' form='board-import-form'>
            가져오기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
