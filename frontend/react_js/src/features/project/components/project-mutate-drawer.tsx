import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Paperclip } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import type { ProjectPost } from '../data';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectPost | null;
}

const schema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  title: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '제목을 입력해주세요.'),
  description: z.string().refine((val) => {
    const stripped = val.replace(/<[^>]*>?/gm, '').trim();
    return stripped.length > 0;
  }, '내용을 입력해주세요.'),
  status: z.string().min(1, '상태를 선택해주세요.'),
});

type ProjectForm = z.infer<typeof schema>;

export function ProjectMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow;

  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<ProjectForm>({
      resolver: zodResolver(schema),
      defaultValues: {
        category: '외주',
        title: '',
        description: '',
        status: '모집중',
      },
    });

  const descriptionContent = watch('description');

  useEffect(() => {
    if (open) {
      if (isUpdate && currentRow) {
        reset({
          category: currentRow.category,
          title: currentRow.title,
          description: '',
          status: currentRow.status,
        });
      } else {
        reset({
          category: '외주',
          title: '',
          description: '',
          status: '모집중',
        });
        setTags([]);
        setFiles([]);
      }
    }
  }, [open, isUpdate, currentRow, reset]);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
      e.target.value = '';
    }
  };

  const onInvalid = (errors: FieldErrors<ProjectForm>) => {
    if (errors.category) {
      toast.error(errors.category.message as string);
    } else if (errors.title) {
      toast.error(errors.title.message as string);
    } else if (errors.description) {
      toast.error(errors.description.message as string);
    } else if (errors.status) {
      toast.error(errors.status.message as string);
    }
  };

  const onSubmit = async (data: ProjectForm) => {
    console.log('PROJECT submit mock:', {
      ...data,
      tags,
      files,
      mode: isUpdate ? 'update' : 'create',
    });

    toast.success('프로젝트 게시글이 수정되었습니다.');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-xl'>
        <SheetHeader className='text-left'>
          <SheetTitle>프로젝트 게시글 수정</SheetTitle>
          <SheetDescription>
            관리자용 프로젝트 게시글 내용을 수정합니다.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className='mt-6 space-y-6'
        >
          <div className='space-y-2'>
            <Label htmlFor='category'>카테고리</Label>
            <select
              id='category'
              className='w-full rounded-md border px-3 py-2 text-sm'
              {...register('category')}
            >
              <option value='외주'>외주</option>
              <option value='상주'>상주</option>
              <option value='프리랜서'>프리랜서</option>
              <option value='협업'>협업</option>
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
            <Label>내용</Label>
            <div className='mb-12 h-[300px]'>
              <ReactQuill
                theme='snow'
                className='h-full'
                value={descriptionContent || ''}
                onChange={(val) => setValue('description', val)}
                placeholder='내용을 입력해주세요.'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>상태</Label>
            <select
              id='status'
              className='w-full rounded-md border px-3 py-2 text-sm'
              {...register('status')}
            >
              <option value='모집중'>모집중</option>
              <option value='모집완료'>모집완료</option>
              <option value='숨김'>숨김</option>
            </select>
          </div>

          <div className='space-y-2'>
            <Label>태그</Label>
            <Input placeholder='태그 입력 후 엔터' onKeyDown={addTag} />
            <div className='mt-2 flex flex-wrap gap-2'>
              {tags.map((tag) => (
                <Badge key={tag} variant='secondary' className='gap-1 pr-1'>
                  #{tag}
                  <button
                    type='button'
                    onClick={() => removeTag(tag)}
                    className='ml-1 rounded-full outline-none hover:bg-slate-200'
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>첨부파일</Label>
            <div className='flex items-center gap-2'>
              <Input
                type='file'
                id='project-file-upload'
                className='hidden'
                multiple
                onChange={handleFileChange}
              />
              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  document.getElementById('project-file-upload')?.click()
                }
              >
                <Paperclip className='mr-2 h-4 w-4' />
                파일 선택
              </Button>
            </div>

            <div className='mt-2 space-y-2'>
              {files.map((file, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between rounded bg-muted p-2 text-sm'
                >
                  <span className='truncate'>{file.name}</span>
                  <X
                    className='h-4 w-4 cursor-pointer'
                    onClick={() =>
                      setFiles(files.filter((_, idx) => idx !== i))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <SheetFooter className='mt-8'>
            <Button type='submit'>수정완료</Button>
            <SheetClose asChild>
              <Button variant='outline'>취소</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
