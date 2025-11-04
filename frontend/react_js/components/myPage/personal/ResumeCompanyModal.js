import { useState } from 'react';
import { useModalStore } from '../../../store/modalStore';
import { useAlertStore } from '../../../store/alertStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ResumeCompanyModal.css';

const ResumeCompanyModal = ({ onComplete }) => {
  const modalStore = useModalStore();
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
      careerCompanyNm: form.company,
      careerDepartmentNm: form.department,
      careerPositionNm: form.position,
      careerStartDt: formatDateForAPI(form.startDate),
      careerEndDt: formatDateForAPI(form.endDate),
      period: period,
    });

    modalStore.closeModal();
  };

  return (
    <div className="modal-layer">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title">회사 이력 추가하기</h4>
          <button className="close-btn" onClick={() => modalStore.closeModal()}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="modal-label">회사명</label>
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
            <div className="form-group">
              <label className="modal-label">부서</label>
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
          <div className="form-row">
            <div className="form-group position-group">
              <label className="modal-label">직급</label>
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
            <div className="form-group period-group">
              <label className="modal-label">근무 기간</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="datepicker-wrapper flex-grow-1">
                  <DatePicker
                    selected={form.startDate}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, startDate: date }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="입사년월"
                    className="form-control"
                    showMonthYearPicker
                    showFullMonthYearPicker
                  />
                  <i className="fas fa-calendar datepicker-icon"></i>
                </div>
                <span style={{ alignSelf: 'center' }}>~</span>
                <div className="datepicker-wrapper flex-grow-1">
                  <DatePicker
                    selected={form.endDate}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, endDate: date }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="퇴사년월"
                    className="form-control"
                    showMonthYearPicker
                    showFullMonthYearPicker
                  />
                  <i className="fas fa-calendar datepicker-icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={submit}>
            저장하기
          </button>
          <button className="btn btn-light" onClick={() => modalStore.closeModal()}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeCompanyModal;

