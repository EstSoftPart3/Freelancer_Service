import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
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
        <div style={{ fontSize: 96, fontWeight: 700, display: 'flex' }}>Ctrl + F</div>
        <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 24, display: 'flex' }}>
          IT 프리랜서와 기업을 연결하는 프로젝트 매칭 플랫폼
        </div>
      </div>
    ),
    size,
  )
}
