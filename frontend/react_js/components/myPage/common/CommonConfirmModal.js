import React from 'react';
import { useModalStore } from '@/store/modalStore';

/**
 * 공통 확인 모달
 * 
 * Props:
 * - title: string (default: '확인')
 * - message: string (default: '이 작업을 계속하시겠습니까?')
 * - confirmText: string (default: '확인')
 * - cancelText: string (default: '취소')
 * - onConfirm: function (required) - 확인 버튼 클릭 시 실행
 * - onCancel: function (optional) - 취소 버튼 클릭 시 실행
 * - onClose: function (from ModalContainer)
 */
export default function CommonConfirmModal({
  title = '확인',
  message = '이 작업을 계속하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  onClose,
}) {
  const { closeModal } = useModalStore();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      closeModal();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">{title}</h5>
        <button type="button" className="btn-close" onClick={handleClose}></button>
      </div>
      <div className="modal-body">
        <p>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-primary" onClick={handleConfirm}>
          {confirmText}
        </button>
        <button className="btn btn-light" onClick={handleCancel}>
          {cancelText}
        </button>
      </div>
    </div>
  );
}

