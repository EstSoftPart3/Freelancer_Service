import { useModalStore } from '../../../store/modalStore';
import './ResumeModal.css';

const ResumeModal = ({ resumeSq = null, onConfirm }) => {
  const modalStore = useModalStore();

  // 확인 버튼 클릭
  const confirm = () => {
    onConfirm?.();
    modalStore.closeModal();
  };

  // 모달 닫기
  const closeModal = () => {
    modalStore.closeModal();
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h4 className="modal-title" id="smallModalLabel">
          이력서 등록
        </h4>
        <button
          type="button"
          className="btn-close"
          onClick={closeModal}
          aria-hidden="true"
        >
          ×
        </button>
      </div>
      <div className="modal-body">
        <p>{resumeSq ? '수정하겠습니까?' : '등록하시겠습니까?'}</p>
      </div>
      <div className="modal-footer">
        <button type="submit" className="btn btn-primary" onClick={confirm}>
          확인
        </button>
        <button type="button" className="btn btn-light" onClick={closeModal}>
          취소
        </button>
      </div>
    </div>
  );
};

export default ResumeModal;

