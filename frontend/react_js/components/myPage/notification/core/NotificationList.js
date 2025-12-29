import NotificationItem from "./NotificationItem";

export default function NotificationList({
  notifications,
  onItemClick,
  selectMode,
  selected,
  onToggleSelect,
}) {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return <div className="text-muted">알림이 없습니다.</div>;
  }

  return (
    <div className="list-group">
      {notifications.map((n) => (
        <NotificationItem
          key={n.notificationSq}
          notification={n}
          onClick={onItemClick}
          selectMode={selectMode}
          checked={selected?.has?.(n.notificationSq)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
