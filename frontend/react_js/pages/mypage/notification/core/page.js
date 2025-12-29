"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import NotificationList from "@/components/myPage/notification/core/NotificationList";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import MyPageLayout from "../../MyPageLayout";

import { useAlert } from "@/contexts/AlertContext";
import TermsAgreementModal from "@/components/auth/TermsAgreementModal";

export default function NotificationPage() {
  const [loading, setLoading] = useState(false);

  // data
  const [notifications, setNotifications] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // delete mode (checkbox mode)
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());

  const deleteStatus = 2301;

  const { showAlert } = useAlert();

  const [mode, setMode] = useState(null);

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
    // 버튼 5개만 보여주기
    const maxButtons = 5;
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - maxButtons + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const loadNotifications = async (nextPage = page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const res = await api.get("http://localhost:8080/notifications", {
        params: { page: nextPage, size, deleteStatus },
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = res.data ?? {};
      setNotifications(data.items ?? []);
      setTotalCount(data.totalcount ?? data.totalCount ?? 0);
      setPage(data.page ?? nextPage);

      // 페이지 이동/새로고침 시 선택 상태 초기화
      setSelected(new Set());
    } catch (error) {
      console.error("알림 조회 실패:", error?.response?.status, error?.response?.data);
      showAlert?.("danger", "알림 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const getNotificationLink = (n) => {
    switch (n.notificationTargetTypeCd) {
      case 2201: // 게시글
        return `/community/board/${n.notificationTargetSq}`;
      case 2202: // 댓글(정책상 targetSq=boardSq)
        return `/community/board/${n.notificationTargetSq}`;
      case 2205: // 스크랩(정책상 이동 경로가 있으면 추가)
        return null;
      default:
        return null;
    }
  };

  useEffect(() => {
    loadNotifications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSE subscribe (옵션)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const controller = new AbortController();

    fetchEventSource("http://localhost:8080/notifications/subscribe", {
      method: "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      onopen(res) {
        if (res.ok) return;
        throw new Error(`SSE 연결 실패: ${res.status}`);
      },
      onmessage() {
        // 새 알림 오면 1페이지 갱신
        loadNotifications(1);
      },
      onerror(err) {
        console.error("SSE error", err);
      },
    });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // item click
  const handleItemClick = async (n) => {
    // 선택 모드에서는 체크 토글
    if (selectMode) {
      toggleSelect(n.notificationSq);
      return;
    }

    try {
      const readYn = n.notificationIsReadYn ?? n.notificationReadYn ?? "Y";
      if (readYn === "N") {
        await api.patch("/notifications/read", {
          notificationSqList: [n.notificationSq],
        });
        await loadNotifications(page);
      }
    } catch (e) {
      console.error("알림 읽음 처리 실패:", e?.response?.status, e?.response?.data);
      showAlert?.("danger", "읽음 처리에 실패했습니다.");
    }

    const link = getNotificationLink(n);
    if (link) router.push(link);
  };


  const enterMode = (nextMode) => {
    setSelectMode(true);
    setMode(nextMode); // "read" | "delete"
    setSelected(new Set());
  };

  const cancelMode = () => {
    setSelectMode(false);
    setMode(null);
    setSelected(new Set());
  };


  const toggleSelect = (notificationSq) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(notificationSq)) next.delete(notificationSq);
      else next.add(notificationSq);
      return next;
    });
  };

  const isAllSelected = useMemo(() => {
    if (!notifications?.length) return false;
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

  // bulk delete => deleteStatus를 TRASH로 업데이트
  const handleBulkDelete = async () => {
    if (selected.size === 0) {
      showAlert?.("danger", "선택된 알림이 없습니다.");
      return;
    }

    try {
      await api.patch("/notifications/delete", {
        notificationSqList: Array.from(selected),
      });

      showAlert?.("info", "선택 삭제가 완료되었습니다.");
      setSelected(new Set());
      setSelectMode(false);
      setMode(null);
      await loadNotifications(page);
    } catch (e) {
      console.error("알림 삭제 처리 실패:", e?.response?.status, e?.response?.data);
      showAlert?.("danger", "삭제 처리에 실패했습니다.");
    }
  };

  const handleBulkRead = async () => {
    if (selected.size === 0) {
      showAlert?.("danger", "선택된 알림이 없습니다.");
      return;
    }

    try {
      await api.patch("/notifications/read", {
        notificationSqList: Array.from(selected),
      });

      showAlert?.("info", "선택한 알림을 읽음 처리했습니다.");
      setSelected(new Set());
      setSelectMode(false);
      setMode(null);
      await loadNotifications(page);
    } catch (e) {
      console.error("알림 읽음 처리 실패:", e?.response?.status, e?.response?.data);
      showAlert?.("danger", "읽음 처리에 실패했습니다.");
    }
  };

  // pagination handlers
  const goPrev = () => page > 1 && loadNotifications(page - 1);
  const goNext = () => page < totalPages && loadNotifications(page + 1);
  const goPage = (p) => p >= 1 && p <= totalPages && loadNotifications(p);

  return (
    <MyPageLayout>
      <div style={{ fontSize: "1rem" }}>
        {/* 헤더 */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h2 className="m-0 fw-bold" style={{ fontSize: "1.8rem" }}>
            알림 내역
          </h2>

          {/* 우측 버튼들 */}
          <div className="d-flex gap-2">
            {!selectMode && (
              <>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => enterMode("read")}
                  disabled={loading}
                >
                  읽음
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => enterMode("delete")}
                  disabled={loading}
                >
                  삭제
                </button>
              </>
            )}

            {selectMode && (
              <>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={cancelMode}
                  disabled={loading}
                >
                  취소
                </button>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={toggleSelectAll}
                  disabled={!notifications.length}
                >
                  {isAllSelected ? "전체해제" : "전체선택"}
                </button>

                {mode === "read" && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleBulkRead}
                    disabled={selected.size === 0}
                  >
                    읽음처리
                  </button>
                )}

                {mode === "delete" && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      if (selected.size === 0) {
                        showAlert?.("danger", "선택된 알림이 없습니다.");
                        return;
                      }
                      openConfirmModal({
                        title: "알림 삭제",
                        body: "<p>선택한 알림을 삭제하시겠습니까?</p>",
                        onConfirm: async () => {
                          try {
                            await handleBulkDelete();
                          } finally {
                            closeConfirmModal();
                          }
                        },
                      });
                    }}
                    disabled={selected.size === 0}
                  >
                    선택삭제
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 리스트 */}
        {loading ? (
          <div className="text-muted">로딩 중...</div>
        ) : (
          <NotificationList
            notifications={notifications}
            onItemClick={handleItemClick}
            selectMode={selectMode}
            selected={selected}
            onToggleSelect={toggleSelect}
          />
        )}

        {/* Pagination */}
        <div className="d-flex flex-column mt-3">
          <div className="text-muted small mb-1">
            총 {totalCount}건 · {page}/{totalPages} 페이지
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0 justify-content-end">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={goPrev} disabled={page <= 1}>
                  ‹
                </button>
              </li>

              {pageNumbers[0] > 1 && (
                <>
                  <li className="page-item">
                    <button className="page-link" onClick={() => goPage(1)}>
                      1
                    </button>
                  </li>
                  {pageNumbers[0] > 2 && (
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  )}
                </>
              )}

              {pageNumbers.map((p) => (
                <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => goPage(p)}>
                    {p}
                  </button>
                </li>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  )}
                  <li className="page-item">
                    <button className="page-link" onClick={() => goPage(totalPages)}>
                      {totalPages}
                    </button>
                  </li>
                </>
              )}

              <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={goNext} disabled={page >= totalPages}>
                  ›
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

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
