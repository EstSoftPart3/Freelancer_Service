// 길찾기 리다이렉트 — 프로젝트 좌표를 서버에서 조회해 카카오 지도로 302 보낸다.
//
// 목적: 우리 URL에 프로젝트명·좌표가 남지 않게 하는 것. 클라이언트는 /directions/{sq}만 열고,
// 목적지 좌표는 서버가 상세 API에서 가져온다.
// 출발지(사용자 위치)는 의도적으로 넘기지 않는다 — 쿼리로 실으면 좌표가 다시 주소창에 노출된다.
import { getProjectDetail } from '@/lib/fetchers'
import { buildKakaoRouteUrl } from '@/lib/kakaoMap'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectSq: string }> },
) {
  const { projectSq } = await params

  if (!/^\d+$/.test(projectSq)) {
    return new Response('잘못된 프로젝트 번호입니다.', { status: 400 })
  }

  const project = await getProjectDetail(projectSq)
  if (!project) {
    return new Response('프로젝트를 찾을 수 없습니다.', { status: 404 })
  }
  if (project.latitude == null || project.longitude == null) {
    return new Response('이 프로젝트는 위치 정보가 없어 길찾기를 제공할 수 없습니다.', { status: 404 })
  }

  const url = buildKakaoRouteUrl({
    name: project.projectTtl,
    latitude: project.latitude,
    longitude: project.longitude,
  })

  // 302 + no-store: 좌표가 CDN/브라우저 캐시에 남지 않게 한다.
  return new Response(null, {
    status: 302,
    headers: { Location: url, 'Cache-Control': 'no-store' },
  })
}
