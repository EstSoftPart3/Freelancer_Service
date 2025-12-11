import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/axios';
import { useModalStore } from '@/store/modalStore';
import skillIconMap from '@/lib/skillIconMap';
import ResumeDetailModal from '@/components/myPage/common/ResumeDetailModal';
import MyPageLayout from '../../MyPageLayout';
import './ResumeList.module.css';

// 페이지네이션 컴포넌트 (별도 파일로 분리 가능)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="d-flex justify-content-end mt-4">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          >
            &laquo;
          </a>
        </li>
        {pageNumbers.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? 'active' : ''}`}
          >
            <a
              className="page-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
            >
              {page}
            </a>
          </li>
        ))}
        <li
          className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
        >
          <a
            className="page-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
          >
            &raquo;
          </a>
        </li>
      </ul>
    </div>
  );
};

const ResumeList = () => {
  const router = useRouter();
  const { openModal } = useModalStore();

  // State 관리
  const [resumeList, setResumeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [setMainResumeLoading, setSetMainResumeLoading] = useState(false);

  const size = 5; // 페이지당 항목 수

  // 컴포넌트 마운트 시 및 페이지 변경 시 데이터 로드
  useEffect(() => {
    getResume();
  }, [currentPage]);

  // 이력서 목록 불러오기
  const getResume = async () => {
    try {
      // API 호출 - 실제 엔드포인트에 맞게 수정하세요
      const response = await api.$get(
        `/mypage/resume/list?currentPage=${currentPage}&size=${size}`
      );

      console.log('이력서 목록 응답:', response);

      if (Array.isArray(response.output.output)) {
        setResumeList(response.output.output);
        if (response.output.totalCount) {
          setTotalPages(Math.ceil(response.output.totalCount / size));
        }
      } else {
        console.error('이력서 목록을 불러올 수 없습니다.', response);
      }
    } catch (error) {
      console.error('이력서 목록 조회 실패:', error);
      alert('이력서 목록을 불러오는데 실패했습니다.');
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10).replaceAll('-', '.');
  };

  // 이력서 등록하기
  const registerResume = () => {
    router.push('/mypage/personal/resume_form');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // 이력서 수정하기
  const editResume = (resumeSq) => {
    router.push(`/mypage/personal/resume_form?resumeSq=${resumeSq}`);
  };

  // 이력서 상세보기
  const openResumeDetail = (resumeSq) => {
    console.log('resumeSq', resumeSq);
    openModal(ResumeDetailModal, {
      resumeSq: resumeSq,
      projectSq: 0,
      applicationSq: 0,
      isFromApplicationList: false,
      api: api,
      skillIconMap: skillIconMap,
    });
  };

  // 이력서 복사하기
  const copyResume = (resumeSq) => {
    // 확인 모달 처리
    const withFiles = window.confirm(
      '프로필 이미지와 첨부파일도 같이 복사하시겠습니까?\n\n예: 파일 포함\n아니오: 파일 제외'
    );

    const executeCopy = async () => {
      try {
        await api.$post(`/mypage/resume/${resumeSq}/copy`, {
          withFiles: withFiles,
        });

        const message = withFiles
          ? '이력서 복사(파일 포함)가 완료되었습니다.'
          : '이력서 복사(파일 제외)가 완료되었습니다.';

        alert(message);
        getResume(); // 목록 새로고침
      } catch (error) {
        console.error('이력서 복사 실패:', error);
        alert('이력서 복사에 실패했습니다.');
      }
    };

    executeCopy();
  };

  // 이력서 삭제하기
  const removeResume = (resumeSq) => {
    const confirmed = window.confirm('정말 삭제하시겠습니까?');

    if (!confirmed) return;

    const executeDelete = async () => {
      setIsDeleting(true);
      try {
        const response = await api.$patch(
          `/mypage/resume/${resumeSq}/delete`
        );

        if (response.status === 'OK') {
          alert('삭제 완료되었습니다.');
          
          // 현재 페이지의 마지막 항목을 삭제한 경우 이전 페이지로
          if (resumeList.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            getResume();
          }
        } else {
          alert('삭제 실패: ' + (response.message || '오류 발생'));
        }
      } catch (error) {
        const errorMsg =
          error?.response?.data?.message || error.message || '삭제 실패';
        alert('삭제 실패: ' + errorMsg);
      } finally {
        setIsDeleting(false);
      }
    };

    executeDelete();
  };

  // 대표 이력서 설정
  const setMainResume = async (resumeSq) => {
    // 중복 클릭 방지
    if (setMainResumeLoading) return;

    setSetMainResumeLoading(true);

    try {
      await api.$patch(`/mypage/resume/representative/${resumeSq}`);
      alert('대표 이력서로 설정되었습니다.');
      getResume(); // 목록 새로고침
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        '대표 이력서 설정 실패';
      alert('대표 이력서 설정 실패: ' + errorMsg);
    } finally {
      setSetMainResumeLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MyPageLayout userType="PERSONAL">
      <div className="resume-list-container">
      <div className="row">
        <div className="col">
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            이력서 목록
          </h4>
        </div>
      </div>

      <div className="row">
        <div className="col pt-2 mt-1">
          <hr className="my-2" />
        </div>
      </div>

      <div className="row">
        <div className="col">
          <ul className="simple-post-list m-0 position-relative">
            {resumeList.map((resume) => (
              <li
                key={resume.resumeSq}
                style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
              >

                <div className="post-info position-relative">
                  <div className="d-flex align-items-center justify-content-between">
                    {/* 제목 + 뱃지 */}
                    <div className="d-flex align-items-center gap-2">
                      <a
                        href="#"
                        className="text-5 m-0"
                        onClick={(e) => {
                          e.preventDefault();
                          openResumeDetail(resume.resumeSq);
                        }}
                        >
                        {resume.resumeTtl}
                      </a>
                      {resume.resumeIsRepresentativeYn === 'Y' && (
                        <span className="btn btn-primary btn-sm">
                          대표 이력서
                        </span>
                      )}
                    </div>
                    {/* X(닫기) 버튼 */}
                    <button
                      className="btn btn-light btn-sm rounded-3 resume-delete-btn"
                      onClick={() => removeResume(resume.resumeSq)}
                      disabled={isDeleting}
                      >
                      &times;
                    </button>
                  </div>

                  {/* 등록일자 + 버튼 */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="post-meta text-4">
                      <span className="text-dark text-uppercase font-weight-semibold">
                        등록일자
                      </span>
                      | {formatDate(resume.resumeCreatedAtDtm)}
                    </div>
                    <div className="d-flex gap-2 resume-action-buttons">
                      {resume.resumeIsRepresentativeYn !== 'Y' && (
                        <a
                          href="#"
                          className="btn btn-outline btn-primary btn-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setMainResume(resume.resumeSq);
                          }}
                        >
                          대표이력서 설정
                        </a>
                      )}
                      <a
                        href="#"
                        className="btn btn-outline btn-primary btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          editResume(resume.resumeSq);
                        }}
                      >
                        수정하기
                      </a>
                      <a
                        href="#"
                        className="btn btn-outline btn-primary btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          copyResume(resume.resumeSq);
                        }}
                      >
                        복사하기
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {resumeList.length === 0 && (
              <li className="text-center py-5 text-muted">
                등록된 이력서가 없습니다.
              </li>
            )}
          </ul>

          {/* 이력서 등록하기 버튼 */}
          <div className="d-flex justify-content-end mt-4 mb-5">
            <a
              href="#"
              className="btn btn-primary px-4 py-2"
              onClick={(e) => {
                e.preventDefault();
                registerResume();
              }}
            >
              이력서 등록하기
            </a>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
    </MyPageLayout>
  );
};

export default ResumeList;

