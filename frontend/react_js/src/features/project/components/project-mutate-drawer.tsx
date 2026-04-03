'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { ProjectPost } from '../data';
import { SkillSelectDialog } from './skill-select-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectPost | null;
}

type InterviewTimeItem = {
  date: string;
  times: string[];
};

type AddressItem = {
  address: string;
  zonecode: string;
  sigunguCode: string;
  lat: number | null;
  lon: number | null;
};

type SubwayItem = {
  placeName: string;
  addressName: string;
  sigunguCode: string;
  lat: number | null;
  lon: number | null;
};

const USING_SKILL_OPTIONS = [
  { label: 'VSCode', group: 'Tool' },
  { label: 'IntelliJ', group: 'Tool' },
  { label: 'Eclipse', group: 'Tool' },
  { label: 'DBeaver', group: 'Tool' },
  { label: 'SQL Developer', group: 'Tool' },
  { label: 'WebSquare', group: 'Tool' },

  { label: 'MySQL', group: 'DBMS' },
  { label: 'OracleDB', group: 'DBMS' },
  { label: 'MongoDB', group: 'DBMS' },
  { label: 'MariaDB', group: 'DBMS' },
  { label: 'Redis', group: 'DBMS' },
  { label: 'PostgreSQL', group: 'DBMS' },
  { label: 'SQLite', group: 'DBMS' },
  { label: 'MyBatis', group: 'DBMS' },

  { label: 'Git', group: 'ETC' },
  { label: 'Google Cloud', group: 'ETC' },
  { label: 'AWS', group: 'ETC' },
  { label: 'Docker', group: 'ETC' },
  { label: 'Kubernetes', group: 'ETC' },
  { label: 'GitHub Actions', group: 'ETC' },

  { label: 'Java', group: 'Language' },
  { label: 'JavaScript', group: 'Language' },
  { label: 'TypeScript', group: 'Language' },
  { label: 'Python', group: 'Language' },

  { label: 'Spring Boot', group: 'Framework' },
  { label: 'React', group: 'Framework' },
  { label: 'Vue', group: 'Framework' },
];

const PREFER_SKILL_OPTIONS = USING_SKILL_OPTIONS;

const WORK_TYPE_OPTIONS = ['정규직', '계약직', '프리랜서'];
const JOB_OPTIONS = [
  '개발PM',
  '데이터분석가',
  '게임개발',
  '백엔드/서버개발',
  '보안컨설팅',
  '앱개발',
  '데이터엔지니어',
  '웹마스터',
  '웹개발',
  '프론트엔드',
  'BI 엔지니어',
  '시스템엔지니어',
  '퍼블리셔',
  'SQA',
  'SI개발',
  '검색엔진',
];
const SKILL_OPTIONS = [
  'Java',
  'Spring Boot',
  'React',
  'Vue',
  'TypeScript',
  'MySQL',
  'Oracle',
  'AWS',
  'JPA',
  'MyBatis',
  'Docker',
  'Redis',
];
const DEV_GRADE_OPTIONS = [
  '초초',
  '초중',
  '초상',
  '중초',
  '중중',
  '중상',
  '상초',
  '상중',
  '상상',
];
const EDUCATION_OPTIONS = [
  '학력 무관',
  '고졸 이하',
  '고졸 이상',
  '대학(2,3년제)',
  '대졸 이상',
  '석사 이상',
  '박사 이상',
];

const MOCK_SUBWAY_ITEMS: SubwayItem[] = [
  {
    placeName: '삼성역 2호선',
    addressName: '서울 강남구 삼성동 172-66',
    sigunguCode: '11680',
    lat: 37.508844,
    lon: 127.06316,
  },
  {
    placeName: '삼성중앙역 9호선',
    addressName: '서울 강남구 삼성동 111-147',
    sigunguCode: '11680',
    lat: 37.513011,
    lon: 127.053282,
  },
  {
    placeName: '선릉역 2호선',
    addressName: '서울 강남구 삼성동 172-66',
    sigunguCode: '11680',
    lat: 37.504286,
    lon: 127.048203,
  },
];

const MOCK_ADDRESS_ITEMS: AddressItem[] = [
  {
    address: '서울특별시 강서구 강서로',
    zonecode: '07600',
    sigunguCode: '11500',
    lat: 37.551,
    lon: 126.849,
  },
  {
    address: '서울특별시 강서구 공항대로',
    zonecode: '07623',
    sigunguCode: '11500',
    lat: 37.559,
    lon: 126.84,
  },
  {
    address: '서울특별시 강남구 삼성로',
    zonecode: '06164',
    sigunguCode: '11680',
    lat: 37.514,
    lon: 127.056,
  },
];

const schema = z
  .object({
    projectTitle: z
      .string()
      .transform((v) => v.trim())
      .refine((v) => v.length >= 5, '프로젝트 제목을 5자 이상 입력해주세요.'),
    detailedAddressName: z.string().optional(),
    detailedAddressDetail: z.string().optional(),
    subwayAddressName: z.string().optional(),
    devGrade: z.string().min(1, '개발자 등급을 선택해주세요.'),
    educationLvl: z.string().min(1, '학력을 선택해주세요.'),
    projectSalary: z.string().optional(),
    projectSalaryNegotiableYn: z.enum(['Y', 'N']),
    description: z
      .string()
      .transform((v) => v.trim())
      .refine((v) => v.length > 0, '상세 내용을 작성해주세요.'),
    isNotification: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.detailedAddressName && !data.subwayAddressName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['detailedAddressName'],
        message: '근무지 주소 또는 지하철역 중 하나는 필수입니다.',
      });
    }

    if (
      data.projectSalaryNegotiableYn === 'N' &&
      (!data.projectSalary || Number(data.projectSalary.replace(/,/g, '')) <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['projectSalary'],
        message: '올바른 단가를 입력해주세요.',
      });
    }
  });

type ProjectForm = z.infer<typeof schema>;

const defaultValues: ProjectForm = {
  projectTitle: '',
  detailedAddressName: '',
  detailedAddressDetail: '',
  subwayAddressName: '',
  devGrade: '',
  educationLvl: '',
  projectSalary: '',
  projectSalaryNegotiableYn: 'N',
  description: '',
  isNotification: false,
};

function formatRange(start: string, end: string) {
  if (!start || !end) return '';
  return `${start} ~ ${end}`;
}

function buildMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const startDay = firstDay.getDay();

  const cells: Array<string | null> = [];

  for (let i = 0; i < startDay; i += 1) cells.push(null);
  for (let d = 1; d <= lastDate; d += 1) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(date);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function TagPreview({
  values,
  onRemove,
}: {
  values: string[];
  onRemove: (value: string) => void;
}) {
  return (
    <div className='flex flex-wrap gap-2'>
      {values.map((value) => (
        <Badge key={value} variant='secondary' className='gap-1 pr-1'>
          {value}
          <button
            type='button'
            onClick={() => onRemove(value)}
            className='ml-1 rounded-full outline-none hover:bg-slate-200'
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
    </div>
  );
}

function MultiSelectDialog({
  open,
  onOpenChange,
  title,
  options,
  selectedValues,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: string[];
  selectedValues: string[];
  onConfirm: (values: string[]) => void;
}) {
  const [tempValues, setTempValues] = useState<string[]>([]);

  useEffect(() => {
    if (open) setTempValues(selectedValues);
  }, [open, selectedValues]);

  const toggleValue = (value: string) => {
    setTempValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[420px] overflow-y-auto pr-1'>
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            {options.map((option) => {
              const active = tempValues.includes(option);
              return (
                <button
                  key={option}
                  type='button'
                  onClick={() => toggleValue(option)}
                  className={cn(
                    'flex h-[64px] items-center justify-center rounded-md border px-4 text-center transition',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-slate-200 bg-white hover:border-primary'
                  )}
                >
                  <span className='text-sm font-medium whitespace-nowrap'>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button
            onClick={() => {
              onConfirm(tempValues);
              onOpenChange(false);
            }}
          >
            선택 완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SearchListDialog<T>({
  open,
  onOpenChange,
  title,
  keyword,
  setKeyword,
  placeholder,
  items,
  getPrimary,
  getSecondary,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  keyword: string;
  setKeyword: (value: string) => void;
  placeholder: string;
  items: T[];
  getPrimary: (item: T) => string;
  getSecondary: (item: T) => string;
  onSelect: (item: T) => void;
}) {
  const filtered = useMemo(() => {
    const lower = keyword.toLowerCase();
    return items.filter(
      (item) =>
        getPrimary(item).toLowerCase().includes(lower) ||
        getSecondary(item).toLowerCase().includes(lower)
    );
  }, [items, keyword, getPrimary, getSecondary]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='flex items-center gap-2'>
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={placeholder}
          />
          <Button type='button' size='icon' variant='outline'>
            <Search className='h-4 w-4' />
          </Button>
        </div>

        <div className='max-h-[360px] overflow-y-auto rounded-md border'>
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <button
                key={`${getPrimary(item)}-${index}`}
                type='button'
                onClick={() => {
                  onSelect(item);
                  onOpenChange(false);
                }}
                className='flex w-full flex-col items-start border-b px-4 py-3 text-left hover:bg-muted'
              >
                <span className='font-medium'>{getPrimary(item)}</span>
                <span className='text-sm text-muted-foreground'>
                  {getSecondary(item)}
                </span>
              </button>
            ))
          ) : (
            <div className='px-4 py-10 text-center text-sm text-muted-foreground'>
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RangeCalendarDialog({
  open,
  onOpenChange,
  title,
  initialStart,
  initialEnd,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialStart: string;
  initialEnd: string;
  onConfirm: (range: { start: string; end: string }) => void;
}) {
  const today = new Date();
  const [baseYear, setBaseYear] = useState(today.getFullYear());
  const [baseMonth, setBaseMonth] = useState(today.getMonth() + 1);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  useEffect(() => {
    if (open) {
      setStart(initialStart);
      setEnd(initialEnd);
    }
  }, [open, initialStart, initialEnd]);

  const nextMonth = baseMonth === 12 ? 1 : baseMonth + 1;
  const nextYear = baseMonth === 12 ? baseYear + 1 : baseYear;

  const prevCalendar = buildMonthDays(baseYear, baseMonth);
  const nextCalendar = buildMonthDays(nextYear, nextMonth);

  const clickDate = (date: string) => {
    if (!start || (start && end)) {
      setStart(date);
      setEnd('');
      return;
    }

    if (date < start) {
      setEnd(start);
      setStart(date);
      return;
    }

    setEnd(date);
  };

  const isInRange = (date: string) => {
    if (!start) return false;
    if (start && !end) return date === start;
    return date >= start && date <= end;
  };

  const renderCalendar = (
    year: number,
    month: number,
    cells: Array<string | null>
  ) => (
    <div className='w-full'>
      <div className='mb-4 text-center text-lg font-semibold'>
        {month}월 {year}
      </div>
      <div className='mb-2 grid grid-cols-7 text-center text-sm text-muted-foreground'>
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-1'>
        {cells.map((date, idx) =>
          date ? (
            <button
              key={`${date}-${idx}`}
              type='button'
              onClick={() => clickDate(date)}
              className={`h-10 rounded-md text-sm ${
                isInRange(date)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {Number(date.split('-')[2])}
            </button>
          ) : (
            <div key={`empty-${idx}`} className='h-10' />
          )
        )}
      </div>
    </div>
  );

  const movePrev = () => {
    if (baseMonth === 1) {
      setBaseYear((prev) => prev - 1);
      setBaseMonth(12);
      return;
    }
    setBaseMonth((prev) => prev - 1);
  };

  const moveNext = () => {
    if (baseMonth === 12) {
      setBaseYear((prev) => prev + 1);
      setBaseMonth(1);
      return;
    }
    setBaseMonth((prev) => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='flex items-start gap-6'>
          <Button variant='ghost' type='button' onClick={movePrev}>
            {'<'}
          </Button>

          <div className='grid flex-1 grid-cols-1 gap-6 md:grid-cols-2'>
            {renderCalendar(baseYear, baseMonth, prevCalendar)}
            {renderCalendar(nextYear, nextMonth, nextCalendar)}
          </div>

          <Button variant='ghost' type='button' onClick={moveNext}>
            {'>'}
          </Button>
        </div>

        <div className='text-sm text-muted-foreground'>
          선택 일자: {formatRange(start, end)}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={() => {
              if (!start || !end) {
                toast.error('시작일과 종료일을 선택해주세요.');
                return;
              }
              onConfirm({ start, end });
              onOpenChange(false);
            }}
          >
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow;

  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedUsingSkills, setSelectedUsingSkills] = useState<string[]>([]);
  const [selectedPreferSkills, setSelectedPreferSkills] = useState<string[]>(
    []
  );
  const [selectedInterviewTimes, setSelectedInterviewTimes] = useState<
    InterviewTimeItem[]
  >([]);
  const [preferList, setPreferList] = useState<string[]>([]);

  const [projectStartDt, setProjectStartDt] = useState('');
  const [projectEndDt, setProjectEndDt] = useState('');
  const [recruitStartDt, setRecruitStartDt] = useState('');
  const [recruitEndDt, setRecruitEndDt] = useState('');

  const [detailedZonecode, setDetailedZonecode] = useState('');
  const [detailedLat, setDetailedLat] = useState<number | null>(null);
  const [detailedLon, setDetailedLon] = useState<number | null>(null);
  const [detailedSigunguCode, setDetailedSigunguCode] = useState('');

  const [subwayLat, setSubwayLat] = useState<number | null>(null);
  const [subwayLon, setSubwayLon] = useState<number | null>(null);
  const [subwaySigunguCode, setSubwaySigunguCode] = useState('');

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [subwayDialogOpen, setSubwayDialogOpen] = useState(false);
  const [projectCalendarOpen, setProjectCalendarOpen] = useState(false);
  const [recruitCalendarOpen, setRecruitCalendarOpen] = useState(false);
  const [workTypeDialogOpen, setWorkTypeDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [usingSkillDialogOpen, setUsingSkillDialogOpen] = useState(false);
  const [preferSkillDialogOpen, setPreferSkillDialogOpen] = useState(false);

  const [addressKeyword, setAddressKeyword] = useState('');
  const [subwayKeyword, setSubwayKeyword] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const salaryNegotiableYn = watch('projectSalaryNegotiableYn');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const workTypeError =
    isSubmitted && selectedWorkTypes.length === 0
      ? '근무 형태를 최소 하나 선택해주세요.'
      : '';

  const jobError =
    isSubmitted && selectedJobs.length === 0
      ? '모집 직군을 최소 하나 선택해주세요.'
      : '';

  const usingSkillsError =
    isSubmitted && selectedUsingSkills.length === 0
      ? '사용 기술을 최소 하나 선택해주세요.'
      : '';

  const preferSkillsError =
    isSubmitted && selectedPreferSkills.length === 0
      ? '우대 기술을 최소 하나 선택해주세요.'
      : '';

  useEffect(() => {
    if (!open) return;

    const initialize = async () => {
      try {
        setIsFetching(true);

        if (isUpdate && currentRow) {
          reset({
            projectTitle: currentRow.title ?? '',
            detailedAddressName: '',
            detailedAddressDetail: '',
            subwayAddressName: '',
            devGrade: '',
            educationLvl: '',
            projectSalary: '',
            projectSalaryNegotiableYn: 'N',
            description: '',
            isNotification: false,
          });
          setSelectedWorkTypes([]);
          setSelectedJobs([]);
          setSelectedUsingSkills([]);
          setSelectedPreferSkills([]);
          setSelectedInterviewTimes([]);
          setPreferList([]);
          setProjectStartDt('');
          setProjectEndDt('');
          setRecruitStartDt('');
          setRecruitEndDt('');
        } else {
          reset(defaultValues);
          setSelectedWorkTypes([]);
          setSelectedJobs([]);
          setSelectedUsingSkills([]);
          setSelectedPreferSkills([]);
          setSelectedInterviewTimes([]);
          setPreferList([]);
          setProjectStartDt('');
          setProjectEndDt('');
          setRecruitStartDt('');
          setRecruitEndDt('');
          setDetailedZonecode('');
          setDetailedLat(null);
          setDetailedLon(null);
          setDetailedSigunguCode('');
          setSubwayLat(null);
          setSubwayLon(null);
          setSubwaySigunguCode('');
        }
      } finally {
        setIsFetching(false);
      }
    };

    initialize();
  }, [open, isUpdate, currentRow, reset]);

  const projectPeriodDisplay = formatRange(projectStartDt, projectEndDt);
  const recruitPeriodDisplay = formatRange(recruitStartDt, recruitEndDt);
  const onInvalid = (errors: FieldErrors<ProjectForm>) => {
    setIsSubmitted(true);
    console.log('폼 에러:', errors);
  };

  const onSubmit = async (data: ProjectForm) => {
    setIsSubmitted(true);
    if (selectedWorkTypes.length === 0)
      return toast.error('근무 형태를 선택해주세요.');

    if (selectedJobs.length === 0)
      return toast.error('모집 직군을 선택해주세요.');

    if (selectedUsingSkills.length === 0)
      return toast.error('사용 기술을 선택해주세요.');

    if (selectedPreferSkills.length === 0)
      return toast.error('우대 기술을 선택해주세요.');

    if (!projectStartDt || !projectEndDt)
      return toast.error('프로젝트 기간을 설정해주세요.');

    if (!recruitStartDt || !recruitEndDt)
      return toast.error('모집 기간을 설정해주세요.');

    const payload = {
      projectId: isUpdate ? (currentRow?.id ?? null) : null,
      projectTitle: data.projectTitle,
      projectSalary: data.projectSalary?.replace(/,/g, '') ?? '',
      projectSalaryNegotiableYn: data.projectSalaryNegotiableYn,
      projectImageUrl: '',

      detailedAddressName: data.detailedAddressName ?? '',
      detailedAddressDetail: data.detailedAddressDetail ?? '',
      detailedZonecode,
      detailedLat,
      detailedLon,
      detailedSigunguCode,

      subwayAddressName: data.subwayAddressName ?? '',
      subwayLat,
      subwayLon,
      subwaySigunguCode,

      devGrade: data.devGrade,
      educationLvl: data.educationLvl,

      projectStartDt,
      projectEndDt,
      recruitStartDt,
      recruitEndDt,

      workType: selectedWorkTypes,
      recruitJob: selectedJobs,
      preferSkills: selectedPreferSkills,
      usingSkills: selectedUsingSkills,
      preference: preferList.join(','),
      description: data.description,
      interviewTime: selectedInterviewTimes.flatMap((item) =>
        item.times.map((time) => `${item.date}T${time}`)
      ),
      isNotification: data.isNotification ? 'Y' : 'N',
    };

    try {
      setIsSaving(true);

      console.log('PROJECT payload:', payload);

      // TODO: 실제 API 연결
      // if (isUpdate) {
      //   await projectApi.updateProject(payload)
      // } else {
      //   await projectApi.createProject(payload)
      // }

      toast.success(
        isUpdate ? '프로젝트가 수정되었습니다.' : '프로젝트가 등록되었습니다.'
      );
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeWorkType = (value: string) =>
    setSelectedWorkTypes((prev) => prev.filter((v) => v !== value));

  const removeJob = (value: string) =>
    setSelectedJobs((prev) => prev.filter((v) => v !== value));

  const removeUsingSkill = (value: string) =>
    setSelectedUsingSkills((prev) => prev.filter((v) => v !== value));

  const removePreferSkill = (value: string) =>
    setSelectedPreferSkills((prev) => prev.filter((v) => v !== value));

  const removePreference = (value: string) =>
    setPreferList((prev) => prev.filter((v) => v !== value));

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className='overflow-y-auto sm:max-w-3xl'>
          {isFetching ? (
            <div className='flex h-full flex-col items-center justify-center gap-2'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <p className='text-sm text-muted-foreground'>
                데이터를 불러오는 중...
              </p>
            </div>
          ) : (
            <>
              <SheetHeader className='text-left'>
                <SheetTitle>
                  {isUpdate ? '프로젝트 수정' : '프로젝트 등록'}
                </SheetTitle>
                <SheetDescription>
                  관리자용 프로젝트 수정 폼입니다.
                </SheetDescription>
              </SheetHeader>

              <form
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className='mt-6 space-y-6'
              >
                <div className='space-y-2'>
                  <Label htmlFor='projectTitle'>프로젝트 제목</Label>
                  <Input
                    id='projectTitle'
                    placeholder='예: 쇼핑몰 관리자 시스템 구축'
                    {...register('projectTitle')}
                  />
                  {errors.projectTitle ? (
                    <p className='text-sm text-destructive'>
                      {errors.projectTitle.message}
                    </p>
                  ) : null}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2 md:col-span-1'>
                    <Label htmlFor='detailedAddressName'>근무지 주소</Label>
                    <Input
                      id='detailedAddressName'
                      readOnly
                      placeholder='주소 검색을 이용해주세요'
                      value={watch('detailedAddressName') ?? ''}
                      onClick={() => setAddressDialogOpen(true)}
                      className='cursor-pointer'
                    />
                  </div>

                  <div className='space-y-2 md:col-span-1'>
                    <Label htmlFor='detailedAddressDetail'>상세 주소</Label>
                    <Input
                      id='detailedAddressDetail'
                      placeholder='상세 주소를 입력하세요.'
                      {...register('detailedAddressDetail')}
                    />
                  </div>
                </div>
                {errors.detailedAddressName ? (
                  <p className='text-sm text-destructive'>
                    {errors.detailedAddressName.message}
                  </p>
                ) : null}

                <div className='space-y-2'>
                  <Label htmlFor='subwayAddressName'>지하철역 주소</Label>
                  <Input
                    id='subwayAddressName'
                    readOnly
                    placeholder='지하철역을 검색해주세요.'
                    value={watch('subwayAddressName') ?? ''}
                    onClick={() => setSubwayDialogOpen(true)}
                    className='cursor-pointer'
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='devGrade'>개발자 등급(경력)</Label>
                    <select
                      id='devGrade'
                      className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      {...register('devGrade')}
                    >
                      <option value=''>선택</option>
                      {DEV_GRADE_OPTIONS.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    {errors.devGrade ? (
                      <p className='text-sm text-destructive'>
                        {errors.devGrade.message}
                      </p>
                    ) : null}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='educationLvl'>학력</Label>
                    <select
                      id='educationLvl'
                      className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      {...register('educationLvl')}
                    >
                      <option value=''>선택</option>
                      {EDUCATION_OPTIONS.map((education) => (
                        <option key={education} value={education}>
                          {education}
                        </option>
                      ))}
                    </select>
                    {errors.educationLvl ? (
                      <p className='text-sm text-destructive'>
                        {errors.educationLvl.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label>프로젝트 기간</Label>
                    <button
                      type='button'
                      className='text-sm text-muted-foreground hover:underline'
                      onClick={() => setProjectCalendarOpen(true)}
                    >
                      + 추가하기
                    </button>
                  </div>
                  <Input
                    readOnly
                    value={projectPeriodDisplay}
                    placeholder='예: 2025-04-01 ~ 2025-10-31'
                    className='cursor-pointer'
                    onClick={() => setProjectCalendarOpen(true)}
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label>모집 기간</Label>
                    <button
                      type='button'
                      className='text-sm text-muted-foreground hover:underline'
                      onClick={() => setRecruitCalendarOpen(true)}
                    >
                      + 추가하기
                    </button>
                  </div>
                  <Input
                    readOnly
                    value={recruitPeriodDisplay}
                    placeholder='예: 2025-04-01 ~ 2025-10-31'
                    className='cursor-pointer'
                    onClick={() => setRecruitCalendarOpen(true)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='projectSalary'>단가</Label>
                  <div className='flex flex-col gap-3 md:flex-row md:items-center'>
                    <Input
                      id='projectSalary'
                      placeholder='예: 5000000'
                      disabled={salaryNegotiableYn === 'Y'}
                      className='w-[650px]'
                      {...register('projectSalary')}
                    />
                    <label className='flex items-center gap-2 text-sm whitespace-nowrap'>
                      <input
                        type='checkbox'
                        checked={salaryNegotiableYn === 'Y'}
                        onChange={(e) =>
                          setValue(
                            'projectSalaryNegotiableYn',
                            e.target.checked ? 'Y' : 'N'
                          )
                        }
                      />
                      단가 협의
                    </label>
                  </div>
                  {errors.projectSalary ? (
                    <p className='text-sm text-destructive'>
                      {errors.projectSalary.message}
                    </p>
                  ) : null}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label>근무 형태</Label>
                    <button
                      type='button'
                      className='text-sm text-muted-foreground hover:underline'
                      onClick={() => setWorkTypeDialogOpen(true)}
                    >
                      + 추가하기
                    </button>
                  </div>
                  <TagPreview
                    values={selectedWorkTypes}
                    onRemove={removeWorkType}
                  />
                  {workTypeError ? (
                    <p className='text-sm text-destructive'>{workTypeError}</p>
                  ) : null}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label>모집 직군</Label>
                    <button
                      type='button'
                      className='text-sm text-muted-foreground hover:underline'
                      onClick={() => setJobDialogOpen(true)}
                    >
                      + 추가하기
                    </button>
                  </div>
                  <TagPreview values={selectedJobs} onRemove={removeJob} />
                  {jobError ? (
                    <p className='text-sm text-destructive'>{jobError}</p>
                  ) : null}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label>사용 기술</Label>
                    <button
                      type='button'
                      className='text-sm text-muted-foreground hover:underline'
                      onClick={() => setUsingSkillDialogOpen(true)}
                    >
                      + 추가하기
                    </button>
                  </div>
                  <TagPreview
                    values={selectedUsingSkills}
                    onRemove={removeUsingSkill}
                  />
                  {usingSkillsError ? (
                    <p className='text-sm text-destructive'>
                      {usingSkillsError}
                    </p>
                  ) : null}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label>우대 기술</Label>
                    <button
                      type='button'
                      className='text-sm text-muted-foreground hover:underline'
                      onClick={() => setPreferSkillDialogOpen(true)}
                    >
                      + 추가하기
                    </button>
                  </div>
                  <TagPreview
                    values={selectedPreferSkills}
                    onRemove={removePreferSkill}
                  />
                  {preferSkillsError ? (
                    <p className='text-sm text-destructive'>
                      {preferSkillsError}
                    </p>
                  ) : null}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='preferenceInput'>우대 사항</Label>
                  <Input
                    id='preferenceInput'
                    placeholder='쉼표(,)로 구분하여 입력'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const value = e.currentTarget.value
                          .trim()
                          .replace(',', '');
                        if (!value) return;
                        if (!preferList.includes(value)) {
                          setPreferList((prev) => [...prev, value]);
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <TagPreview values={preferList} onRemove={removePreference} />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>상세 내용</Label>
                  <Textarea
                    id='description'
                    rows={6}
                    maxLength={5000}
                    placeholder='상세 내용을 입력해주세요.'
                    {...register('description')}
                  />
                  {errors.description ? (
                    <p className='text-sm text-destructive'>
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label>인터뷰 가능 시간</Label>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        toast.info('인터뷰 시간 모달은 다음 단계에서 연결')
                      }
                    >
                      + 추가하기
                    </Button>
                  </div>

                  {selectedInterviewTimes.length > 0 ? (
                    <div className='space-y-2'>
                      {selectedInterviewTimes.map((item) => (
                        <div
                          key={item.date}
                          className='flex items-center justify-between rounded-md border p-3'
                        >
                          <div className='space-y-1'>
                            <p className='text-sm font-medium'>{item.date}</p>
                            <div className='flex flex-wrap gap-2'>
                              {item.times.map((time) => (
                                <Badge
                                  key={`${item.date}-${time}`}
                                  variant='secondary'
                                >
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            onClick={() =>
                              setSelectedInterviewTimes((prev) =>
                                prev.filter((v) => v.date !== item.date)
                              )
                            }
                          >
                            삭제
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      선택된 인터뷰 시간이 없습니다.
                    </p>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <input
                    id='isNotification'
                    type='checkbox'
                    checked={watch('isNotification')}
                    onChange={(e) =>
                      setValue('isNotification', e.target.checked)
                    }
                  />
                  <Label htmlFor='isNotification'>알림 발신 여부</Label>
                </div>

                <SheetFooter className='mt-8'>
                  <Button
                    type='submit'
                    disabled={isSaving}
                    className='min-w-[12px]'
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        저장중...
                      </>
                    ) : isUpdate ? (
                      '수정완료'
                    ) : (
                      '등록하기'
                    )}
                  </Button>
                  <SheetClose asChild>
                    <Button variant='outline'>취소</Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>

      <SearchListDialog<AddressItem>
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        title='주소 검색'
        keyword={addressKeyword}
        setKeyword={setAddressKeyword}
        placeholder='예: 강서구'
        items={MOCK_ADDRESS_ITEMS}
        getPrimary={(item) => item.address}
        getSecondary={(item) => item.zonecode}
        onSelect={(item) => {
          setValue('detailedAddressName', item.address);
          setDetailedZonecode(item.zonecode);
          setDetailedSigunguCode(item.sigunguCode);
          setDetailedLat(item.lat);
          setDetailedLon(item.lon);
        }}
      />

      <SearchListDialog<SubwayItem>
        open={subwayDialogOpen}
        onOpenChange={setSubwayDialogOpen}
        title='지하철역 검색'
        keyword={subwayKeyword}
        setKeyword={setSubwayKeyword}
        placeholder='예: 삼성역'
        items={MOCK_SUBWAY_ITEMS}
        getPrimary={(item) => item.placeName}
        getSecondary={(item) => item.addressName}
        onSelect={(item) => {
          setValue('subwayAddressName', item.placeName);
          setSubwayLat(item.lat);
          setSubwayLon(item.lon);
          setSubwaySigunguCode(item.sigunguCode);
        }}
      />

      <RangeCalendarDialog
        open={projectCalendarOpen}
        onOpenChange={setProjectCalendarOpen}
        title='프로젝트 기간 선택'
        initialStart={projectStartDt}
        initialEnd={projectEndDt}
        onConfirm={({ start, end }) => {
          setProjectStartDt(start);
          setProjectEndDt(end);
        }}
      />

      <RangeCalendarDialog
        open={recruitCalendarOpen}
        onOpenChange={setRecruitCalendarOpen}
        title='모집 기간 선택'
        initialStart={recruitStartDt}
        initialEnd={recruitEndDt}
        onConfirm={({ start, end }) => {
          setRecruitStartDt(start);
          setRecruitEndDt(end);
        }}
      />

      <MultiSelectDialog
        open={workTypeDialogOpen}
        onOpenChange={setWorkTypeDialogOpen}
        title='근무 형태 선택'
        options={WORK_TYPE_OPTIONS}
        selectedValues={selectedWorkTypes}
        onConfirm={setSelectedWorkTypes}
      />

      <MultiSelectDialog
        open={jobDialogOpen}
        onOpenChange={setJobDialogOpen}
        title='모집 직군 선택'
        options={JOB_OPTIONS}
        selectedValues={selectedJobs}
        onConfirm={setSelectedJobs}
      />

      <SkillSelectDialog
        open={usingSkillDialogOpen}
        onOpenChange={setUsingSkillDialogOpen}
        title='사용 기술 선택'
        options={USING_SKILL_OPTIONS}
        selectedValues={selectedUsingSkills}
        onConfirm={setSelectedUsingSkills}
      />

      <SkillSelectDialog
        open={preferSkillDialogOpen}
        onOpenChange={setPreferSkillDialogOpen}
        title='우대 기술 선택'
        options={PREFER_SKILL_OPTIONS}
        selectedValues={selectedPreferSkills}
        onConfirm={setSelectedPreferSkills}
      />
    </>
  );
}
