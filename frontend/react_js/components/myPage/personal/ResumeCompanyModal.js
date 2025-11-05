import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAlertStore } from '../../../store/alertStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ResumeCompanyModal.module.css';

const ResumeCompanyModal = ({ onComplete }) => {
  const alertStore = useAlertStore();

  const [form, setForm] = useState({
    company: '',
    department: '',
    position: '',
    startDate: null,
    endDate: null,
    period: '',
  });

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formatDate = (date) => {
    if (!date) return '';
    
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    }
    
    return date.substring(0, 10).replace(/-/g, '.');
  };

  // API용 날짜 포맷팅 (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    if (!date) return '';
    
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return date;
  };

  // 제출
  const submit = () => {
    if (!form.company) {
      alertStore.show('회사명을 입력해주세요.', 'danger');
      return;
    }
    if (!form.department) {
      alertStore.show('부서를 입력하세요.', 'danger');
      return;
    }
    if (!form.position) {
      alertStore.show('직급을 입력하세요.', 'danger');
      return;
    }
    if (!form.startDate) {
      alertStore.show('근무 기간을 선택하세요.', 'danger');
      return;
    }

    // 화면 표시용 기간 (YYYY.MM.DD ~ YYYY.MM.DD)
    const period = form.endDate
      ? `${formatDate(form.startDate)} ~ ${formatDate(form.endDate)}`
      : `${formatDate(form.startDate)} ~`;

    // 부모로 데이터 전달
    onComplete?.({
      company: form.company,
      department: form.department,
      position: form.position,
      startDate: form.startDate,
      endDate: form.endDate,
      period: period,
    });
  };

  const close = () => {
    onComplete?.(null);
  };

  return createPortal(
    <div className={styles.modalLayer} onClick={close}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>회사 이력 추가하기</h4>
          <button className={styles.closeBtn} onClick={close}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.modalLabel}>회사명</label>
              <input
                value={form.company}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, company: e.target.value }))
                }
                type="text"
                className="form-control"
                placeholder="회사명"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.modalLabel}>부서</label>
              <input
                value={form.department}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, department: e.target.value }))
                }
                type="text"
                className="form-control"
                placeholder="부서"
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${styles.positionGroup}`}>
              <label className={styles.modalLabel}>직급</label>
              <input
                value={form.position}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, position: e.target.value }))
                }
                type="text"
                className="form-control"
                placeholder="직급"
              />
            </div>
            <div className={`${styles.formGroup} ${styles.periodGroup}`}>
              <label className={styles.modalLabel}>근무 기간</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className={`${styles.datepickerWrapper} ${styles.flexGrow1}`}>
                  <DatePicker
                    selected={form.startDate}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, startDate: date }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="입사일"
                    className="form-control"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                  />
                  <i className="fas fa-calendar datepicker-icon"></i>
                </div>
                <span style={{ alignSelf: 'center' }}>~</span>
                <div className={`${styles.datepickerWrapper} ${styles.flexGrow1}`}>
                  <DatePicker
                    selected={form.endDate}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, endDate: date }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="퇴사일"
                    className="form-control"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                  />
                  <i className="fas fa-calendar datepicker-icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-primary" onClick={submit}>
            저장하기
          </button>
          <button className="btn btn-light" onClick={close}>
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ResumeCompanyModal;

