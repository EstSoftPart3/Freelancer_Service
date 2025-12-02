import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/axios'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  let eventSource = null

  const connectSSE = () => {
    if (eventSource) {
      eventSource.close()
    }

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')

    const url = token
      ? `/api/notifications/subscribe?token=${encodeURIComponent(token)}`
      : `/api/notifications/subscribe`

    eventSource = new EventSource(url, {
      withCredentials: true,
    })

    eventSource.addEventListener('connect', (e) => {
      console.log('SSE 연결 성공 : ', e.data)
    })

    eventSource.addEventListener('notification', (e) => {
      try {
        const notification = JSON.parse(e.data)
        console.log(' 새 알림 수신 : ', notification)

        addNotification(notification)
      } catch (error) {
        console.error('알림 파싱 오류: ', error)
      }
    })

    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류 :', error)

      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE 연결 종료됨')
      }
      eventSource.close()
      //3초 후 재연결 시도
      setTimeout(() => {
        console.log('SSE 재연결 시도...')
        connectSSE()
      }, 3000)
    }
  }

  const addNotification = (notification) => {
    notifications.value.unshift(notification)

    if (notification.notificationIsReadYn !== 'Y') {
      unreadCount.value++
    }
  }

  const markAsRead = async (notificationSq) => {
    const notification = notifications.value.find(
      (n) => n.notificationSq === notificationSq,
    )
    if (notification && notification.notificationIsReadYn !== 'Y') {
      notification.notificationIsReadYn = 'Y'
      unreadCount.value--

      // API 호출하여 서버에도 읽음 처리
      try {
        await api.$patch(`/notifications/${notificationSq}`, {
          notificationIsReadYn: 'Y',
        })
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error)
        // 실패 시 롤백
        notification.notificationIsReadYn = 'N'
        unreadCount.value++
      }
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach((n) => {
      if (n.notificationIsReadYn !== 'Y') {
        n.notificationIsReadYn = 'Y'
      }
    })
    unreadCount.value = 0
  }

  const disconnectSSE = () => {
    if (eventSource) {
      console.log('SSE 연결 종료')
      eventSource.close()
      eventSource = null
    }
  }

  const loadNotifications = async () => {
    // 초기 알림 목록 로드
    try {
      const response = await api.$get('/notifications')
      console.log('알림 API 응답:', response) // 디버깅용

      if (response.output && Array.isArray(response.output)) {
        notifications.value = response.output
        unreadCount.value = response.output.filter(
          (n) => n.notificationIsReadYn === 'N',
        ).length
        console.log('✅ 알림 로드 성공:', notifications.value.length, '개')
        console.log('✅ 읽지 않은 알림:', unreadCount.value, '개')
      }
      // response.output.notifications가 있는 경우 (예비)
      else if (response.output?.notifications) {
        notifications.value = response.output.notifications
        unreadCount.value =
          response.output.unreadCount ||
          notifications.value.filter((n) => n.notificationIsReadYn === 'N')
            .length
      }
      // 그 외의 경우
      else {
        console.warn('⚠️ 알 수 없는 응답 구조:', response)
        notifications.value = []
        unreadCount.value = 0
      }
    } catch (error) {
      console.error('❌ 알림 목록 로드 실패:', error)
      notifications.value = []
      unreadCount.value = 0
    }
  }

  return {
    notifications,
    unreadCount,
    connectSSE,
    disconnectSSE,
    addNotification,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  }
})
