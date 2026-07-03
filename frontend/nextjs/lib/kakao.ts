// Kakao Maps SDK는 autoload=false로 로드된다 (layout.tsx).
// SDK 내부의 document.write 기반 라이브러리 로딩이 비동기 스크립트에서 차단되는 문제를 피하기 위함.
// 지도/지오코딩이 필요한 곳에서는 반드시 이 함수로 로드 완료를 기다린 뒤 window.kakao.maps를 사용한다.
let kakaoLoadPromise: Promise<void> | null = null

export function loadKakaoMaps(): Promise<void> {
  if (kakaoLoadPromise) return kakaoLoadPromise

  kakaoLoadPromise = new Promise((resolve) => {
    const waitForSdk = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => resolve())
      } else {
        setTimeout(waitForSdk, 100)
      }
    }
    waitForSdk()
  })

  return kakaoLoadPromise
}
