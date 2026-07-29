'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, List, Map as MapIcon, Heart, Building2, MapPin, Train } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ProjectFilterBar from './ProjectFilterBar'
import ProjectCard from './ProjectCard'
import CommonPagination from '@/components/community/CommonPagination'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import { loadKakaoMaps } from '@/lib/kakao'
import { cn } from '@/lib/utils'
import type {
  ProjectItem,
  ProjectSearchParams,
  ProjectRegionGroup,
  KakaoMapInstance,
  KakaoCustomOverlayInstance,
} from '@/types'

const PAGE_SIZE = 5

// CustomOverlay는 React 트리 밖에 직접 삽입되는 raw DOM이라 Lucide 컴포넌트를 못 쓴다 — 동일 아이콘을 SVG 문자열로 이식
const SVG_PIN = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'
const SVG_TRAIN = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/></svg>'
const SVG_BUILDING = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>'
const SVG_NAV = '<svg viewBox="0 0 24 24" width="12" height="12" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>'

// CustomOverlay 내용은 innerHTML로 주입되는 raw DOM이라 React의 자동 이스케이프가 없다.
// 프로젝트명·회사명·주소는 사용자 입력에서 오므로 그대로 넣으면 stored XSS가 된다.
function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface ProjectStatus {
  status: '채용예정' | '채용중' | '채용종료'
  dDay?: string
}

function getProjectStatus(project: ProjectItem): ProjectStatus {
  const today = new Date()
  const start = new Date(project.recruitStartDt)
  const end = new Date(project.recruitEndDt)
  if (today < start) return { status: '채용예정' }
  if (today > end) return { status: '채용종료' }
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return { status: '채용중', dDay: `D-${diff}` }
}

function getDisplayAddress(project: ProjectItem): string {
  const isSubway = project.addressTypeCd === 2702
  return (isSubway ? project.subwayAddress : project.detailedAddress) || '주소 정보 없음'
}

interface Props {
  // 서버에서 미리 조회한 첫 페이지(기본 정렬) — SEO용으로 초기 HTML에 목록을 포함시킨다.
  // 마운트 후 fetchProjects가 위치정보/필터 기준으로 1회 갱신한다(기존 동작 유지).
  initialData?: { projects: ProjectItem[]; totalCount: number } | null
}

export default function ProjectListClient({ initialData }: Props = {}) {
  const router = useRouter()
  const { isLoggedIn, userTypeCd, getUserType, latitude, longitude, companyAuthStatusCd } = useUserStore()
  const [authConfirm, setAuthConfirm] = useState(false)
  const [projects, setProjects] = useState<ProjectItem[]>(initialData?.projects ?? [])
  const [regionGroups, setRegionGroups] = useState<ProjectRegionGroup[]>([])
  const [totalPages, setTotalPages] = useState(
    initialData ? Math.max(1, Math.ceil(initialData.totalCount / PAGE_SIZE)) : 1,
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isMapView, setIsMapView] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [confirmProject, setConfirmProject] = useState<ProjectItem | null>(null)
  const [searchParams, setSearchParams] = useState<ProjectSearchParams>({
    sortBy: 'project_start_dt',
    sortOrder: 'desc',
    page: 1,
    size: PAGE_SIZE,
  })

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null)
  const overlaysRef = useRef<Map<number, KakaoCustomOverlayInstance>>(new Map())
  const clusterOverlaysRef = useRef<KakaoCustomOverlayInstance[]>([])
  const projectsRef = useRef<ProjectItem[]>([])
  const regionGroupsRef = useRef<ProjectRegionGroup[]>([])
  const selectedProjectIdRef = useRef<number | null>(null)
  const isMarkerClickTriggeredRef = useRef(false)
  const skipNextIdleRef = useRef(false)
  const displayMarkersFnRef = useRef<() => void>(() => {})
  const selectProjectFnRef = useRef<(p: ProjectItem) => void>(() => {})
  const updateBoundsFnRef = useRef<() => void>(() => {})
  // 지도→목록 전환 시 "bounds 포함 재조회"와 "bounds 제거 후 재조회" 두 요청이 경합할 수 있어,
  // 나중에 시작된 요청만 결과를 반영하도록 순번을 매긴다.
  const fetchSeqRef = useRef(0)

  const isCompany = getUserType() === 'COMPANY'

  const getProjectPath = useCallback(
    (sq: number) => (userTypeCd === 302 ? `/projects/company/${sq}` : `/projects/user/${sq}`),
    [userTypeCd],
  )

  const fetchRegionGroups = useCallback(async (params: ProjectSearchParams) => {
    try {
      const { data } = await api.get('/projects/regions', { params })
      setRegionGroups(data.output ?? [])
    } catch {
      setRegionGroups([])
    }
  }, [])

  const fetchProjects = useCallback(async (params: ProjectSearchParams, mapMode = false) => {
    const seq = ++fetchSeqRef.current
    setLoading(true)
    try {
      const size = mapMode ? 1000 : PAGE_SIZE
      const requestParams = {
        ...params,
        size,
        ...(latitude != null && { userLat: latitude }),
        ...(longitude != null && { userLng: longitude }),
      }
      const { data } = await api.get('/projects', { params: requestParams })
      if (seq !== fetchSeqRef.current) return // 이후에 시작된 요청이 있으면 이 결과는 폐기
      const output = data.output ?? data
      setProjects(output.projects ?? [])
      if (!mapMode) {
        const totalCount = output.totalCount ?? output.totalElements ?? 0
        setTotalPages(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)))
      } else {
        fetchRegionGroups(requestParams)
      }
    } catch {
      if (seq === fetchSeqRef.current) toast.error('프로젝트 목록을 불러올 수 없습니다.')
    } finally {
      if (seq === fetchSeqRef.current) setLoading(false)
    }
  }, [latitude, longitude, fetchRegionGroups])

  useEffect(() => {
    fetchProjects(searchParams, isMapView)
  }, [fetchProjects, searchParams, isMapView])

  useEffect(() => { projectsRef.current = projects }, [projects])
  useEffect(() => { regionGroupsRef.current = regionGroups }, [regionGroups])

  // ── 지도 영역(Bounds) 기준 재검색 — 클러스터 클릭 / "이 영역에서 재검색" 버튼 공용 ──
  const updateBounds = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    setSearchParams((prev) => ({
      ...prev,
      minLat: sw.getLat(),
      maxLat: ne.getLat(),
      minLng: sw.getLng(),
      maxLng: ne.getLng(),
      page: 1,
    }))
  }, [])
  useEffect(() => { updateBoundsFnRef.current = updateBounds }, [updateBounds])

  const confirmNavigate = useCallback((project: ProjectItem) => {
    setConfirmProject(project)
  }, [])

  // 카카오 길찾기 링크 규격이 출발지·목적지 좌표를 URL에 요구한다. 서버 리다이렉트를 경유해도
  // 최종적으로 브라우저가 이 URL로 이동하므로 좌표 노출은 어차피 피할 수 없다 — 그래서 직접 만든다.
  // 대신 noopener,noreferrer로 opener 참조와 Referer 누출은 막는다.
  const openKakaoRoute = useCallback((project: ProjectItem) => {
    // 좌표가 숫자가 아니면 링크를 만들지 않는다(경로 구분자 주입 방지)
    if (!Number.isFinite(project.latitude) || !Number.isFinite(project.longitude)) {
      toast.error('이 프로젝트는 위치 정보가 없어 길찾기를 제공할 수 없습니다.')
      return
    }
    const destName = encodeURIComponent(project.projectTtl)
    let url = `https://map.kakao.com/link/to/${destName},${project.latitude},${project.longitude}`
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      url += `/from/${encodeURIComponent('내 위치')},${latitude},${longitude}`
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [latitude, longitude])

  // ── 핀 선택 — 같은 핀을 다시 누르면 상세 이동 확인, 처음 누르면 panTo + 활성화 ──
  const selectProject = useCallback((project: ProjectItem) => {
    const map = mapInstanceRef.current
    const kakaoMaps = window.kakao?.maps
    if (!map || !kakaoMaps || project.latitude == null || project.longitude == null) return

    overlaysRef.current.forEach((ov) => ov.setZIndex(3))

    const isAlreadySelected = selectedProjectIdRef.current === project.projectSq
    if (isAlreadySelected) {
      confirmNavigate(project)
      return
    }

    selectedProjectIdRef.current = project.projectSq
    overlaysRef.current.get(project.projectSq)?.setZIndex(999)
    map.panTo(new kakaoMaps.LatLng(project.latitude, project.longitude))

    requestAnimationFrame(() => {
      document.querySelectorAll('.marker-wrapper').forEach((el) => el.classList.remove('active'))
      document.querySelector(`.marker-wrapper[data-id="${project.projectSq}"]`)?.classList.add('active')
    })
  }, [confirmNavigate])
  useEffect(() => { selectProjectFnRef.current = selectProject }, [selectProject])

  // ── 줌 레벨에 따라 지역 클러스터 핀 / 개별 프로젝트 핀 렌더링 ──
  const displayMarkers = useCallback(() => {
    const map = mapInstanceRef.current
    const kakaoMaps = window.kakao?.maps
    if (!map || !kakaoMaps) return

    overlaysRef.current.forEach((ov) => ov.setMap(null))
    overlaysRef.current.clear()
    clusterOverlaysRef.current.forEach((ov) => ov.setMap(null))
    clusterOverlaysRef.current = []

    const level = map.getLevel()

    if (level >= 8) {
      regionGroupsRef.current.forEach((group) => {
        const coords = new kakaoMaps.LatLng(group.latitude, group.longitude)
        const content = document.createElement('div')
        content.className = 'cluster-pin'
        content.innerHTML = `${escapeHtml(group.sigungu)}<br><b>${escapeHtml(String(group.projectCount))}</b>`
        content.onclick = () => {
          map.setLevel(level - 2, { anchor: coords, animate: true })
          setTimeout(() => updateBoundsFnRef.current(), 350)
        }
        const overlay = new kakaoMaps.CustomOverlay({ position: coords, content, zIndex: 1 })
        overlay.setMap(map)
        clusterOverlaysRef.current.push(overlay)
      })
      return
    }

    projectsRef.current
      .filter((p) => p.latitude != null && p.longitude != null)
      .forEach((project) => {
        const isSubway = project.addressTypeCd === 2702
        const displayAddress = getDisplayAddress(project)

        const content = document.createElement('div')
        content.className = 'marker-wrapper'
        content.setAttribute('data-id', String(project.projectSq))
        if (selectedProjectIdRef.current === project.projectSq) content.classList.add('active')

        // 사용자 입력에서 온 값(제목·회사명·주소·단가·등급)은 전부 escapeHtml을 거친다.
        content.innerHTML = `
          <div class="marker-pin ${isSubway ? 'subway' : ''}">${isSubway ? SVG_TRAIN : SVG_PIN}</div>
          <div class="marker-tooltip">
            <div class="tt-header">
              <span class="tt-badge">${escapeHtml(project.devGradeNm || '등급미정')}</span>
              <span class="tt-ttl">${escapeHtml(project.projectTtl)}</span>
            </div>
            <div class="tt-body">
              <div class="tt-item">${SVG_BUILDING}&nbsp;${escapeHtml(project.companyNm)}</div>
              <div class="tt-item">${isSubway ? SVG_TRAIN : SVG_PIN}&nbsp;${escapeHtml(displayAddress)}</div>
              <div class="tt-item text-primary-light" style="font-weight:700;margin-bottom:6px">${escapeHtml(project.formattedSalary || '단가협의')}</div>
              <button type="button" class="btn-route-search">${SVG_NAV}&nbsp;경로 찾기</button>
            </div>
          </div>`

        const routeBtn = content.querySelector<HTMLButtonElement>('.btn-route-search')
        routeBtn?.addEventListener('mousedown', (e) => {
          e.stopPropagation()
          isMarkerClickTriggeredRef.current = true
          openKakaoRoute(project)
          setTimeout(() => { isMarkerClickTriggeredRef.current = false }, 300)
        })
        // click도 막아야 한다 — mousedown의 stopPropagation은 뒤따르는 click 버블링을 막지 못해서,
        // 버튼 click이 marker-wrapper의 click(selectProject)까지 전파되어 상세이동 모달이 동시에 뜨는 문제(모바일에서 두드러짐)
        routeBtn?.addEventListener('click', (e) => { e.stopPropagation() })

        content.addEventListener('mousedown', () => { isMarkerClickTriggeredRef.current = true })
        content.addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()
          selectProjectFnRef.current(project)
          setTimeout(() => { isMarkerClickTriggeredRef.current = false }, 200)
        })

        const overlay = new kakaoMaps.CustomOverlay({
          position: new kakaoMaps.LatLng(project.latitude!, project.longitude!),
          content,
          zIndex: 3,
        })
        overlay.setMap(map)
        overlaysRef.current.set(project.projectSq, overlay)
      })
  }, [openKakaoRoute])
  useEffect(() => { displayMarkersFnRef.current = displayMarkers }, [displayMarkers])

  // ── 지도 초기화 — SDK 로드(kakao.maps.load) 완료 후 DOM 페인트까지 기다린 뒤 생성 ──
  useEffect(() => {
    if (!isMapView) return
    let cancelled = false

    loadKakaoMaps().then(() => {
      if (cancelled) return
      requestAnimationFrame(() => {
        if (cancelled || !mapContainerRef.current || mapInstanceRef.current) return
        const kakaoMaps = window.kakao.maps

        const savedLat = sessionStorage.getItem('mapProjectLat')
        const savedLng = sessionStorage.getItem('mapProjectLng')
        const centerLat = Number(savedLat) || latitude || 37.5665
        const centerLng = Number(savedLng) || longitude || 126.978
        sessionStorage.removeItem('mapProjectLat')
        sessionStorage.removeItem('mapProjectLng')

        const map: KakaoMapInstance = new kakaoMaps.Map(mapContainerRef.current, {
          center: new kakaoMaps.LatLng(centerLat, centerLng),
          level: 7,
        })
        // 줌/이동(idle)마다 자동 재검색 — 단, 지도 생성 직후 첫 idle은 건너뛴다(초기 전국 단위 결과를 곧바로 좁히지 않기 위함)
        skipNextIdleRef.current = true
        kakaoMaps.event.addListener(map, 'idle', () => {
          if (skipNextIdleRef.current) {
            skipNextIdleRef.current = false
            return
          }
          updateBoundsFnRef.current()
        })
        kakaoMaps.event.addListener(map, 'zoom_changed', () => displayMarkersFnRef.current())
        // 핀이 아닌 지도 배경 클릭 시 선택 해제 (핀/버튼 클릭은 isMarkerClickTriggeredRef로 방어)
        kakaoMaps.event.addListener(map, 'click', () => {
          if (isMarkerClickTriggeredRef.current) return
          selectedProjectIdRef.current = null
          document.querySelectorAll('.marker-wrapper').forEach((el) => el.classList.remove('active'))
        })

        mapInstanceRef.current = map
        setMapReady(true)
      })
    })

    return () => { cancelled = true }
  }, [isMapView, latitude, longitude])

  // ── 핀 갱신 — 지도 준비 완료 + projects/regionGroups 변경 시 ──
  useEffect(() => {
    if (!isMapView || !mapReady) return
    displayMarkers()
  }, [isMapView, mapReady, projects, regionGroups, displayMarkers])

  // ── 지도 뷰 해제 시 정리 ──
  useEffect(() => {
    if (isMapView) return
    overlaysRef.current.forEach((ov) => ov.setMap(null))
    overlaysRef.current.clear()
    clusterOverlaysRef.current.forEach((ov) => ov.setMap(null))
    clusterOverlaysRef.current = []
    selectedProjectIdRef.current = null
    mapInstanceRef.current = null
    setMapReady(false)
    setSearchParams((prev) => {
      if (prev.minLat == null) return prev
      const next = { ...prev }
      delete next.minLat
      delete next.maxLat
      delete next.minLng
      delete next.maxLng
      return next
    })
  }, [isMapView])

  function handleSearch(params: ProjectSearchParams) {
    setCurrentPage(1)
    setSearchParams({ ...params, size: PAGE_SIZE, page: 1 })
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
    setSearchParams((prev) => ({ ...prev, page }))
  }

  function handleCardClick(sq: number) {
    router.push(getProjectPath(sq))
  }

  async function handleScrap(sq: number, current: 'Y' | 'N') {
    if (!isLoggedIn()) {
      toast.error('로그인이 필요합니다.')
      return
    }
    const isScrapped = current === 'Y'
    try {
      await api.post(`/projects/${sq}/scraps`, {
        hasScrapped: isScrapped,
        target: '프로젝트',
      })
      setProjects((prev) =>
        prev.map((p) =>
          p.projectSq === sq
            ? { ...p, hasScrapped: (isScrapped ? 'N' : 'Y') as 'Y' | 'N' }
            : p,
        ),
      )
      toast.success(isScrapped ? '스크랩 해제에 성공하였습니다.' : '스크랩에 성공하였습니다.')
    } catch {
      toast.error('스크랩 처리 중 오류가 발생했습니다.')
    }
  }

  function handleRegisterClick() {
    // Vue ProjectListPage.handleRegisterClick — 미인증(2501)이면 인증 페이지 이동 확인 모달
    if (String(companyAuthStatusCd) === '2501') { setAuthConfirm(true); return }
    router.push('/mypage/project-post')
  }

  return (
    <div className="space-y-4">
      <ProjectFilterBar onSearch={handleSearch} />

      {/* 목록/지도 토글 */}
      <div className="flex items-center justify-between">
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <div />
        )}
        <div className="flex gap-1 rounded-full border bg-muted p-1 shadow-sm">
          <button
            onClick={() => setIsMapView(false)}
            className={`cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors ${
              !isMapView ? 'bg-primary text-primary-foreground' : 'text-foreground'
            }`}
          >
            <List className="mr-1 inline h-3.5 w-3.5" />
            목록
          </button>
          <button
            onClick={() => setIsMapView(true)}
            className={`cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors ${
              isMapView ? 'bg-primary text-primary-foreground' : 'text-foreground'
            }`}
          >
            <MapIcon className="mr-1 inline h-3.5 w-3.5" />
            지도
          </button>
        </div>
      </div>

      {/* 목록 뷰 */}
      {!isMapView && (
        <>
          {loading && projects.length === 0 ? (
            // SSR된 초기 목록이 있으면 스켈레톤으로 덮지 않고 갱신 완료 시 교체
            <div className="space-y-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : !loading && projects.length === 0 ? (
            <div className="space-y-4">
              <p className="rounded border bg-muted/40 py-10 text-center text-sm text-muted-foreground">
                검색 결과가 없습니다.
              </p>
              {isCompany && (
                <div className="flex justify-center py-2">
                  <Button onClick={handleRegisterClick} className="rounded-full px-8 shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    프로젝트 등록하기
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.projectSq}
                    project={project}
                    onClick={handleCardClick}
                    onScrap={handleScrap}
                  />
                ))}
              </div>

              {isCompany && (
                <div className="flex justify-center py-2">
                  <Button onClick={handleRegisterClick} className="rounded-full px-8 shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    프로젝트 등록하기
                  </Button>
                </div>
              )}
            </>
          )}

          {totalPages > 1 && (
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* 지도 뷰 */}
      {isMapView && (
        <div className="flex overflow-hidden rounded-xl border shadow-sm" style={{ height: 500 }}>
          {/* 좌측 — 프로젝트 목록 (핀 클릭과 동일하게 선택→재클릭 시 상세 이동 확인) */}
          <div className="hidden w-72 flex-col border-r bg-muted/30 md:flex">
            <div className="flex items-center justify-between border-b bg-white px-3 py-2 text-sm font-semibold">
              <span>결과 <span className="text-primary">{projects.length}</span>건</span>
              {isCompany && (
                <button
                  onClick={handleRegisterClick}
                  className="cursor-pointer rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                >
                  등록
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground">검색 결과가 없습니다.</p>
              ) : (
                projects.map((p, idx) => {
                  const { status, dDay } = getProjectStatus(p)
                  const isSubway = p.addressTypeCd === 2702
                  return (
                    <div
                      key={p.projectSq}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectProject(p)}
                      onKeyDown={(e) => { if (e.key === 'Enter') selectProject(p) }}
                      className="block w-full cursor-pointer border-b px-3 py-2.5 text-left hover:bg-muted/60"
                    >
                      <div className="mb-1 flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                          {idx + 1}
                        </span>
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">{p.projectTtl}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleScrap(p.projectSq, p.hasScrapped) }}
                          className="shrink-0 cursor-pointer"
                        >
                          <Heart className={cn('h-3.5 w-3.5', p.hasScrapped === 'Y' ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                        </button>
                      </div>
                      <p className="mb-0.5 flex items-center gap-1 pl-7 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3 text-primary" />
                        {p.companyNm}
                      </p>
                      <p className="mb-1.5 flex items-center gap-1 pl-7 text-xs text-muted-foreground">
                        {isSubway ? <Train className="h-3 w-3 text-primary" /> : <MapPin className="h-3 w-3 text-primary" />}
                        <span className="truncate">{getDisplayAddress(p)}</span>
                      </p>
                      <div className="flex items-center justify-between pl-7">
                        <p className="text-xs font-bold text-primary">{p.formattedSalary}</p>
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', status === '채용중' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                          {status}{dDay ? ` ${dDay}` : ''}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 우측 — 카카오 지도 (줌/이동 시 자동 재검색) */}
          <div className="relative flex-1">
            <div ref={mapContainerRef} className="h-full w-full bg-muted" />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmProject != null}
        title="프로젝트 상세 이동"
        message={confirmProject ? `[${confirmProject.projectTtl}] 상세 페이지로 이동하시겠습니까?` : ''}
        onConfirm={() => {
          if (!confirmProject) return
          if (isMapView && confirmProject.latitude != null && confirmProject.longitude != null) {
            sessionStorage.setItem('mapProjectLat', String(confirmProject.latitude))
            sessionStorage.setItem('mapProjectLng', String(confirmProject.longitude))
          }
          router.push(getProjectPath(confirmProject.projectSq))
        }}
        onClose={() => setConfirmProject(null)}
      />

      <ConfirmDialog
        open={authConfirm}
        title="기업 인증 필요"
        message="인증 페이지로 이동하시겠습니까?"
        onConfirm={() => router.push('/mypage/affiliation-edit')}
        onClose={() => setAuthConfirm(false)}
      />
    </div>
  )
}
