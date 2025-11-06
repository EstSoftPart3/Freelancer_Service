import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAlertStore } from '../../../store/alertStore';
import { useModalStore } from '../../../store/modalStore';
import { useProjectStore } from '../../../store/ProjectHistoryStore';
import { api } from '@/lib/axios';
import skillIconMap from '@/lib/skillIconMap';
import styles from './ProjectHistorySkillTagModal.module.css';

const ProjectHistorySkillTagModal = ({ projectId, onClose }) => {
  const projectStore = useProjectStore();
  const alertStore = useAlertStore();
  const { closeModal: closeModalStore } = useModalStore();

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillList, setSkillList] = useState([]);
  const [groupedSkillTags, setGroupedSkillTags] = useState([]);

  // 기술 태그 목록 조회
  const getSkills = async () => {
    try {
      const res = await api.$get(`/mypage/resume/project-history/skill-tags`);
      console.log('[스킬 태그 API 응답]', res);
      
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
        
        console.log('[그룹화된 스킬 태그]', grouped);
        setGroupedSkillTags(grouped);
      }
    } catch (error) {
      console.error('[스킬 태그 조회 실패]', error);
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
    return skillIconMap[key] || skillIconMap.default || '';
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
    // 한국어 카테고리명을 영어로 매핑
    const categoryMap = {
      '언어': 'language',
      '프레임워크': 'framework',
      '툴': 'tool',
      '기종': 'device',
      '운영체제': 'os',
      'DBMS': 'dbms',
      'dbms': 'dbms',
    };

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

      const categoryKey = categoryMap[parent.skillTagNm] || parent.skillTagNm.toLowerCase();
      if (categoryKey in grouped) {
        grouped[categoryKey].push(skill);
      }
    });

    console.log('[선택된 스킬 그룹]', grouped);
    projectStore.setSkills(projectId, grouped);
    onClose?.();
    closeModalStore();
  };

  // 모달 닫기
  const closeModal = () => {
    onClose?.();
    closeModalStore();
  };

  // 초기 로드
  useEffect(() => {
    const init = async () => {
      await getSkills();
      syncSelectedSkillsWithStore();
    };
    init();
  }, []);


  // Portal을 사용하여 body에 렌더링
  return createPortal(
    <div className={styles.modalBackdrop} onClick={closeModal}>
      <div className={styles.modalContentWrapper} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>기술 선택</h5>
          <button className={styles.closeBtn} onClick={closeModal}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <form id="techForm">
            {groupedSkillTags.map((group) => (
              <div key={group.skillTagSq} className={styles.skillSection}>
                <h6 className={styles.sectionTitle}>{group.skillTagNm}</h6>
                <div className={styles.skillGrid}>
                  {group.children.map((skill) => (
                    <div key={skill.skillTagNm} className={styles.skillItem}>
                      <button
                        type="button"
                        className={`${styles.techCard} ${isSelected(skill) ? styles.selected : ''}`}
                        onClick={() => toggleSkill(skill)}
                      >
                        {getSkillIcon(skill.skillTagNm) && (
                          <img
                            src={getSkillIcon(skill.skillTagNm)}
                            alt={skill.skillTagNm}
                            className={styles.skillIcon}
                          />
                        )}
                        <span>{skill.skillTagNm}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className={styles.modalFooter}>
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
                className="btn btn-light ms-2"
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

