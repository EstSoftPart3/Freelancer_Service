import router from './index'
import { useAlertStore } from '../stores/alertStore'

export function navigateByUserTypeAndProjectSq(userType, projectSq) {
  const alertStore = useAlertStore()
  // console.log(userType)
  if (userType === 'PERSONAL') {
    router.push(`/project/spec/user/${projectSq}`)
  } else if (userType === 'COMPANY') {
    router.push(`/project/spec/company/${projectSq}`)
  } else {
    alertStore.show('로그인이 필요한 서비스입니다.', 'danger')
    router.push('/login')
  }
}

export function navigateCompanyPageWithProjectSq(userType, projectSq) {
  if (userType === 'PERSONAL') {
    router.push('/')
  } else if (userType === 'COMPANY') {
    router.push(`/project/spec/company/${projectSq}`)
  } else {
    router.push('/login')
  }
}

export default router
