import { useState, useEffect, useMemo } from 'react';
import { useModalStore } from '../../../store/modalStore';
import { useProjectStore } from '../../../store/ProjectHistoryStore';
import { useAlertStore } from '../../../store/alertStore';
import ProjectHistorySkillTagModal from './ProjectHistorySkillTagModal';
import DatePicker from 'react-datepicker';
import api from '../../../utils/api';
import 'react-datepicker/dist/react-datepicker.css';
import './ShowProjectFormModal.css';

const ShowProjectFormModal = ({ onComplete, projectId }) => {
  const modalStore = useModalStore();
  const projectStore = useProjectStore();
  const alertStore = useAlertStore();

  const [projectRoleTypeList, setProjectRoleTypeList] = useState([]);
  const [projectTaskTypeList, setProjectTaskTypeList] = useState([]);

  // store에서 폼 데이터 가져오기
  const form = projectStore.getForm(projectId);
  const selectedSkills = projectStore.getSkills(projectId);

  // 폼 필드 업데이트 함수
  const updateForm = (field, value) => {
    const updatedForm = { ...form, [field]: value };
    projectStore.setForm(projectId, updatedForm);
  };

  // 스킬 텍스트 계산
  const deviceText = useMemo(
    () =>
      (selectedSkills.device &&
        selectedSkills.device.map((skill) => skill.skillTagNm).join(', ')) ||
      '',
    [selectedSkills.device]
  );

  const osText = useMemo(
    () =>
      (selectedSkills.os &&
        selectedSkills.os.map((skill) => skill.skillTagNm).join(', ')) ||
      '',
    [selectedSkills.os]
  );

  const dbmsText = useMemo(
    () =>
      (selectedSkills.dbms &&
        selectedSkills.dbms.map((skill) => skill.skillTagNm).join(', ')) ||
      '',
    [selectedSkills.dbms]
  );

  const languageText = useMemo(
    () =>
      (selectedSkills.language &&
        selectedSkills.language.map((skill) => skill.skillTagNm).join(', ')) ||
      '',
    [selectedSkills.language]
  );

  const toolText = useMemo(
    () =>
      (selectedSkills.tool &&
        selectedSkills.tool.map((skill) => skill.skillTagNm).join(', ')) ||
      '',
    [selectedSkills.tool]
  );

  const frameworkText = useMemo(
    () =>
      (selectedSkills.framework &&
        selectedSkills.framework.map((skill) => skill.skillTagNm).join(', ')) ||
      '',
    [selectedSkills.framework]
  );

  // 타입 코드 조회
  const fetchTypeCodes = async () => {
    try {
      const response = await api.get('/mypage/resume/project-history/type-codes');
      setProjectRoleTypeList(response.output.projectRoleTypeList);
      setProjectTaskTypeList(response.output.projectTaskTypeList);
    } catch (error) {
      console.error('타입 코드 조회 실패:', error);
    }
  };

  // 스킬 모달 열기
  const openSkillModal = () => {
    modalStore.openModal(ProjectHistorySkillTagModal, {
      projectId: projectId,
    });
  };

  // 제출
  const submit = () => {
    if (!form.name) {
      alertStore.show('프로젝트명을 입력해주세요.', 'danger');
      return;
    }
    if (!form.startDate) {
      alertStore.show('프로젝트 근무 기간을 선택하세요.', 'danger');
      return;
    }
    if (!form.client) {
      alertStore.show('고객사를 입력하세요.', 'danger');
      return;
    }
    if (!form.workUnit) {
      alertStore.show('업무단을 선택하세요.', 'danger');
      return;
    }
    if (!form.role) {
      alertStore.show('프로젝트 담당 역할을 선택하세요.', 'danger');
      return;
    }

    const totalSkillCount = Object.values(selectedSkills || {}).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );

    if (totalSkillCount === 0) {
      alertStore.show('개발환경을 선택하세요.', 'danger');
      return;
    }

    const selectedWorkUnit = projectTaskTypeList.find(
      (item) => item.commonCodeSq === form.workUnit
    );

    const selectedRole = projectRoleTypeList.find(
      (item) => item.commonCodeSq === form.role
    );

    const project = {
      projectHistoryTask: form.name,
      projectHistoryStartDt: form.startDate || null,
      projectHistoryEndDt: form.endDate || null,
      projectHistoryClient: form.client,
      projectHistoryTypeCd: form.workUnit,
      projectHistoryTypeCdNm: selectedWorkUnit?.commonCodeNm || null,
      projectHistoryJobPositionTypeCd: form.role,
      projectHistoryJobPositionTypeCdNm: selectedRole?.commonCodeNm || null,
      skillTags: selectedSkills,
    };

    onComplete?.(project);
    closeModal();
  };

  // 모달 닫기
  const closeModal = () => {
    modalStore.closeModal();
  };

  // 초기 로드
  useEffect(() => {
    if (!projectStore.hasForm(projectId)) {
      projectStore.initForm(projectId);
    }
    fetchTypeCodes();
  }, [projectId]);

  return (
    <div className="modal-layer">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title">프로젝트 이력 추가하기</h4>
          <button className="close-btn" onClick={closeModal}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* 프로젝트 내용 */}
          <div className="section-block">
            <div className="section-title">프로젝트 내용</div>
            <div className="form-row">
              <div className="form-group">
                <label className="modal-label">프로젝트명</label>
                <input
                  value={form.name || ''}
                  onChange={(e) => updateForm('name', e.target.value)}
                  type="text"
                  className="form-control"
                  placeholder="프로젝트명 (예: 금융 시스템 구축)"
                />
              </div>
              <div className="form-group">
                <label className="modal-label">참여기간</label>
                <div className="d-flex gap-2">
                  <div className="datepicker-wrapper flex-grow-1">
                    <DatePicker
                      selected={form.startDate ? new Date(form.startDate) : null}
                      onChange={(date) => {
                        const formatted = date
                          ? date.toISOString().substring(0, 10)
                          : null;
                        updateForm('startDate', formatted);
                      }}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="시작일"
                      className="form-control"
                      showMonthYearPicker
                      showFullMonthYearPicker
                    />
                    <i className="fas fa-calendar datepicker-icon"></i>
                  </div>
                  <span className="align-self-center">~</span>
                  <div className="datepicker-wrapper flex-grow-1">
                    <DatePicker
                      selected={form.endDate ? new Date(form.endDate) : null}
                      onChange={(date) => {
                        const formatted = date
                          ? date.toISOString().substring(0, 10)
                          : null;
                        updateForm('endDate', formatted);
                      }}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="종료일"
                      className="form-control"
                      showMonthYearPicker
                      showFullMonthYearPicker
                    />
                    <i className="fas fa-calendar datepicker-icon"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="modal-label">고객사</label>
                <input
                  value={form.client || ''}
                  onChange={(e) => updateForm('client', e.target.value)}
                  type="text"
                  className="form-control"
                  placeholder="고객사 (예: OO은행)"
                />
              </div>
              <div className="form-group">
                <label className="modal-label">업무단</label>
                <select
                  value={form.workUnit || ''}
                  onChange={(e) => updateForm('workUnit', e.target.value)}
                  className="form-control"
                >
                  <option disabled value="">
                    업무단 선택
                  </option>
                  {projectTaskTypeList.map((item) => (
                    <option key={item.commonCodeSq} value={item.commonCodeSq}>
                      {item.commonCodeNm}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="modal-label">역할</label>
                <select
                  value={form.role || ''}
                  onChange={(e) => updateForm('role', e.target.value)}
                  className="form-control"
                >
                  <option disabled value="">
                    역할 선택
                  </option>
                  {projectRoleTypeList.map((item) => (
                    <option key={item.commonCodeSq} value={item.commonCodeSq}>
                      {item.commonCodeNm}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 개발환경 */}
          <div className="section-block">
            <div className="section-title">개발환경</div>
            <div className="form-row">
              <div className="form-group">
                <label className="modal-label">기종</label>
                <input
                  value={deviceText}
                  type="text"
                  className="form-control"
                  placeholder="기종 (예: PC)"
                  readOnly
                  onClick={openSkillModal}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">OS</label>
                <input
                  value={osText}
                  type="text"
                  className="form-control"
                  placeholder="OS (예: Linux)"
                  readOnly
                  onClick={openSkillModal}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">DBMS</label>
                <input
                  value={dbmsText}
                  type="text"
                  className="form-control"
                  placeholder="DBMS (예: MySQL)"
                  readOnly
                  onClick={openSkillModal}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="modal-label">언어</label>
                <input
                  value={languageText}
                  type="text"
                  className="form-control"
                  placeholder="언어 (쉼표로 구분, 예: Java, Python)"
                  readOnly
                  onClick={openSkillModal}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">TOOL</label>
                <input
                  value={toolText}
                  type="text"
                  className="form-control"
                  placeholder="TOOL (쉼표로 구분, 예: Eclipse, VSCode)"
                  readOnly
                  onClick={openSkillModal}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">FW</label>
                <input
                  value={frameworkText}
                  type="text"
                  className="form-control"
                  placeholder="FW (쉼표로 구분, 예: Spring Boot, Vue.js)"
                  readOnly
                  onClick={openSkillModal}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={submit}>
            저장하기
          </button>
          <button className="btn btn-light" onClick={closeModal}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowProjectFormModal;

