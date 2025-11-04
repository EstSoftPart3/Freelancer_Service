import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAlertStore } from '../../../store/alertStore';
import { useModalStore } from '../../../store/modalStore';
import { useProjectStore } from '../../../store/ProjectHistoryStore';
import api from '../../../utils/api';
import skillIconMap from '../../../assets/skillIconMap';
import './ProjectHistorySkillTagModal.css';

const ProjectHistorySkillTagModal = ({ projectId }) => {
  const projectStore = useProjectStore();
  const alertStore = useAlertStore();
  const modalStore = useModalStore();

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillList, setSkillList] = useState([]);
  const [groupedSkillTags, setGroupedSkillTags] = useState([]);

  // 기술 태그 목록 조회
  const getSkills = async () => {
    try {
      const res = await api.get(`/mypage/resume/project-history/skill-tags`);
      if (res.status === 'OK') {
        setSkillList([...res.output]);
        
        // 부모-자식 구조로 그룹화
        const grouped = res.output
          .filter((tag) => tag.skillTagLvl === 1)
          .map((parent) => ({
            ...parent,
            children: res.output.filter(
              (tag) => tag.parentSkillTagSq === parent.skillTagSq
            ),
          }));
        
        setGroupedSkillTags(grouped);
      }
    } catch {
      alertStore.show('기술 태그 리스트를 불러올 수 없습니다.', 'danger');
    }
  };

  // 기술 선택/해제 토글
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) => {
      const idx = prev.findIndex((s) => s.skillTagSq === skill.skillTagSq);
      if (idx === -1) {
        return [...prev, skill];
      } else {
        return prev.filter((_, i) => i !== idx);
      }
    });
  };

  // 선택 여부 확인
  const isSelected = (skill) => {
    return selectedSkills.some((s) => s.skillTagSq === skill.skillTagSq);
  };

  // 스킬 아이콘 URL 생성
  const getSkillIcon = (name) => {
    const key = name.toLowerCase().replace(/[\s.]+/g, '');
    return skillIconMap[key] || skillIconMap.default;
  };

  // 스토어에서 선택된 기술 동기화
  const syncSelectedSkillsWithStore = () => {
    const projectSkills = projectStore.getSkills(projectId);
    const allSkills = [];
    
    for (const category in projectSkills) {
      if (Array.isArray(projectSkills[category])) {
        allSkills.push(...projectSkills[category]);
      }
    }
    
    setSelectedSkills(allSkills.map((s) => ({ ...s })));
  };

  // 선택 완료
  const handleConfirm = () => {
    const grouped = {
      device: [],
      os: [],
      dbms: [],
      language: [],
      tool: [],
      framework: [],
    };

    selectedSkills.forEach((skill) => {
      const parent = groupedSkillTags.find(
        (g) => g.skillTagSq === skill.parentSkillTagSq
      );
      if (!parent) return;

      const category = parent.skillTagNm.toLowerCase();
      if (category in grouped) {
        grouped[category].push(skill);
      }
    });

    projectStore.setSkills(projectId, grouped);
    closeModal();
  };

  // 모달 닫기
  const closeModal = () => {
    modalStore.closeModal();
  };

  // 초기 로드
  useEffect(() => {
    const init = async () => {
      await getSkills();
      syncSelectedSkillsWithStore();
    };
    init();
  }, []);

  // 모달 열림 감지
  useEffect(() => {
    const loadData = async () => {
      if (modalStore.isOpen) {
        await getSkills();
        syncSelectedSkillsWithStore();
      }
    };
    loadData();
  }, [modalStore.isOpen]);

  // Portal을 사용하여 body에 렌더링
  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-content-wrapper">
        <div className="modal-header">
          <h5 className="modal-title" id="customModalLabel">
            기술 선택
          </h5>
        </div>
        <div className="modal-body">
          <form id="techForm">
            {groupedSkillTags.map((group) => (
              <div key={group.skillTagSq} className="mb-3">
                <h6 className="section-title">{group.skillTagNm}</h6>
                <div className="row row-cols-3 card-grid">
                  {group.children.map((skill) => (
                    <div className="col" key={skill.skillTagNm}>
                      <button
                        type="button"
                        className={`tech-card ${isSelected(skill) ? 'selected' : ''}`}
                        onClick={() => toggleSkill(skill)}
                      >
                        <img
                          src={getSkillIcon(skill.skillTagNm)}
                          alt={skill.skillTagNm}
                        />
                        <span>{skill.skillTagNm}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4 d-flex justify-content-end">
              <button
                onClick={handleConfirm}
                type="button"
                className="btn btn-primary"
              >
                선택 완료
              </button>
              <button
                onClick={closeModal}
                type="button"
                className="btn btn-secondary ms-2"
              >
                닫기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectHistorySkillTagModal;

