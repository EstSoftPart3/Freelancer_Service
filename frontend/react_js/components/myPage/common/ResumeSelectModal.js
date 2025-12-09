import {useEffect, useMemo, useState} from "react";
import { useModalStore } from "../../../store/modalStore";
import { useAlertStore } from "../../../store/alertStore";

import CommonPagination from "../../common/CommonPagination";
import ResumeDetailModal from "./ResumeDetailModal";
import { api } from "@/lib/axios";
import { useAlert } from "@/contexts/AlertContext";

export default function ResumeSelectModal( {
    userSq,
    projectSq,
    role,
    onConfirm,
    onClose,
}) {
    const closeModal = useModalStore((s) => s.closeModal);
    const openModal = useModalStore((s) => s.openModal);
    
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState([]);
    const { showAlert } = useAlert()

    const close = () => {
        //모달 닫기(부모에서 onCLose 주입됨) # 현재 프로젝트 기업 지원시 closeModal 안씀
        onClose?.();
        if(role === 'PERSONAL') {
          closeModal();
        }
    };

    const formatTime = (createdAt) => {
        const date = new Date(createdAt);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}.${m}.${d}`;
    };

    //목록 조회
    const getResumes = async () => {
        try{
            if(role === 'PERSONAL'){
                const res = await api.$get("/mypage/resume/select-list");
                const list = Array.isArray(res.data.output) ? res.data.output : [];
                setResumes(list);
            } else if(role === 'COMPANY'){
                const res = await api.$get(`/mypage/resume/list/${userSq}`);
                const list = Array.isArray(res.output) ? res.output : [];
                setResumes(list);
                console.log('이력서 목록', res)
            }
        }catch(e){
            console.error('이력서 목록 조회 실패:', e);
        }
    };

    // 대표 뱃지 토글 + 선택 상태 업데이트 (단일 선택))
    const selectResume = (resume) => {
      //기존 대표 이력서 뱃지 제거
      const next = (resumes || []).map((r) => ({
          ...r,
          resumeIsRepresentativeYn: 'N',
      }));
      //선택된 이력서에 대표 뱃지 부여
      const idx = next.findIndex((r) => r.resumeSq === resume.resumeSq);
      if(idx >= 0) next[idx].resumeIsRepresentativeYn = 'Y';
      setResumes(next);
      setSelectedResume([resume])
    };

    //상세 모달 열기
    const openResumeDetailModal = (resume) => {
        openModal(ResumeDetailModal, {
            title: "이력서 상세보기",
            size: "modal-lg",
            resumeSq: resume.resumeSq,
            onConfirm: () => selectResume(resume),
        });
    };

    const confirm = async () => {
        if (selectedResume.length === 0) {
            showAlert("이력서를 선택해주세요.", "danger");
            resumes;
    }

    try{
        if(role === 'PERSONAL'){
            await api.$post(`/projects/applications/${projectSq}`, {
                resumeSq: selectedResume.map((r) => r.resumeSq),
                projectApplicationTyp: role,
            });
            showAlert("프로젝트 지원에 성공하였습니다.");
            onConfirm?.();
            close();
        } else if( role === 'COMPANY'){
            await api.$patch(`/mypage/resume/representative/${selectedResume[0].resumeSq}`, 
                {memberSq: userSq},
                {withCredentials: true});
            showAlert("대표 이력서 설정에 성공하였습니다.");
            onConfirm?.();
            close();
        }
    } catch(e){
        console.error("프로젝트 지원 실패:", e);
        showAlert("프로젝트 지원에 실패했습니다.", "danger");
    }
};

    //마운트/role/userSq 변경 시 목록 갱신
    useEffect(() => {
        getResumes();
    }, [role, userSq]);

      // 현재 선택된 resumeSq를 빠르게 판별하기 위한 Set
  const selectedSqSet = useMemo(
    () => new Set(selectedResume.map((r) => r.resumeSq)),
    [selectedResume]
  );

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h4 className="modal-title">이력서 선택</h4>
        <button type="button" className="btn-close" aria-hidden="true" onClick={close} />
      </div>

      <div className="modal-body px-4">
        <ul className="simple-post-list m-0">
          {resumes.map((resume) => (
            <li
              key={resume.resumeSq}
              className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom"
            >
              <div className="post-info align-items-center gap-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openResumeDetailModal(resume);
                  }}
                >
                  {resume.resumeTtl}
                </a>

                {resume.resumeIsRepresentativeYn === "Y" && (
                  <span
                    className="badge bg-primary ms-2 align-middle"
                    style={{ fontSize: "12px", padding: "3px 6px" }}
                  >
                    대표 이력서
                  </span>
                )}

                <div className="post-meta">
                  <span className="text-dark text-uppercase font-weight-semibold">
                    등록일자
                  </span>{" "}
                  | {formatTime(resume.resumeCreatedAtDtm)}
                </div>
              </div>

              <div className="ms-auto">
                {selectedSqSet.has(resume.resumeSq) ? (
                  <button className="btn btn-primary btn-sm" disabled>
                    선택됨
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => selectResume(resume)}
                  >
                    선택하기
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="modal-footer">
        <button onClick={confirm} className="btn btn-primary">
          선택 완료
        </button>
        <button onClick={close} className="btn btn-light">
          닫기
        </button>
      </div>
    </div>
  );
}