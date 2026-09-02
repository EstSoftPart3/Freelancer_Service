// Kakao Maps SDK는 autoload=false로 로드된다 (layout.tsx).
// SDK 내부의 document.write 기반 라이브러리 로딩이 비동기 스크립트에서 차단되는 문제를 피하기 위함.
// 지도/지오코딩이 필요한 곳에서는 반드시 이 함수로 로드 완료를 기다린 뒤 window.kakao.maps를 사용한다.
let kakaoLoadPromise: Promise<void> | null = null

// SDK 가 끝내 안 뜨는 경우(네트워크 차단, 스크립트 로드 실패)를 위해 기다리는 시간에 상한을 둔다.
// 상한이 없으면 100ms 폴링이 영원히 돌고 .then() 이 실행되지 않아, 호출부는 실패조차 알 수 없다.
// 실제로 주소 좌표가 조용히 비어 등록이 500 으로 끝나는 원인 중 하나였다(2026-09-02).
const SDK_WAIT_TIMEOUT_MS = 10_000

export function loadKakaoMaps(): Promise<void> {
  if (kakaoLoadPromise) return kakaoLoadPromise

  kakaoLoadPromise = new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const waitForSdk = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => resolve())
      } else if (Date.now() - startedAt >= SDK_WAIT_TIMEOUT_MS) {
        // 다음 호출이 다시 시도할 수 있도록 캐시를 비운다 — 일시적 실패를 영구 실패로 굳히지 않는다.
        kakaoLoadPromise = null
        reject(new Error('Kakao Maps SDK 로드 시간이 초과되었습니다.'))
      } else {
        setTimeout(waitForSdk, 100)
      }
    }
    waitForSdk()
  })

  return kakaoLoadPromise
}
