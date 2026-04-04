import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Faq } from '../data/schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Faq | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function FaqViewDrawer({
  open,
  onOpenChange,
  currentRow,
  onEdit,
  onDelete,
}: Props) {
  if (!currentRow) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-xl'>
        <SheetHeader className='text-left'>
          <SheetTitle>FAQ 상세보기</SheetTitle>
          <SheetDescription>등록된 FAQ 내용을 확인합니다.</SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          <div className='space-y-2'>
            <Label>카테고리</Label>
            <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
              {currentRow.category}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>제목</Label>
            <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
              {currentRow.question}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>내용</Label>
            <div className='min-h-[200px] rounded-md border bg-muted/30 px-3 py-3 text-sm whitespace-pre-wrap'>
              {currentRow.content || '내용이 없습니다.'}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>상태</Label>
            <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
              {currentRow.isPublic ? '표시' : '숨김'}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>생성일</Label>
            <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
              {new Date(currentRow.createdAt).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        <SheetFooter className='mt-8'>
          <div className='flex w-full flex-col gap-2'>
            <div className='flex justify-center gap-3'>
              <Button variant='outline' onClick={onEdit}>
                수정
              </Button>
              <Button variant='destructive' onClick={onDelete}>
                삭제
              </Button>
            </div>

            <SheetClose asChild>
              <Button variant='outline' className='w-full'>
                닫기
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
