import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

export default function ModuleNotification() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [isReadMode, setIsReadMode] = useState(false);
  const [selectedNoti, setSelectedNoti] = useState(() => new Set());

  const notificationDropdownRef = useRef(null);
  const ALL_ID = "noti-select-all";

  // ✅ DB에서 이미 N만 내려주므로 unreadCount는 그냥 길이
  const unreadCount = notifications.length;

  const isAllSelected =
    notifications.length > 0 &&
    notifications.every((n) => selectedNoti.has(n.notificationSq));

  // 드롭다운 열고/닫힐 때 모드/선택 초기화
  useEffect(() => {
    const root = notificationDropdownRef.current;
    if (!root) return;

    const reset = () => {
      setIsReadMode(false);
      setSelectedNoti(new Set());
    };

    root.addEventListener("show.bs.dropdown", reset);
    root.addEventListener("hidden.bs.dropdown", reset);

    return () => {
      root.removeEventListener("show.bs.dropdown", reset);
      root.removeEventListener("hidden.bs.dropdown", reset);
    };
  }, []);

  // ✅ 최초 로딩: 미읽음만 조회
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadUnread = async () => {
      try {
        const res = await api.$get("/notifications/unread", {
          params: { page: 1, size: 5, deleteStatus: 2301 },
        });
        const data = res?.output ?? res;
        setNotifications(data?.items ?? []);
      } catch (e) {
        console.error("미읽음 알림 조회 실패:", e?.response?.status, e?.response?.data);
      }
    };

    loadUnread();
  }, [isLoggedIn]);

  // ✅ SSE: 새 알림은 무조건 미읽음으로 들어온다고 가정
  useEffect(() => {
    if (!isLoggedIn) return;

    const eventSource = new EventSource("http://localhost:8080/notifications/subscribe", {
      withCredentials: true,
    });

    eventSource.addEventListener("NOTIFICATION", (e) => {
      const data = JSON.parse(e.data);
      setNotifications((prev) => {
        // 중복 방지
        if (prev.some((x) => x.notificationSq === data.notificationSq)) return prev;
        return [data, ...prev].slice(0, 5); // 헤더는 5개만 유지
      });
    });

    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [isLoggedIn]);

  const toggleReadMode = () => {
    setIsReadMode((prev) => {
      const next = !prev;
      if (!next) setSelectedNoti(new Set());
      return next;
    });
  };

  const toggleSelectNoti = (sq) => {
    setSelectedNoti((prev) => {
      const next = new Set(prev);
      next.has(sq) ? next.delete(sq) : next.add(sq);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedNoti((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        notifications.forEach((n) => next.delete(n.notificationSq));
      } else {
        notifications.forEach((n) => next.add(n.notificationSq));
      }
      return next;
    });
  };

  const getNotificationLink = (n) => {
    switch (n.notificationTargetTypeCd) {
      case 2201:
        return `/community/board/${n.notificationTargetSq}`;
      case 2202:
        return `/community/board/${n.notificationTargetSq}`;
      default:
        return null;
    }
  };

  // ✅ 단건 읽음 처리 → 성공하면 모듈에서 제거
  const markOneAsReadAndGo = async (n) => {
    try {
      await api.$patch("/notifications/read", {
        notificationSqList: [n.notificationSq],
      });

      setNotifications((prev) => prev.filter((x) => x.notificationSq !== n.notificationSq));
    } catch (e) {
      console.error("단건 읽음 처리 실패:", e?.response?.status, e?.response?.data);
      return;
    }

    const link = getNotificationLink(n);
    if (link) router.push(link);
  };

  // ✅ 선택 읽음 처리 → 성공하면 제거
  const markSelectedAsRead = async () => {
    if (selectedNoti.size === 0) return;

    const ids = Array.from(selectedNoti);

    try {
      await api.$patch("/notifications/read", {
        notificationSqList: ids,
      });

      setNotifications((prev) => prev.filter((x) => !ids.includes(x.notificationSq)));

      setSelectedNoti(new Set());
      setIsReadMode(false);
    } catch (e) {
      console.error("읽음 처리 실패:", e?.response?.status, e?.response?.data);
    }
  };

  return (
    <div className="dropdown" ref={notificationDropdownRef}>
      <a
        href="#"
        role="button"
        className="btn btn-light d-flex justify-content-center align-items-center position-relative dropdown-toggle no-caret"
        id="notificationDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{ width: "36px", height: "36px", borderRadius: "50%" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <i className="bi bi-bell fs-5"></i>

        {unreadCount > 0 && (
          <span
            className="position-absolute translate-middle badge rounded-pill bg-primary"
            style={{ top: "0", right: "0", fontSize: "0.7rem", minWidth: "18px" }}
          >
            {unreadCount}
          </span>
        )}
      </a>

      <div className="dropdown-menu dropdown-menu-end shadow p-2" style={{ width: "340px" }}>
        <div className="d-flex justify-content-between align-items-center px-2 py-1">
          <span className="fw-bold" style={{ fontSize: "1rem" }}>
            알림
          </span>

          <button
            type="button"
            className="btn btn-link p-0 text-primary"
            style={{ fontSize: "0.9rem", textDecoration: "none" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleReadMode();
            }}
            disabled={notifications.length === 0}
          >
            {isReadMode ? "취소" : "읽음"}
          </button>
        </div>

        {isReadMode && (
          <div
            className="d-flex justify-content-between align-items-center px-2 mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.9rem" }}>
              <input
                id={ALL_ID}
                type="checkbox"
                className="form-check-input"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                onClick={(e) => e.stopPropagation()}
              />
              <label
                htmlFor={ALL_ID}
                style={{ cursor: "pointer", userSelect: "none", margin: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                모두 선택
              </label>
            </div>

            <button
              className="btn btn-sm btn-primary"
              style={{ fontSize: "0.85rem" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                markSelectedAsRead();
              }}
              disabled={selectedNoti.size === 0}
            >
              읽음 처리
            </button>
          </div>
        )}

        <div className="dropdown-divider my-1" />

        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <div className="text-muted px-2 py-3" style={{ fontSize: "0.9rem" }}>
              새로운 알림이 없습니다.
            </div>
          ) : (
            notifications.map((n) => {
              const checked = selectedNoti.has(n.notificationSq);

              return (
                <div
                  key={n.notificationSq}
                  className="dropdown-item"
                  style={{ cursor: "pointer", padding: "10px", backgroundColor: "#f8f9fa" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isReadMode) toggleSelectNoti(n.notificationSq);
                    else markOneAsReadAndGo(n);
                  }}
                >
                  <div className="d-flex gap-2">
                    <div style={{ width: "22px", marginTop: "2px" }}>
                      <i className="bi bi-bell"></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="fw-bold" style={{ fontSize: "0.95rem" }}>
                        {n.notificationTtl}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.88rem" }}>
                        {n.notificationTxt}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {n.notificationCreateAtDtm
                          ? new Date(n.notificationCreateAtDtm).toLocaleString()
                          : ""}
                      </div>
                    </div>

                    {isReadMode && (
                      <input
                        type="checkbox"
                        className="form-check-input mt-1"
                        checked={checked}
                        onChange={() => toggleSelectNoti(n.notificationSq)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="dropdown-divider my-1" />

        <button
          className="dropdown-item text-center text-primary"
          style={{ fontSize: "0.9rem" }}
          onClick={() => router.push("/mypage/notification/core/page")}
        >
          자세히 보기
        </button>
      </div>
    </div>
  );
}
