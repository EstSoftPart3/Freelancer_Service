import { useCallback } from 'react'

export interface DaumPostcodeData {
  zonecode: string
  address: string
  addressEnglish: string
  addressType: 'R' | 'J'
  bcode: string
  bname: string
  buildingCode: string
  buildingName: string
  roadname: string
  sido: string
  sigungu: string
  sigunguCode: string
  userSelectedType: 'R' | 'J'
}

interface UseDaumPostcodeProps {
  onComplete: (data: DaumPostcodeData) => void
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
        width?: string | number
        height?: string | number
      }) => {
        open: () => void
      }
    }
  }
}

export function useDaumPostcode({ onComplete }: UseDaumPostcodeProps) {
  const open = useCallback(() => {
    if (typeof window === 'undefined' || !window.daum) {
      console.error('Daum Postcode script not loaded')
      alert('주소 검색 서비스를 불러올 수 없습니다.')
      return
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        onComplete(data)
      },
      width: '100%',
      height: '100%',
    }).open()
  }, [onComplete])

  return { open }
}