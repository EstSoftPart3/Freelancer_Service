import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/axios'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  let eventSource = null

  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalPages = ref(0)
  const totalCount = ref(0)

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

      // 3초 후 재연결 시도
      setTimeout(() => {
        console.log('SSE 재연결 시도...')
        connectSSE()
      }, 3000)
    }
  }

  const addNotification = (notification) => {
    // 현재 1페이지를 보고 있을 때만 화면 상단에 즉시 반영
    if (currentPage.value === 1) {
      notifications.value.unshift(notification)
      if (notifications.value.length > pageSize.value) {
        notifications.value.pop()
      }
    }

    totalCount.value += 1
    totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize.value))

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

  /**
   * 모달/뱃지용 "읽지 않은 알림 목록" 로드 (/notifications)
   */
  const loadNotifications = async () => {
    try {
      const response = await api.$get('/notifications')
      console.log('알림 API 응답:', response)

      // ApiResponse<List<NotificationResponse>> 형태: output이 배열
      if (response?.output && Array.isArray(response.output)) {
        notifications.value = response.output
        unreadCount.value = response.output.filter(
          (n) => n.notificationIsReadYn === 'N',
        ).length
        console.log('✅ 알림 로드 성공:', notifications.value.length, '개')
        console.log('✅ 읽지 않은 알림:', unreadCount.value, '개')
        return
      }

      // 예비: output.notifications 형태
      if (response?.output?.notifications && Array.isArray(response.output.notifications)) {
        notifications.value = response.output.notifications
        unreadCount.value =
          response.output.unreadCount ??
          notifications.value.filter((n) => n.notificationIsReadYn === 'N').length
        return
      }

      console.warn('⚠️ 알 수 없는 응답 구조:', response)
      notifications.value = []
      unreadCount.value = 0
    } catch (error) {
      console.error('❌ 알림 목록 로드 실패:', error)
      notifications.value = []
      unreadCount.value = 0
    }
  }

  /**
   * ✅ 페이지네이션 화면용 (페이지번호 기반)
   * - 백엔드: GET /notifications/page-number?page=1&size=10
   * - 응답: ApiResponse<NotificationPageResponse>
   *   output: { notifications, page?, size?, totalCount?, totalPages?, hasNext?, nextCursor? }
   */
  const loadNotificationsPage = async (page = 1) => {
    try {
      currentPage.value = page

      // 🚀 핵심 수정: /notifications/page  ->  /notifications/page-number
      const response = await api.$get('/notifications/page-number', {
        params: {
          page: currentPage.value,
          size: pageSize.value,
        },
      })

      console.log('알림 페이지(번호) API 응답:', response)

      // api.$get이 이미 data를 까서 주는 경우가 많아서 output 기준으로 처리
      const output = response?.output ?? response?.data?.output ?? null

      if (output && Array.isArray(output.notifications)) {
        notifications.value = output.notifications

        // 백엔드가 totalCount/totalPages를 내려주면 그걸 사용
        if (typeof output.totalCount === 'number') totalCount.value = output.totalCount
        else totalCount.value = notifications.value.length

        if (typeof output.totalPages === 'number') totalPages.value = output.totalPages
        else totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize.value))

        unreadCount.value =
          typeof output.unreadCount === 'number'
            ? output.unreadCount
            : notifications.value.filter((n) => n.notificationIsReadYn === 'N').length

        return
      }

      // 혹시 백엔드가 content 기반(PageImpl) 형태로 내려주는 케이스 대응(예비)
      if (output?.content && Array.isArray(output.content)) {
        notifications.value = output.content
        totalPages.value = output.totalPages ?? 0
        totalCount.value = output.totalElements ?? 0
        unreadCount.value =
          typeof output.unreadCount === 'number'
            ? output.unreadCount
            : notifications.value.filter((n) => n.notificationIsReadYn === 'N').length
        return
      }

      console.warn('⚠️ 페이지네이션 응답 구조 확인 필요:', response)
      notifications.value = []
      totalPages.value = 0
      totalCount.value = 0
      unreadCount.value = 0
    } catch (error) {
      console.error('❌ 알림 페이지 로드 실패:', error)
      notifications.value = []
      totalPages.value = 0
      totalCount.value = 0
      unreadCount.value = 0
    }
  }

  const goToPage = async (page) => {
    if (page < 1) return
    if (totalPages.value && page > totalPages.value) return
    await loadNotificationsPage(page)
  }

  return {
    notifications,
    unreadCount,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    connectSSE,
    disconnectSSE,
    addNotification,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    loadNotificationsPage,
    goToPage,
  }
})
