import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import type { Faq } from '../data/schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Faq | null;
}

const schema = z.object({
  faqType: z.string().min(1, '카테고리를 선택해주세요.'),
  title: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '제목을 입력해주세요.')
    .refine((val) => val.length <= 100, '제목은 100자 이내로 입력해주세요.'),
  description: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '내용을 입력해 주세요.'),
});

type FaqForm = z.infer<typeof schema>;

export function FaqMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow;

  const [normalTags, setNormalTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FaqForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      faqType: 'general',
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (isUpdate && currentRow) {
        reset({
          faqType: currentRow.category || 'general',
          title: currentRow.question || '',
          description: '',
        });
      } else {
        reset({
          faqType: 'general',
          title: '',
          description: '',
        });
        setNormalTags([]);
        setFiles([]);
      }
    }
  }, [open, isUpdate, currentRow, reset]);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!normalTags.includes(newTag)) {
        setNormalTags([...normalTags, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNormalTags(normalTags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
      e.target.value = '';
    }
  };

  const onInvalid = (errors: FieldErrors<FaqForm>) => {
    if (errors.faqType) {
      toast.error(errors.faqType.message as string);
    } else if (errors.title) {
      toast.error(errors.title.message as string);
    } else if (errors.description) {
      toast.error(errors.description.message as string);
    }
  };

  const onSubmit = async (data: FaqForm) => {
    console.log('FAQ submit mock:', {
      ...data,
      normalTags,
      files,
      mode: isUpdate ? 'update' : 'create',
    });

    toast.success(isUpdate ? 'FAQ가 수정되었습니다.' : 'FAQ가 등록되었습니다.');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-xl'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'FAQ 수정' : 'FAQ 작성'}</SheetTitle>
          <SheetDescription>제목과 내용을 작성해주세요.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className='mt-6 space-y-6'
        >
          <div className='space-y-2'>
            <Label htmlFor='faqType'>카테고리</Label>
            <select
              id='faqType'
              className='w-full rounded-md border px-3 py-2 text-sm'
              {...register('faqType')}
            >
              <option value='general'>일반</option>
              <option value='member'>회원</option>
              <option value='account'>계정</option>
              <option value='company'>기업</option>
              <option value='service'>서비스</option>
            </select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='title'>제목</Label>
            <Input
              id='title'
              placeholder='제목을 입력하세요.'
              {...register('title')}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>내용</Label>
            <Textarea
              id='description'
              rows={10}
              placeholder='내용을 입력해주세요.'
              {...register('description')}
            />
          </div>

          <SheetFooter className='mt-8'>
            <Button type='submit'>{isUpdate ? '수정완료' : '등록하기'}</Button>
            <SheetClose asChild>
              <Button variant='outline'>취소</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
