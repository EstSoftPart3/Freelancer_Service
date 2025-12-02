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
      localStorage.getItem('accressToken') ||
      sessionStorage.getItem('accessToken')

    const url = token
      ? `/pai/notificartions/subscribe?token=${encodeURIComponent(token)}`
      : `/api/notifications/subscribe`

    eventSource = new EventSource(url, {
      withCredentials: true,
    })

    eventSource.addEventListener(`connect`, (e) => {
      console.log('SSE 연결 성공 : ', e.data)
    })

    eventSource.addEventListener(`notification`, (e) => {
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
        await api.$patch(`/notifications/${notificationSq}/read`)
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error)
        // 실패 시 롤백
        notification.notificaionIsReadYn = 'N'
        unreadCount.value++
      }
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach((n) => {
      if (n.notificaionIsReadYn !== 'Y') {
        n.notificaionIsReadYn = 'Y'
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
      if (response.output) {
        notifications.value = response.output.notifications || []
        unreadCount.value = response.output.unreadCount || 0
      }
    } catch (error) {
      console.error('알림 목록 로드 실패:', error)
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
