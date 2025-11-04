import ResumeSelectModal from "@/components/project/ResumeSelectModal";
import CommonPagination from "@/components/common/CommonPagination";
import { useState } from "react";


export default function ResumeListModal() {

    const [resumes, setResumes] = useState([]);

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h4 className="modal-title" id="schoolSearchModalLabel">이력서 선택</h4>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-hidden="true" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                <div>
                    <ul className="simple-post-list m-0">
                        {resumes.map((resume) => (
                            <li className="d-flex align-items-center gap-2" key={resume.resumeSq}>
                                {resume.resumeTtl}
                                <div className="post-info align-items-center gap-2">
                                    <a href="#" onClick={() => openResumeDetailModal(resume)}>
                                        {resume.resumeTtl}
                                    </a>
                                {resume.resumeIsRepresentativeYn === 'Y' && (
                                    <span className="badge bg-primary ms-2 align-middle" style={{ fontSize: '12px', padding: '3px 6px' }}>대표 이력서</span>
                                )}
                                <div className="post-meta">
                                    <span className="text-dark text-uppercase font-weight-semibold">등록일자</span>
                                    | {formatTime(resume.resumeCreatedAtDtm)}
                                </div>
                                </div>
                                <div className="ms-auto">
                                    {selectResume && selectedResume.resumeSq === resume.resumeSq ? (
                                        <button className="btn btn-primary btn-sm" disabled>선택됨</button>
                                    ) : (
                                        <button className="btn btn-primary btn-outline btn-sm" onClick={() => selectResume(resume)}>선택하기</button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
            </div>
            <div className="modal-footer">
                <button className="btn btn-light" data-bs-dismiss="modal" onClick={onClose}>닫기</button>
            </div>
        </div>
    )
}