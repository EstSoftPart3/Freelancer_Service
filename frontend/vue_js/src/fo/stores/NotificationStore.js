import { defineStore } from 'pinia'
import { api } from '@/axios'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    recentNotifications: [],
    unreadCount: 0,
    notificationChanged: 0,
  }),

  actions: {
    notifyChanged() {
      this.notificationChanged++
    },

    async fetchRecentNotifications() {
      try {
        const res = await api.$get('/notifications/recent')
        this.recentNotifications = Array.isArray(res) ? res : []
      } catch (error) {
        console.error('최근 알림 조회 실패:', error)
        this.recentNotifications = []
      }
    },

    async fetchUnreadCount() {
      try {
        const res = await api.$get('/notifications/unread-count')
        this.unreadCount = Number(res ?? 0)
      } catch (error) {
        console.error('안 읽은 알림 개수 조회 실패:', error)
        this.unreadCount = 0
      }
    },

    async refreshNotifications() {
      await Promise.all([
        this.fetchRecentNotifications(),
        this.fetchUnreadCount(),
      ])
    },

    async markAsRead(notification) {
      if (!notification || notification.notificationReadYn === 'Y') return

      try {
        await api.$patch(`/notifications/${notification.notificationSq}`)

        notification.notificationReadYn = 'Y'

        const target = this.recentNotifications.find(
          (item) => item.notificationSq === notification.notificationSq,
        )

        if (target) {
          target.notificationReadYn = 'Y'
        }

        await this.fetchUnreadCount()
        this.notifyChanged()
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error)
      }
    },

    async deleteNotification(notificationSq) {
      try {
        const res = await api.$delete(`/notifications/${notificationSq}`)
        // if (res.status === 'OK') {
        const targetSq = Number(notificationSq)
        this.recentNotifications = this.recentNotifications.filter(
          (item) => Number(item.notificationSq) !== targetSq,
        )
        await this.fetchUnreadCount()
        this.notifyChanged()
        // }
        return res
      } catch (error) {
        console.error('알림 삭제 실패:', error)
        throw error
      }
    },
  },
})
