import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAlertStore } from '../../../store/alertStore';
import { api } from '@/lib/axios';
import styles from './LicenseModal.module.css';

const LicenseModal = ({ onLicenseSelected, selectedLicense = [] }) => {
  const alertStore = useAlertStore();

  const [search, setSearch] = useState('');
  const [licenses, setLicenses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 페이지 그룹 관련 설정
  const groupSize = 3;
  const currentGroup = useMemo(() => Math.ceil(page / groupSize), [page]);
  const pageGroup = useMemo(() => {
    const start = (currentGroup - 1) * groupSize + 1;
    const end = Math.min(start + groupSize - 1, totalPages);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentGroup, totalPages]);

  // 자격증 검색
  const fetchLicenses = async () => {
    try {
      const res = await api.$get(
        `/mypage/resume/certificates?searchNm=${search}&page=${page}&size=5`
      );

      const items = res.output.certificates || [];
      setLicenses(
        items.map((item) => ({
          id: item.certificateCd,
          name: item.certificateNm,
        }))
      );

      setTotalPages(res.output.totalPages || 1);
    } catch (e) {
      console.error('자격증 API 호출 실패', e);
    }
  };

  // 페이지 변경 시 검색
  useEffect(() => {
    fetchLicenses();
  }, [page]);

  // 초기 로드
  useEffect(() => {
    fetchLicenses();
  }, []);

  // 자격증 선택
  const selectLicense = (license) => {
    const selectedList = selectedLicense || [];

    const isDuplicate = selectedList.some(
      (item) => item.certificationCd === license.id
    );

    if (isDuplicate) {
      alertStore.show('이미 선택된 자격증입니다.', 'danger');
      return;
    }

    onLicenseSelected?.(license);
    close();
  };

  // 검색 및 페이지 초기화
  const searchAndResetPage = () => {
    setPage(1);
    fetchLicenses();
  };

  // 모달 닫기
  const close = () => {
    onLicenseSelected?.(null);
  };

  // 페이지네이션
  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const goPage = (p) => {
    setPage(p);
  };

  // 엔터키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchAndResetPage();
    }
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={close}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>자격증 검색</span>
          <button className={styles.modalClose} onClick={close}>
            ×
          </button>
        </div>

        <div className={styles.modalSearch}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="자격증을 입력하세요."
          />
          <button className={styles.modalSearchBtn} onClick={searchAndResetPage}>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="2" />
              <path
                d="M13 13l3 3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.modalList}>
          {licenses.length > 0 ? (
            <div>
              {licenses.map((license) => (
                <div
                  key={license.id}
                  className={styles.modalItem}
                  onClick={() => selectLicense(license)}
                >
                  <span className={styles.licenseName}>{license.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.modalEmpty}>검색 결과가 없습니다.</div>
          )}
        </div>

        <div className={styles.modalPagination}>
          <button disabled={page === 1} onClick={prevPage}>
            &lt;
          </button>
          {pageGroup.map((p) => (
            <button
              key={p}
              className={page === p ? styles.active : ''}
              onClick={() => goPage(p)}
            >
              {p}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={nextPage}>
            &gt;
          </button>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.modalFooterClose} onClick={close}>
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LicenseModal;

