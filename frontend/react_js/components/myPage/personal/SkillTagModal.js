import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAlertStore } from '../../../store/alertStore';
import { api } from '@/lib/axios';
import skillIconMap from '@/lib/skillIconMap';
import styles from './SkillTagModal.module.css';

const SkillTagModal = ({ onComplete, selectedSkills = [] }) => {
  const alertStore = useAlertStore();

  const [selected, setSelected] = useState([]);
  const [groupedSkillTags, setGroupedSkillTags] = useState([]);

  // 기술 태그 목록 조회
  const getSkills = async () => {
    try {
      const res = await api.$get(`/mypage/resume/project-history/skill-tags`);
      console.log('[보유 기술 API 응답]', res);
      
      if (res.status === 'OK') {
        // 부모-자식 구조로 그룹화
        const grouped = res.output
          .filter((tag) => tag.skillTagLvl === 1)
          .map((parent) => ({
            ...parent,
            children: res.output.filter(
              (tag) => tag.parentSkillTagSq === parent.skillTagSq
            ),
          }));
        
        console.log('[보유 기술 그룹화]', grouped);
        setGroupedSkillTags(grouped);
      }
    } catch (error) {
      console.error('[보유 기술 조회 실패]', error);
      alertStore.show('기술 태그 리스트를 불러올 수 없습니다.', 'danger');
    }
  };

  // 초기 로드
  useEffect(() => {
    getSkills();
    setSelected(selectedSkills.map(s => ({ ...s })));
  }, []);

  // 기술 선택/해제 토글
  const toggleSkill = (skill) => {
    setSelected((prev) => {
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
    return selected.some((s) => s.skillTagSq === skill.skillTagSq);
  };

  // 스킬 아이콘 URL 생성
  const getSkillIcon = (name) => {
    const key = name.toLowerCase().replace(/[\s.]+/g, '');
    return skillIconMap[key] || skillIconMap.default || '';
  };

  // 선택 완료
  const handleConfirm = () => {
    if (selected.length === 0) {
      alertStore.show('기술을 최소 1개 이상 선택해주세요.', 'danger');
      return;
    }
    console.log('[선택된 보유 기술]', selected);
    onComplete?.(selected);
  };

  // 모달 닫기
  const closeModal = () => {
    onComplete?.(null);
  };

  return createPortal(
    <div className={styles.modalBackdrop} onClick={closeModal}>
      <div className={styles.modalContentWrapper} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>보유 기술 선택</h5>
          <button className={styles.closeBtn} onClick={closeModal}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
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
              선택 완료 ({selected.length})
            </button>
            <button
              onClick={closeModal}
              type="button"
              className="btn btn-light ms-2"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SkillTagModal;

