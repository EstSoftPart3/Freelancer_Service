import { useState } from 'react'
import { api } from '@/lib/axios'
import styles from './LocationSelectModal.module.css'

export default function LocationSelectModal({ onClose, onLocationSelected }) {
  const [postcode, setPostcode] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [jibunAddress, setJibunAddress] = useState('')
  const [selectedCoordinates, setSelectedCoordinates] = useState(null)

  // 우편번호 검색 (다음 우편번호 서비스)
  const openPostcode = () => {
    if (typeof window.daum === 'undefined') {
      alert('우편번호 서비스를 로드할 수 없습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        console.log('다음 우편번호 서비스 전체 데이터:', data)

        setPostcode(data.zonecode)
        setSelectedAddress(data.address)
        setJibunAddress(data.jibunAddress)

        // 좌표가 있으면 저장
        if (data.x && data.y) {
          const lat = parseFloat(data.y)
          const lng = parseFloat(data.x)

          if (!isNaN(lat) && !isNaN(lng)) {
            setSelectedCoordinates({
              latitude: lat,
              longitude: lng
            })
            console.log('저장된 좌표:', { latitude: lat, longitude: lng })
          } else {
            console.log('유효하지 않은 좌표 - y:', data.y, 'x:', data.x)
          }
        } else {
          console.log('좌표 정보 없음! data.x:', data.x, 'data.y:', data.y)
        }
      }
    }).open()
  }

  // 위치 확인
  const confirmLocation = async () => {
    if (!selectedAddress) {
      alert('주소를 선택해주세요')
      return
    }

    console.log('도로명 주소:', selectedAddress)
    console.log('지번 주소:', jibunAddress)

    // 좌표가 이미 있으면 바로 사용
    if (selectedCoordinates) {
      const location = {
        latitude: selectedCoordinates.latitude,
        longitude: selectedCoordinates.longitude,
        address: selectedAddress
      }
      console.log('저장된 좌표 사용:', location)
      onLocationSelected(location)
      return
    }

    try {
      // 카카오 지오코딩 시도
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        const geocoder = new window.kakao.maps.services.Geocoder()
        geocoder.addressSearch(selectedAddress, async (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const location = {
              latitude: parseFloat(result[0].y),
              longitude: parseFloat(result[0].x),
              address: selectedAddress
            }
            console.log('카카오 지오코딩 성공:', location)
            onLocationSelected(location)
          } else {
            // 카카오 실패 시 네이버 백엔드 API 시도
            console.log('카카오 지오코딩 실패:', status, '→ 네이버 API 시도')
            try {
              const response = await api.$post('/map/geocode', { address: selectedAddress })
              if (response.success && response.latitude && response.longitude) {
                const location = {
                  latitude: response.latitude,
                  longitude: response.longitude,
                  address: selectedAddress
                }
                console.log('네이버 지오코딩 성공:', location)
                onLocationSelected(location)
              } else {
                console.error('네이버 지오코딩도 실패:', response)
                alert('주소를 좌표로 변환할 수 없습니다. 다른 주소를 입력해주세요.')
              }
            } catch (error) {
              console.error('네이버 지오코딩 API 오류:', error)
              alert('주소를 좌표로 변환할 수 없습니다')
            }
          }
        })
      } else {
        // 카카오 API 없으면 바로 네이버 사용
        console.log('카카오 지도 API 없음 → 네이버 API 사용')
        const response = await api.$post('/map/geocode', { address: selectedAddress })
        if (response.success && response.latitude && response.longitude) {
          const location = {
            latitude: response.latitude,
            longitude: response.longitude,
            address: selectedAddress
          }
          console.log('네이버 지오코딩 성공:', location)
          onLocationSelected(location)
        } else {
          alert('주소를 좌표로 변환할 수 없습니다')
        }
      }
    } catch (error) {
      console.error('주소 변환 실패:', error)
      alert('주소를 좌표로 변환할 수 없습니다')
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h5 className="modal-title">위치 선택</h5>
          <button onClick={onClose} className={styles.btnClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label fw-bold">주소 검색</label>
            <div className="input-group">
              <input
                value={postcode}
                type="text"
                className="form-control"
                placeholder="우편번호"
                readOnly
              />
              <button onClick={openPostcode} className="btn btn-rounded btn-primary">
                우편번호 검색
              </button>
            </div>
          </div>

          {selectedAddress && (
            <div className={`${styles.selectedAddress} p-3 bg-light rounded`}>
              <strong>선택된 주소:</strong><br />
              {selectedAddress}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className="btn btn-rounded btn-secondary">취소</button>
          <button 
            onClick={confirmLocation} 
            className="btn btn-rounded btn-primary" 
            disabled={!selectedAddress}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

