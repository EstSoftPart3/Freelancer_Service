import React, { useState, useEffect, useMemo } from 'react';
import { useModalStore } from '@/store/modalStore';
import skillIconMap from '@/lib/skillIconMap';
import styles from './SkillSelectModal.module.css';

/**
 * 기술 선택 모달
 * Props:
 * - skills: Array<{parentSkillTagNm, childSkillTagNms}> - 기술 목록
 * - selectedSkills: Array<{name, imageUrl}> - 이미 선택된 기술
 * - onConfirm: (skills) => void
 * - title: string (default: '기술 선택')
 */
export default function SkillSelectModal({ 
  skills = [], 
  selectedSkills = [], 
  onConfirm, 
  title = '기술 선택' 
}) {
  const { closeModal } = useModalStore();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([...selectedSkills]);
  }, [selectedSkills]);

  // 기술을 카테고리별로 그룹화
  const groupedSkills = useMemo(() => {
    const map = {};
    skills.forEach((group) => {
      map[group.parentSkillTagNm] = group.childSkillTagNms;
    });
    return map;
  }, [skills]);

  const generateIconUrl = (name) => {
    if (!name) return null;
    const key = name.toLowerCase().replace(/[\s.]+/g, '');
    return skillIconMap[key] || skillIconMap.default;
  };

  const isSelected = (skillName) => {
    return selected.some((s) => s.name === skillName || s === skillName);
  };

  const toggleSkill = (skillName) => {
    const index = selected.findIndex((s) => s.name === skillName || s === skillName);
    if (index === -1) {
      setSelected([...selected, {
        name: skillName,
        imageUrl: generateIconUrl(skillName),
      }]);
    } else {
      setSelected(selected.filter((_, i) => i !== index));
    }
  };

  const handleConfirm = () => {
    onConfirm?.(selected);
    closeModal();
  };

  return (
    <div className="modal-content">
      <div className={styles.modalHeader}>
        <div className={styles.headerContent}>
          <i className="fas fa-code me-2"></i>
          <h4 className={styles.modalTitle}>{title}</h4>
        </div>
        <button type="button" className={styles.btnClose} onClick={closeModal}>
          ×
        </button>
      </div>

      <div className={styles.modalBody}>
        {Object.entries(groupedSkills).map(([category, skillList]) => (
          <div key={category} className={styles.category}>
            <h6 className={styles.categoryTitle}>
              <i className="fas fa-folder-open me-2"></i>
              {category}
            </h6>
            <div className={styles.skillGrid}>
              {skillList.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`${styles.skillCard} ${isSelected(skill) ? styles.selected : ''}`}
                  onClick={() => toggleSkill(skill)}
                >
                  {generateIconUrl(skill) && (
                    <img src={generateIconUrl(skill)} alt={skill} />
                  )}
                  <span>{skill}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedSkills).length === 0 && (
          <div className={styles.emptyState}>
            <i className="fas fa-inbox"></i>
            <p>선택 가능한 기술이 없습니다.</p>
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <div className={styles.selectedCount}>
          <i className="fas fa-check-circle me-2"></i>
          선택된 기술: <strong>{selected.length}개</strong>
        </div>
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.btnSecondary} onClick={closeModal}>
            <i className="fas fa-times me-2"></i>
            취소
          </button>
          <button type="button" className={styles.btnPrimary} onClick={handleConfirm}>
            <i className="fas fa-check me-2"></i>
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}

