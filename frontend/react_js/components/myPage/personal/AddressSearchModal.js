/* global daum, kakao */ // 주소/좌표 API 전역 선언

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './AddressSearchModal.module.css';

const AddressSearchModal = ({ onComplete }) => {

  useEffect(() => {
    // Daum Postcode API 초기화
    const container = document.getElementById('daum-postcode');
    if (!container) return;

    new window.daum.Postcode({
      onComplete: function (data) {
        const addr =
          data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        const parts = addr.split(' ');
        let sido = parts[0] || '';
        let sigungu = parts[1] || '';
        
        // 복합명칭(예: "광주 동구") 처리
        if (sido.endsWith('시') && parts.length > 2) {
          sigungu = parts[1] + ' ' + parts[2];
        }
        
        if (!sido || !sigungu) {
          alert(
            '주소에서 시군구 정보를 추출할 수 없습니다. 다른 주소를 선택해주세요.'
          );
          return;
        }

        // 좌표 변환
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(addr, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const latitude = result[0].y;
            const longitude = result[0].x;

            const addressData = {
              zonecode: data.zonecode,
              address: addr,
              sido,
              sigungu,
              latitude,
              longitude,
            };

            console.log('[주소 선택 완료]', addressData);
            console.log('[sigungu 확인]', sigungu, typeof sigungu);

            onComplete?.(addressData);
          } else {
            alert('선택한 주소의 좌표 정보를 찾을 수 없습니다.');
            console.warn('[좌표 변환 실패]', addr);
          }
        });
      },
    }).embed(container);
  }, [onComplete]);

  const handleClose = () => {
    onComplete?.(null);
  };

  return createPortal(
    <div className={styles.modalLayer} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>주소 검색</h5>
          <button 
            className={styles.closeBtn} 
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        <div id="daum-postcode"></div>
      </div>
    </div>,
    document.body
  );
};

export default AddressSearchModal;

