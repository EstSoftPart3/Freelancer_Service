import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// 임시 마크 — 브랜딩 타이포 이미지 수령 후 교체 예정.
// 180px 은 여유가 있어 "Ctrl" 을 위에 얹고 F 를 키캡처럼 세웠다.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#18181b',
          color: '#fafafa',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 600, color: '#a1a1aa', display: 'flex' }}>Ctrl +</div>
        <div style={{ fontSize: 92, fontWeight: 700, display: 'flex', lineHeight: 1 }}>F</div>
      </div>
    ),
    size,
  )
}
