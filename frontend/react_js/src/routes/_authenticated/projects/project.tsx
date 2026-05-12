import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/projects/project')({
  component: ProjectsProject,
})

function ProjectsProject() {
  const [projects, setProjects] = useState<any[]>([]) 
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // 1. 토큰 가져오기 (로그인 시 저장한 위치에 맞춰 수정하세요)
        // const token = localStorage.getItem('accessToken');
        // const token = sessionStorage.getItem('accessToken');

        const token = useAuthStore.getState().auth.accessToken
        
        if (!token) {
            console.error('토큰 없음-useAuthStore - 로그인 필요' )
            return
        }

        const response = await axios.get(`http://localhost:8080/api/admin/projects/project`, {
          headers: {
            Authorization: `Bearer ${token}` // 포스트맨처럼 토큰 추가
          }
        });

        // 2. 중요: response.data.output으로 접근!
        if (response.data && response.data.output) {
          setProjects(response.data.output);
        }
      } catch (error) {
        console.error("데이터 로드 실패: ", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, [])

  // 3. 필터링 로직 (DTO 필드명인 projectStatus 사용)
//   const ongoingProjects = projects.filter(p => p.projectStatus === '진행중' || p.projectStatus === '모집중')
//   const completedProjects = projects.filter(p => p.projectStatus === '완료')

        // const ongoingProjects = projects.filter(p =>
        // p.projectStatus === '진행중' ||
        // p.projectStatus === '모집중' ||
        // p.projectStatus === '예정'
        // )
        // const completedProjects = projects.filter(p =>
        // p.projectStatus === '완료' ||
        // p.projectStatus === '모집마감'
        // )

        // 진행중 탭 = 모집중 + 모집마감(수행중) + 진행중 + 예정
const ongoingProjects = projects.filter(p =>
  p.projectStatus === '진행중' ||
  p.projectStatus === '모집중' ||
  p.projectStatus === '모집마감' ||  // 모집은 끝났지만 수행은 진행중
  p.projectStatus === '예정'
)

// 완료 탭 = 수행 기간까지 완전히 끝난 것만
const completedProjects = projects.filter(p =>
  p.projectStatus === '완료'
)

  if (isLoading) return <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>

  return (
    <div className='p-8 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>프로젝트 관리</h1>
        <p className='text-muted-foreground'>플랫폼 내 등록된 모든 프로젝트의 현황을 관리합니다.</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-3">
          <TabsTrigger value="all">전체 목록</TabsTrigger>
          <TabsTrigger value="ongoing">진행중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ProjectTable data={projects} title="전체 프로젝트" description="시스템에 등록된 모든 프로젝트입니다." />
        </TabsContent>

        <TabsContent value="ongoing">
          <ProjectTable data={ongoingProjects} title="진행중인 프로젝트" description="..." />
        </TabsContent>

        <TabsContent value="completed">
          <ProjectTable data={completedProjects} title="완료된 프로젝트" description="..." />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectTable({ data, title, description }: { data: any[], title: string, description: string }) {
  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">No.</TableHead>
              <TableHead>프로젝트명</TableHead>
              <TableHead>의뢰 기업</TableHead>
              <TableHead>단가(월)</TableHead>
              <TableHead>수행 기간</TableHead>
              <TableHead className="text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.projectSq} className="cursor-pointer hover:bg-slate-50">
                  {/* 포스트맨에서 확인된 필드명으로 매핑 */}
                  <TableCell>{item.projectSq}</TableCell>
                  <TableCell className="font-semibold">{item.projectTtl}</TableCell>
                  <TableCell>{item.companyNm}</TableCell> 
                  <TableCell>{Number(item.projectSalary).toLocaleString()}원</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {item.projectStartDt} ~ {item.projectEndDt}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={
                      item.projectStatus === '완료' ? 'secondary' : 
                      item.projectStatus === '진행중' ? 'default' : 'outline'
                    }>
                      {item.projectStatus || '상태없음'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                  표시할 프로젝트가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}