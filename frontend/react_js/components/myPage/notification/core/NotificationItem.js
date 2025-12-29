export default function NotificationItem({
  notification,
  onClick,
  selectMode,
  checked,
  onToggleSelect,
}) {
  const readYn =
    notification?.notificationIsReadYn ??
    notification?.notificationReadYn ??
    "Y";

  const title =
    notification?.notificationTtl ??
    notification?.notificationTitle ??
    "";

  const text = notification?.notificationTxt ?? "";

  const createdAt =
    notification?.notificationCreatedAtDtm ??
    notification?.notificationCreateAtDtm ??
    null;

  const isUnread = readYn === "N";

  return (
    <div
      className={`list-group-item d-flex align-items-start ${
        isUnread ? "bg-light" : ""
      }`}
      style={{ cursor: "pointer", padding: "10px 12px" }}
      role="button"
      onClick={() => onClick?.(notification)}
    >
      {/* 체크박스: 선택모드에서만 표시 */}
      {selectMode && (
        <div className="me-2 pt-1">
          <input
            type="checkbox"
            className="form-check-input"
            checked={!!checked}
            onChange={() => onToggleSelect?.(notification.notificationSq)}
            onClick={(e) => e.stopPropagation()} // 체크 클릭이 row 클릭으로 전파되지 않게
          />
        </div>
      )}

      {/* 본문 */}
      <div className="flex-grow-1">
        <div className="fw-semibold" style={{ fontSize: "0.95rem" }}>
          {title || "(제목 없음)"}
        </div>

        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
          {text}
        </div>

        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
          {createdAt ? new Date(createdAt).toLocaleString() : ""}
        </div>
      </div>

      {/* 상태 뱃지 */}
      <span className={`badge ${isUnread ? "bg-primary" : "bg-secondary"}`}>
        {isUnread ? "미확인" : "확인"}
      </span>
    </div>
  );
}
