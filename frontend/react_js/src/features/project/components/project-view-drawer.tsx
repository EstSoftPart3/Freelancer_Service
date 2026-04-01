import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ProjectPost } from '../data';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectPost | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectViewDrawer({
  open,
  onOpenChange,
  currentRow,
  onEdit,
  onDelete,
}: Props) {
  if (!currentRow) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-2xl'>
        <SheetHeader className='text-left'>
          <SheetTitle>프로젝트 상세정보</SheetTitle>
          <SheetDescription>
            당사가 등록한 프로젝트의 상세 내용을 확인합니다.
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          <div className='rounded-lg border p-4'>
            <div className='mb-3 flex items-center gap-4'>
              <div className='flex h-[70px] w-[70px] items-center justify-center rounded-full bg-muted text-sm'>
                로고
              </div>
              <div>
                <h2 className='text-3xl font-semibold'>{currentRow.title}</h2>
                <p className='text-base text-muted-foreground'>
                  {currentRow.author}
                </p>
              </div>
            </div>

            <p className='text-base leading-8'>
              React 기반 관리자 페이지 구축 및 운영 환경 개선을 위한
              프로젝트입니다. 사용자 환경 개선과 유지 보수를 목표로 진행합니다.
            </p>

            <div className='mt-4 space-y-2 text-base'>
              <p>
                <strong>출시 기간 :</strong> 2026-04-01 ~ 2026-04-15
              </p>
              <p>
                <strong>인터뷰 기간 :</strong> 2026-04-16 ~ 2026-04-18
              </p>
              <p>
                <strong>활동기간 :</strong> 2026-04-20 ~ 2026-06-30
              </p>
            </div>
          </div>

          <div className='rounded-lg border p-4'>
            <h3 className='mb-4 text-2xl font-semibold'>지원 가능 / 근무 중</h3>
            <ul className='space-y-3 text-base leading-8'>
              <li>
                <strong>필수기술 :</strong> React, TypeScript, JavaScript
              </li>
              <li>
                <strong>우대 기술 :</strong> Spring Boot, Vue.js
              </li>
              <li>
                <strong>업무 내용 :</strong> 연결 환경, 관리자 페이지 구축 환경
              </li>
              <li>
                <strong>형태 :</strong> 상주 / 원격 개조
              </li>
              <li>
                <strong>근무지 :</strong> 지역 서울 강남구
              </li>
              <li>
                <strong>단가 :</strong> 조정 가능
              </li>
            </ul>
          </div>

          <div className='flex justify-center gap-3 pt-2'>
            <Button variant='outline' onClick={onEdit}>
              수정
            </Button>
            <Button variant='destructive' onClick={onDelete}>
              삭제
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
