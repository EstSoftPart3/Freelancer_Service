import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type Company,
  getCompanyDetail,
  updateCompanyDetail,
} from '../api/users-api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companySq: number;
  onUpdated: (companyNm: string) => void;
}

export function CompanyDetailsDialog({
  open,
  onOpenChange,
  companySq,
  onUpdated,
}: Props) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 폼 상태
  const [companyNm, setCompanyNm] = useState('');
  const [companyCeoNm, setCompanyCeoNm] = useState('');
  const [companyRegNum, setCompanyRegNum] = useState('');
  const [companyOpenDate, setCompanyOpenDate] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  useEffect(() => {
    if (open && companySq) {
      let isMounted = true;
      setIsLoading(true);

      getCompanyDetail(companySq)
        .then((data) => {
          if (isMounted && data) {
            setCompany(data);
            setCompanyNm(data.companyNm || '');
            setCompanyCeoNm(data.companyCeoNm || '');
            setCompanyRegNum(data.companyRegNum || '');
            setCompanyOpenDate(data.companyOpenDate || '');
            setCompanyUrl(data.companyUrl || '');
            setCompanyPhone(data.companyPhone || '');
            setCompanyAddress(data.companyAddress || '');
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [open, companySq]);

  const handleSave = async () => {
    if (!company) return;
    setIsSaving(true);
    try {
      const updated = await updateCompanyDetail(company.companySq, {
        companyNm,
        companyCeoNm,
        companyRegNum,
        companyOpenDate,
        companyUrl,
        companyPhone,
        companyAddress,
      });
      setCompany(updated);
      onUpdated(updated.companyNm);
      toast.success('회사 정보 수정 완료', {
        description: '성공적으로 수정되었습니다.',
      });
      onOpenChange(false);
    } catch (e) {
      toast.error('회사 정보 수정 실패', {
        description: '수정 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>회사 정보</DialogTitle>
          <DialogDescription>
            기업 회원과 연결된 회사 상세 정보를 확인하고 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-8 text-sm text-muted-foreground'>
            정보를 불러오는 중입니다...
          </div>
        ) : (
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='companyNm'>회사명</Label>
              <Input
                id='companyNm'
                value={companyNm}
                onChange={(e) => setCompanyNm(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='companyCeoNm'>대표자 이름</Label>
              <Input
                id='companyCeoNm'
                value={companyCeoNm}
                onChange={(e) => setCompanyCeoNm(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='companyRegNum'>사업자 등록번호</Label>
              <Input
                id='companyRegNum'
                value={companyRegNum}
                onChange={(e) => setCompanyRegNum(e.target.value)}
                placeholder='예: 123-45-67890'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='companyOpenDate'>개업일자</Label>
              <Input
                id='companyOpenDate'
                value={companyOpenDate}
                onChange={(e) => setCompanyOpenDate(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='companyUrl'>기업 URL</Label>
              <Input
                id='companyUrl'
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='companyPhone'>대표번호</Label>
              <Input
                id='companyPhone'
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='companyAddress'>주소</Label>
              <Input
                id='companyAddress'
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? '저장 중...' : '저장하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
