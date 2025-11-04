import { useState } from 'react';
import { useModalStore } from '../../../store/modalStore';
import { useAlertStore } from '../../../store/alertStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TrainingModal.css';

const TrainingModal = ({ onComplete }) => {
  const modalStore = useModalStore();
  const alertStore = useAlertStore();

  const [form, setForm] = useState({
    trainingProgramNm: '',
    trainingInstitutionNm: '',
    trainingStartDt: null,
    trainingEndDt: null,
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
    if (!form.trainingProgramNm) {
      alertStore.show('교육명을 입력해주세요.', 'danger');
      return;
    }
    if (!form.trainingInstitutionNm) {
      alertStore.show('교육 기관을 입력하세요.', 'danger');
      return;
    }
    if (!form.trainingStartDt) {
      alertStore.show('교육 기간을 선택하세요.', 'danger');
      return;
    }

    // 화면 표시용 기간 (YYYY.MM.DD ~ YYYY.MM.DD)
    const period = `${formatDate(form.trainingStartDt)} ~ ${formatDate(form.trainingEndDt)}`;

    // 부모에게 데이터 전달
    onComplete?.({
      trainingProgramNm: form.trainingProgramNm,
      trainingInstitutionNm: form.trainingInstitutionNm,
      trainingStartDt: formatDateForAPI(form.trainingStartDt),
      trainingEndDt: formatDateForAPI(form.trainingEndDt),
      period: period,
    });

    modalStore.closeModal();
  };

  return (
    <div className="modal-layer">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title">교육 이력 추가하기</h4>
          <button className="close-btn" onClick={() => modalStore.closeModal()}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="modal-label">교육명</label>
              <input
                value={form.trainingProgramNm}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, trainingProgramNm: e.target.value }))
                }
                type="text"
                className="form-control"
                placeholder="교육명"
              />
            </div>
            <div className="form-group">
              <label className="modal-label">교육 기관</label>
              <input
                value={form.trainingInstitutionNm}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    trainingInstitutionNm: e.target.value,
                  }))
                }
                type="text"
                className="form-control"
                placeholder="교육 기관"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group position-group">
              <label className="modal-label">교육 기간</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="datepicker-wrapper flex-grow-1">
                  <DatePicker
                    selected={form.trainingStartDt}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, trainingStartDt: date }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="시작년월"
                    className="form-control"
                    showMonthYearPicker
                    showFullMonthYearPicker
                  />
                  <i className="fas fa-calendar datepicker-icon"></i>
                </div>
                <span style={{ alignSelf: 'center' }}>~</span>
                <div className="datepicker-wrapper flex-grow-1">
                  <DatePicker
                    selected={form.trainingEndDt}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, trainingEndDt: date }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="종료년월"
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

export default TrainingModal;

