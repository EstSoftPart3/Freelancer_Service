import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useProjectStore } from '../../../store/ProjectHistoryStore';
import { useAlertStore } from '../../../store/alertStore';
import ProjectHistorySkillTagModal from './ProjectHistorySkillTagModal';
import DatePicker from 'react-datepicker';
import { api } from '@/lib/axios';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ShowProjectFormModal.module.css';

const ShowProjectFormModal = ({ onComplete, projectId }) => {
  const projectStore = useProjectStore();
  const alertStore = useAlertStore();
  const [showSkillModal, setShowSkillModal] = useState(false);

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
      const response = await api.$get('/mypage/resume/project-history/type-codes');
      setProjectRoleTypeList(response.output.projectRoleTypeList);
      setProjectTaskTypeList(response.output.projectTaskTypeList);
    } catch (error) {
      console.error('타입 코드 조회 실패:', error);
    }
  };

  // 스킬 모달 열기
  const openSkillModal = () => {
    console.log('[스킬 모달 열기]');
    setShowSkillModal(true);
  };

  // 스킬 모달 닫기
  const closeSkillModal = () => {
    console.log('[스킬 모달 닫기]');
    setShowSkillModal(false);
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
    projectStore.clearProject(projectId);
  };

  // 모달 닫기
  const closeModal = () => {
    projectStore.clearProject(projectId);
    onComplete?.(null);
  };

  // 초기 로드
  useEffect(() => {
    if (!projectStore.hasForm(projectId)) {
      projectStore.initForm(projectId);
    }
    fetchTypeCodes();
  }, [projectId]);

  return createPortal(
    <>
      <div className={styles.modalLayer} onClick={closeModal}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h4 className={styles.modalTitle}>프로젝트 이력 추가하기</h4>
            <button className={styles.closeBtn} onClick={closeModal}>
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* 프로젝트 내용 */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>프로젝트 내용</div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>프로젝트명</label>
                  <input
                    value={form.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                    type="text"
                    className="form-control"
                    placeholder="프로젝트명 (예: 금융 시스템 구축)"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>참여기간</label>
                  <div className={styles.dFlex} style={{ gap: '8px' }}>
                    <div className={`${styles.datepickerWrapper} ${styles.flexGrow1}`}>
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
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                      />
                      <i className="fas fa-calendar datepicker-icon"></i>
                    </div>
                    <span className={styles.alignSelfCenter}>~</span>
                    <div className={`${styles.datepickerWrapper} ${styles.flexGrow1}`}>
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
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                      />
                      <i className="fas fa-calendar datepicker-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>고객사</label>
                  <input
                    value={form.client || ''}
                    onChange={(e) => updateForm('client', e.target.value)}
                    type="text"
                    className="form-control"
                    placeholder="고객사 (예: OO은행)"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>업무단</label>
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

                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>역할</label>
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
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>개발환경</div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>기종</label>
                  <input
                    value={deviceText}
                    type="text"
                    className="form-control"
                    placeholder="기종 (예: PC)"
                    readOnly
                    onClick={openSkillModal}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>OS</label>
                  <input
                    value={osText}
                    type="text"
                    className="form-control"
                    placeholder="OS (예: Linux)"
                    readOnly
                    onClick={openSkillModal}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>DBMS</label>
                  <input
                    value={dbmsText}
                    type="text"
                    className="form-control"
                    placeholder="DBMS (예: MySQL)"
                    readOnly
                    onClick={openSkillModal}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>언어</label>
                  <input
                    value={languageText}
                    type="text"
                    className="form-control"
                    placeholder="언어 (쉼표로 구분, 예: Java, Python)"
                    readOnly
                    onClick={openSkillModal}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>TOOL</label>
                  <input
                    value={toolText}
                    type="text"
                    className="form-control"
                    placeholder="TOOL (쉼표로 구분, 예: Eclipse, VSCode)"
                    readOnly
                    onClick={openSkillModal}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>FW</label>
                  <input
                    value={frameworkText}
                    type="text"
                    className="form-control"
                    placeholder="FW (쉼표로 구분, 예: Spring Boot, Vue.js)"
                    readOnly
                    onClick={openSkillModal}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={submit}>
              저장하기
            </button>
            <button className="btn btn-light" onClick={closeModal}>
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* 스킬 선택 모달 */}
      {showSkillModal && (
        <ProjectHistorySkillTagModal 
          projectId={projectId}
          onClose={closeSkillModal}
        />
      )}
    </>,
    document.body
  );
};

export default ShowProjectFormModal;

