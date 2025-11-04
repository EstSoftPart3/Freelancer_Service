import React, { useEffect, useRef } from "react";
import "./ModalLayout.css";

/**
 * Props
 * - isOpen: boolean
 * - onClose: () => void
 * - size?: string           // "modal-sm" | "modal-lg" | "modal-xl" 등
 * - children: ReactNode     // 모달 내부 콘텐츠(<slot> 대체)
 */
export default function Modal({ isOpen, onClose, size = "", children }) {
  const dialogRef = useRef(null);

  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    // 스크롤 잠금 (선택)
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null; // Vue의 v-show 대신 조건부 렌더링

  const stop = (e) => e.stopPropagation(); // 모달 클릭 시 닫힘 방지

  return (
    <div>
      {/* Backdrop */}
      <div
        className={`modal-backdrop fade ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`modal fade ${isOpen ? "show" : ""}`}
        tabIndex={-1}
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
        onClick={onClose} // 바깥 영역 클릭 시 닫기
      >
        <div
          className={`modal-dialog ${size}`}
          onClick={stop}
          ref={dialogRef}
        >
          <div className="modal-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
