import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFaq } from './faq-provider';

export function FaqPrimaryButtons() {
  const { setOpen } = useFaq();

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>자주 묻는 질문 등록</span>
        <Plus size={18} />
      </Button>
    </div>
  );
}
