import styles from './TermsAgreementModal.module.css'

export default function TermsAgreementModal({ title, body, onConfirm, onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>{title}</h5>
            <button
              type="button"
              className={styles.btnClose}
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div 
            className={styles.modalBody} 
            style={{ maxHeight: '500px', overflowY: 'auto' }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={onConfirm}>
              동의
            </button>
            <button className="btn btn-light" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

