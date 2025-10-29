import { useAlert } from '@/contexts/AlertContext'
import styles from './CommonAlert.module.css'

export default function CommonAlert() {
  const { alert, hideAlert } = useAlert()

  if (!alert.show) return null

  const alertClass = alert.type === 'danger' ? 'alert-danger' : 'alert-info'
  const icon = alert.type === 'danger' ? 'fas fa-exclamation-triangle' : 'fa-solid fa-check'
  const text = alert.type === 'danger' ? ' 실패!' : ' 성공!'

  return (
    <div
      className={`${styles.alert} alert ${alertClass} alert-dismissible fade show`}
      role="alert"
    >
      <button
        type="button"
        className="btn-close"
        onClick={hideAlert}
        aria-label="Close"
      />
      <strong className="me-2">
        <i className={icon}></i>
        {text}
      </strong>
      {alert.message}
    </div>
  )
}


