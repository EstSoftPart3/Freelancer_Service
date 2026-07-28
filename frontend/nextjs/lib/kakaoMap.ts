// 카카오 길찾기 링크 생성.
//
// 카카오 링크 규격(map.kakao.com/link/to/{목적지명},{위도},{경도})이 좌표를 URL에 요구하기 때문에,
// 클라이언트에서 이 URL을 직접 만들면 프로젝트명·목적지 좌표는 물론 사용자 위치까지
// 우리 사이트의 주소창·히스토리·Referer에 그대로 남는다.
// 그래서 링크 조립은 서버 라우트(app/directions/[projectSq]/route.ts)에서만 하고,
// 클라이언트는 getDirectionsPath()가 만든 내부 경로로만 이동한다.

export interface RouteDestination {
  name: string
  latitude: number
  longitude: number
}

/** 서버에서만 호출한다. 클라이언트에서 쓰면 좌표 노출 차단이 무의미해진다. */
export function buildKakaoRouteUrl(dest: RouteDestination): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(dest.name)},${dest.latitude},${dest.longitude}`
}

/** 클라이언트가 여는 내부 경로 — 좌표를 포함하지 않는다. */
export function getDirectionsPath(projectSq: number | string): string {
  return `/directions/${projectSq}`
}
