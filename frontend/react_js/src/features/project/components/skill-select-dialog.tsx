'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import iconMap from '@/features/project/data/skillIconMap';

export type SkillOption = {
  label: string;
  group?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: SkillOption[];
  selectedValues: string[];
  onConfirm: (values: string[]) => void;
};

const normalizeIconKey = (label: string) => {
  const map: Record<string, string> = {
    Java: 'java',
    Python: 'python',
    C: 'c',
    'C++': 'c++',
    JavaScript: 'javascript',
    TypeScript: 'typescript',
    PHP: 'php',

    'Spring Boot': 'springboot',
    Spring: 'spring',
    React: 'react',
    Vue: 'vuejs',
    VueJS: 'vuejs',
    NestJS: 'nestjs',
    ExpressJS: 'expressjs',
    NextJS: 'nextjs',
    WebSquare: 'websquare',

    Docker: 'docker',
    Git: 'git',
    Kubernetes: 'kubernetes',
    Jenkins: 'jenkins',
    'GitHub Actions': 'githubactions',
    Terraform: 'terraform',
    Ansible: 'ansible',
    Jira: 'jira',
    Figma: 'figma',
    Postman: 'postman',

    Windows: 'windows',
    MacOS: 'macos',
    Linux: 'linux',

    MySQL: 'mysql',
    Oracle: 'oracledb',
    OracleDB: 'oracledb',
    MongoDB: 'mongodb',
    MariaDB: 'mariadb',
    MyBatis: 'mybatis',
    PostgreSQL: 'postgresql',
    SQLite: 'sqlite',
    Redis: 'redis',

    AWS: 'aws',
    'Google Cloud': 'googlecloud',
    Azure: 'azure',
    'AWS S3': 'awss3',
    'AWS EC2': 'awsec2',
    'AWS Lambda': 'awslambda',
    'AWS RDS': 'awsrds',
    Cloudflare: 'cloudflare',
    Firebase: 'firebase',
    Vercel: 'vercel',

    VSCode: 'vscode',
    IntelliJ: 'intellij',
    Vim: 'vim',
    'Android Studio': 'androidstudio',
    Eclipse: 'eclipse',
    'Visual Studio': 'visualstudio',
    'SQL Developer': 'default',
    DBeaver: 'default',
  };

  return map[label] ?? label.toLowerCase().replace(/\s+/g, '');
};

export function SkillSelectDialog({
  open,
  onOpenChange,
  title,
  options,
  selectedValues,
  onConfirm,
}: Props) {
  const [tempValues, setTempValues] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTempValues(selectedValues);
    }
  }, [open, selectedValues]);

  const groupedOptions = useMemo(() => {
    return options.reduce<Record<string, SkillOption[]>>((acc, option) => {
      const groupKey = option.group ?? 'ETC';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(option);
      return acc;
    }, {});
  }, [options]);

  const toggleValue = (value: string) => {
    setTempValues((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[460px] gap-0 overflow-hidden rounded-2xl p-0'>
        <div className='border-b px-6 py-5'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-[20px] font-bold text-slate-900'>
              {title}
            </DialogTitle>

            <button
              type='button'
              onClick={() => onOpenChange(false)}
              className='rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            ></button>
          </div>
        </div>

        <div className='max-h-[560px] overflow-y-auto px-6 py-5'>
          {Object.entries(groupedOptions).map(([groupName, items]) => (
            <div key={groupName} className='mb-6 last:mb-0'>
              <p className='mb-3 text-sm font-semibold text-slate-500'>
                {groupName}
              </p>

              <div className='grid grid-cols-3 gap-3'>
                {items.map((item) => {
                  const active = tempValues.includes(item.label);
                  const iconKey = normalizeIconKey(item.label);
                  const iconSrc = iconMap[iconKey] || iconMap.default;

                  return (
                    <button
                      key={item.label}
                      type='button'
                      onClick={() => toggleValue(item.label)}
                      className={cn(
                        'flex min-h-[52px] items-center gap-2 rounded-xl border px-3 py-3 text-left transition',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted bg-background hover:border-primary'
                      )}
                    >
                      <img
                        src={iconSrc}
                        alt={item.label}
                        className={cn(
                          'h-5 w-5 shrink-0 object-contain',
                          active ? 'brightness-0 invert' : ''
                        )}
                        onError={(e) => {
                          e.currentTarget.src = iconMap.default;
                        }}
                      />
                      <span
                        className={cn(
                          'text-sm break-keep',
                          active ? 'text-primary-foreground' : 'text-slate-800'
                        )}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className='flex items-center justify-end gap-3 border-t px-6 py-4'>
          <Button
            type='button'
            variant='default'
            className='h-10 min-w-[96px]'
            onClick={() => {
              onConfirm(tempValues);
              onOpenChange(false);
            }}
          >
            선택 완료
          </Button>

          <Button
            type='button'
            variant='outline'
            className='h-10 min-w-[96px]'
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
