import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import MyPageLayout from "../../MyPageLayout";
import NotificationTrashList from "@/components/myPage/notification/core/NotificationTrashList";
import TermsAgreementModal from "@/components/auth/TermsAgreementModal";
import { useAlert } from "@/contexts/AlertContext";
import styles from "./trash.module.css";

export default function Trash() {
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false);

  // data
  const [notifications, setNotifications] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // selection mode
  const [selectMode, setSelectMode] = useState(true);
  const [selected, setSelected] = useState(() => new Set());

  // confirm modal state (TermsAgreementModal 재사용)
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    body: "",
    onConfirm: null,
  });

  const openConfirmModal = ({ title, body, onConfirm }) => {
    setConfirmModal({ open: true, title, body, onConfirm });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, title: "", body: "", onConfirm: null });
  };

  const totalPages = useMemo(() => {
    const t = Math.ceil((totalCount || 0) / size);
    return Math.max(1, t);
  }, [totalCount, size]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = end - maxButtons + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const loadTrash = async (nextPage = page) => {
    setLoading(true);
    try {
      const res = await api.$get("/notifications/trash", {
        params: { page: nextPage, size },
      });

      const data = res?.output ?? res ?? {};
      setNotifications(data?.items ?? []);
      setTotalCount(data?.totalcount ?? data?.totalCount ?? 0);
      setPage(data?.page ?? nextPage);

      setSelected(new Set());
    } catch (e) {
      console.error("알림 휴지통 조회 실패:", e?.response?.status, e?.response?.data);
      showAlert?.("danger", "휴지통 목록 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // selection handlers
  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      const next = !prev;
      if (!next) setSelected(new Set());
      return next;
    });
  };

  const toggleSelect = (sq) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(sq) ? next.delete(sq) : next.add(sq);
      return next;
    });
  };

  const isAllSelected = useMemo(() => {
    if (!notifications.length) return false;
    return notifications.every((n) => selected.has(n.notificationSq));
  }, [notifications, selected]);

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        notifications.forEach((n) => next.delete(n.notificationSq));
      } else {
        notifications.forEach((n) => next.add(n.notificationSq));
      }
      return next;
    });
  };

  // Confirm: 복구
  const confirmRestoreSelected = () => {
    if (selected.size === 0) {
      showAlert?.("danger", "선택된 알림이 없습니다.");
      return;
    }

    openConfirmModal({
      title: "알림 복구",
      body: `<p>선택한 알림을 복원하시겠습니까?</p>`,
      onConfirm: async () => {
        try {
          await api.$patch("/notifications/restore", {
            notificationSqList: Array.from(selected),
          });
          showAlert?.("info", "복원이 완료되었습니다.");
          setSelectMode(false);
          await loadTrash(page);
        } catch (e) {
          console.error("휴지통 복구 실패:", e?.response?.status, e?.response?.data);
          showAlert?.("danger", "복원에 실패했습니다.");
        } finally {
          closeConfirmModal();
        }
      },
    });
  };

  // Confirm: 영구삭제
  const confirmPermanentDeleteSelected = () => {
    if (selected.size === 0) {
      showAlert?.("danger", "선택된 알림이 없습니다.");
      return;
    }

    openConfirmModal({
      title: "알림 영구삭제",
      body: `
        <p><strong style="color:#dc3545">선택한 알림은 복구할 수 없습니다.</strong></p>
        <p>정말 영구삭제하시겠습니까?</p>
      `,
      onConfirm: async () => {
        try {
          await api.$patch("/notifications/permanent-delete", {
            notificationSqList: Array.from(selected),
          });
          showAlert?.("info", "영구삭제가 완료되었습니다.");
          setSelectMode(false);
          await loadTrash(page);
        } catch (e) {
          console.error("휴지통 영구삭제 실패:", e?.response?.status, e?.response?.data);
          showAlert?.("danger", "영구삭제에 실패했습니다.");
        } finally {
          closeConfirmModal();
        }
      },
    });
  };

  // pagination handlers
  const goPrev = () => page > 1 && loadTrash(page - 1);
  const goNext = () => page < totalPages && loadTrash(page + 1);
  const goPage = (p) => p >= 1 && p <= totalPages && loadTrash(p);

  return (
    <MyPageLayout>
      <div className={styles.wrap}>
        <div className={styles.topBar}>
          <h2 className={styles.pageTitle}>휴지통</h2>

          <div className={styles.actions}>
            

            {selectMode && (
              <>
                <button
                  className="btn btn-sm btn-light"
                  onClick={toggleSelectAll}
                  disabled={!notifications.length}
                >
                  {isAllSelected ? "전체해제" : "전체선택"}
                </button>

                <button
                  className="btn btn-sm btn-primary"
                  onClick={confirmRestoreSelected}
                  disabled={selected.size === 0}
                >
                  복구
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={confirmPermanentDeleteSelected}
                  disabled={selected.size === 0}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>

        <NotificationTrashList
          notifications={notifications}
          selectMode={selectMode}
          selected={selected}
          onToggleSelect={toggleSelect}
        />

        <div className={styles.pagerWrap}>
          <div className={styles.pagerInfo}>
            총 {totalCount}건 · {page}/{totalPages} 페이지
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0 justify-content-end">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={goPrev} disabled={page <= 1}>
                  ‹
                </button>
              </li>

              {pageNumbers.map((p) => (
                <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => goPage(p)}>
                    {p}
                  </button>
                </li>
              ))}

              <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={goNext} disabled={page >= totalPages}>
                  ›
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Confirm Modal: TermsAgreementModal 재사용 */}
      {confirmModal.open && (
        <TermsAgreementModal
          title={confirmModal.title}
          body={confirmModal.body}
          onConfirm={confirmModal.onConfirm}
          onClose={closeConfirmModal}
        />
      )}
    </MyPageLayout>
  );
}
