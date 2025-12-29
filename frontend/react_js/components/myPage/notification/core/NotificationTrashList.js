import styles from "./NotificationTrashList.module.css";

export default function NotificationTrashList({
  notifications = [],
  selectMode = false,
  selected = new Set(),
  onToggleSelect,
}) {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return <div className={styles.empty}>휴지통이 비어 있습니다.</div>;
  }

  return (
    <div className={styles.list}>
      {notifications.map((n) => {
        const sq = n.notificationSq;
        const checked = selected.has(sq);

        const message = n.notificationTxt || n.notificationTtl || "";
        const sub = n.notificationTtl || "";
        const createdAt = n.notificationCreatedAtDtm || n.notificationCreateAtDtm || null;

        return (
          <div
            key={sq}
            className={`${styles.row} ${selectMode ? styles.rowSelectable : ""} ${
              checked ? styles.rowChecked : ""
            }`}
            onClick={() => {
              if (selectMode) onToggleSelect?.(sq);
            }}
            role={selectMode ? "button" : undefined}
          >
            <div className={styles.left}>
              <div className={styles.msg}>{message}</div>
              <div className={styles.sub}>
                {sub}
                {createdAt ? <span className={styles.dot}>·</span> : null}
                {createdAt ? <span>{new Date(createdAt).toLocaleString()}</span> : null}
              </div>
            </div>

            {selectMode && (
              <div className={styles.right} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={checked}
                  onChange={() => onToggleSelect?.(sq)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
