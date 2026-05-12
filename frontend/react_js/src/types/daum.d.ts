declare global {
  interface Window {
    daum: {
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

export interface DaumPostcodeData {
  zonecode: string          // 우편번호
  address: string           // 도로명주소 또는 지번주소
  addressEnglish: string    // 영문주소
  addressType: 'R' | 'J'    // R: 도로명, J: 지번
  bcode: string             // 법정동코드
  bname: string             // 법정동명
  buildingCode: string      // 건물관리번호
  buildingName: string      // 건물명
  roadname: string          // 도로명
  sido: string              // 시/도
  sigungu: string           // 시/군/구
  sigunguCode: string       // 시군구 코드
  userSelectedType: 'R' | 'J'
}

export {}