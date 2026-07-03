// Daum 우편번호 스크립트는 layout.tsx에서 afterInteractive로 전역 로드된다.
// 클릭 시점에 아직 로드가 끝나지 않았을 수 있으므로, 사용 전 항상 이 함수로 로드 완료를 기다린다.
let daumLoadPromise: Promise<void> | null = null

export function loadDaumPostcode(): Promise<void> {
  if (daumLoadPromise) return daumLoadPromise

  daumLoadPromise = new Promise((resolve) => {
    const waitForSdk = () => {
      if (window.daum?.Postcode) {
        resolve()
      } else {
        setTimeout(waitForSdk, 100)
      }
    }
    waitForSdk()
  })

  return daumLoadPromise
}
