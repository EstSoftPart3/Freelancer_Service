import React, { useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';
import styles from './ModalContainer.module.css';

/**
 * 전역 모달 컨테이너
 * modalStore의 modalStack을 감시하고 모달을 렌더링합니다.
 */
export default function ModalContainer() {
  const { modalStack, closeModal } = useModalStore();
  const currentModal = modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;

  // 모달이 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (currentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [currentModal]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && currentModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [currentModal, closeModal]);

  if (!currentModal) return null;

  const { component: ModalComponent, props } = currentModal;

  // modal-xl보다 큰 modalHuge를 위해 추가
  const sizeClass = props.size === 'modalHuge' ? styles.modalHuge : (props.size || 'modal-lg');

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div 
        className={`modal fade show ${styles.modalDialog}`}
        style={{ display: 'block' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizeClass}`}>
          <ModalComponent {...props} onClose={closeModal} />
        </div>
      </div>
    </div>
  );
}

