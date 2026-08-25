import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// 임시 마크 — 브랜딩 타이포 이미지 수령 후 교체 예정.
// 32px 에 "Ctrl + F" 를 다 넣으면 읽히지 않으므로 키캡 안의 F 하나로 압축했다.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#18181b',
          borderRadius: 6,
          color: '#fafafa',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        F
      </div>
    ),
    size,
  )
}
