import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import iconMap from '@/features/project/data/skillIconMap';
import type { ProjectPost } from '../data';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectPost | null;
  onEdit: () => void;
  onDelete: () => void;
}

type SkillGroup = {
  title: string;
  items: string[];
};

type ExtendedProjectPost = ProjectPost & {
  description?: string;
  createdAt?: string;
  author?: string;
  companyName?: string;
  logoUrl?: string;

  recruitStartAt?: string;
  recruitEndAt?: string;
  interviewStartAt?: string;
  interviewEndAt?: string;
  workStartAt?: string;
  workEndAt?: string;

  workType?: string;
  workLocation?: string;
  pay?: string;
  conditionDescription?: string;

  requiredSkillGroups?: SkillGroup[];
  preferredSkillGroups?: SkillGroup[];
};

function normalizeSkillKey(skill: string) {
  const map: Record<string, string> = {
    OracleDB: 'oracledb',
    'Spring Boot': 'springboot',
    'Vue.js': 'vuejs',
    Java: 'java',
    JavaScript: 'javascript',
    TypeScript: 'typescript',
    VSCode: 'vscode',
    Eclipse: 'eclipse',
  };
  return map[skill] || skill.toLowerCase().replace(/[\s.]/g, '');
}

function SkillItem({ skill }: { skill: string }) {
  const normalizedKey = normalizeSkillKey(skill);
  const iconSrc = iconMap[normalizedKey] || iconMap.default;

  return (
    <div className='flex items-center gap-2'>
      <img
        src={iconSrc}
        alt={skill}
        className='h-5 w-5 shrink-0 object-contain'
      />
      <span>{skill}</span>
    </div>
  );
}

function SkillGroupSection({ groups }: { groups: SkillGroup[] }) {
  if (!groups.length) return null;

  return (
    <div className='space-y-4'>
      {groups.map((group) => (
        <div key={group.title}>
          <p className='mb-2 font-semibold'>{group.title}</p>
          <div className='space-y-2 pl-4'>
            {group.items.map((skill) => (
              <SkillItem key={`${group.title}-${skill}`} skill={skill} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectViewDrawer({
  open,
  onOpenChange,
  currentRow,
  onEdit,
  onDelete,
}: Props) {
  if (!currentRow) return null;

  const row = currentRow as ExtendedProjectPost;

  const requiredSkillGroups: SkillGroup[] = row.requiredSkillGroups ?? [
    {
      title: 'DBMS',
      items: ['OracleDB'],
    },
    {
      title: 'FrameWork',
      items: ['Spring Boot', 'Vue.js'],
    },
    {
      title: 'Language',
      items: ['Java', 'JavaScript', 'TypeScript'],
    },
    {
      title: 'Tool',
      items: ['Eclipse', 'VSCode'],
    },
  ];

  const preferredSkillGroups: SkillGroup[] = row.preferredSkillGroups ?? [];

  const description =
    row.description ??
    'React 기반 관리자 페이지 구축 및 운영 환경 개선을 위한 프로젝트입니다. 사용자 환경 개선과 유지 보수를 목표로 진행합니다.';

  const recruitPeriod =
    row.recruitStartAt && row.recruitEndAt
      ? `${row.recruitStartAt} ~ ${row.recruitEndAt}`
      : '2026-04-01 ~ 2026-04-15';

  const interviewPeriod =
    row.interviewStartAt && row.interviewEndAt
      ? `${row.interviewStartAt} ~ ${row.interviewEndAt}`
      : '2026-04-16 ~ 2026-04-18';

  const workPeriod =
    row.workStartAt && row.workEndAt
      ? `${row.workStartAt} ~ ${row.workEndAt}`
      : '2026-04-20 ~ 2026-06-30';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-2xl'>
        <SheetHeader className='text-left'>
          <SheetTitle>프로젝트 상세정보</SheetTitle>
          <SheetDescription>
            등록된 프로젝트의 상세 내용을 확인합니다.
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          <div className='rounded-lg border p-4'>
            <div className='relative mb-4'>
              <p className='absolute top-0 right-0 text-sm text-muted-foreground'>
                조회수 {row.viewCount}회
              </p>

              <div className='flex items-start gap-4 pr-24'>
                <div className='flex h-[70px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm'>
                  {row.logoUrl ? (
                    <img
                      src={row.logoUrl}
                      alt={row.companyName ?? row.author ?? row.title}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    '로고'
                  )}
                </div>

                <div className='min-w-0'>
                  <h2 className='text-2xl leading-snug font-semibold sm:text-3xl'>
                    {row.title}
                  </h2>
                  <p className='mt-1 text-base text-muted-foreground'>
                    {row.companyName ?? row.author}
                  </p>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    등록일 : {new Date(row.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <p className='text-base leading-8'>{description}</p>

            <div className='mt-4 space-y-2 text-base'>
              <p>
                <strong>모집 기간 :</strong> {recruitPeriod}
              </p>
              <p>
                <strong>인터뷰 기간 :</strong> {interviewPeriod}
              </p>
              <p>
                <strong>수행 기간 :</strong> {workPeriod}
              </p>
            </div>
          </div>

          <div className='rounded-lg border p-4'>
            <h3 className='mb-4 text-2xl font-semibold'>
              지원 자격 / 근무 조건
            </h3>

            <div className='space-y-6 text-base leading-8'>
              <div>
                <p className='mb-3 font-semibold text-primary'>필수 기술</p>
                <SkillGroupSection groups={requiredSkillGroups} />
              </div>

              {preferredSkillGroups.length > 0 && (
                <div>
                  <p className='mb-3 font-semibold text-primary'>우대 기술</p>
                  <SkillGroupSection groups={preferredSkillGroups} />
                </div>
              )}

              <ul className='space-y-2 border-t pt-4'>
                <li>
                  <strong>우대 사항 :</strong>{' '}
                  {row.conditionDescription ?? '인증서 업무 경험 우대'}
                </li>
                <li>
                  <strong>근무 형태 :</strong>{' '}
                  {row.workType ?? '계약직 / 프리랜서'}
                </li>
                <li>
                  <strong>근무 지역 :</strong>{' '}
                  {row.workLocation ?? '을지로 입구역 2호선'}
                </li>
                <li>
                  <strong>단가 :</strong> {row.pay ?? '월 300만원 / 단가 협의'}
                </li>
              </ul>
            </div>
          </div>

          <div className='flex justify-center gap-3 pt-2'>
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
      </SheetContent>
    </Sheet>
  );
}
