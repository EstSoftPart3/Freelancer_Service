import api from './api'

// React StrictMode(개발)에서 effect가 두 번 실행돼 조회수가 2씩 오르는 것을 방지한다.
// 동일 리소스에 대한 increment 호출이 짧은 시간(3초) 내 중복되면 1회만 보낸다.
const recent = new Map<string, number>()

export function incrementView(resourcePath: string) {
  const now = Date.now()
  const last = recent.get(resourcePath)
  if (last && now - last < 3000) return
  recent.set(resourcePath, now)
  api.patch(`${resourcePath}/increment-view`).catch(() => {})
}
