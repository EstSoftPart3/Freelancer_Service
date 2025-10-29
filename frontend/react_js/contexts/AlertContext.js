import { createContext, useContext, useState } from 'react'

const AlertContext = createContext()

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'info', // 'success', 'danger', 'warning', 'info'
  })

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type })
    
    // 3초 후 자동으로 닫기
    setTimeout(() => {
      hideAlert()
    }, 3000)
  }

  const hideAlert = () => {
    setAlert({ show: false, message: '', type: 'info' })
  }

  return (
    <AlertContext.Provider
      value={{
        alert,
        showAlert,
        hideAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}




