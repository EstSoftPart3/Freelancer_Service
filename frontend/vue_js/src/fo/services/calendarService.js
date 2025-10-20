import {api} from '@/axios.js'

export const calendarService = {
  // 캘린더 일정 조회
  async getCalendarEvents(params = {}) {
    try {
      const response = await api.$get('/calendar/evnts', { params })
      // 백엔드: { status: "OK", message: "...", output: [...] }
      const ok = response?.status === 'OK'
      return { success: ok, data: ok ? (response.output || []) : [] }
    } catch (error) {
      console.error('캘린더 일정 조회 실패:', error)
      return { success: false, data: [] }
    }
  },

  // 개인 일정 생성
  async createPersonalSchedule(scheduleData) {
    try {
      const response = await api.$post('/calendar/evnts', scheduleData)
      const ok = response?.status === 'OK'
      return { success: ok, data: ok ? (response.output || null) : null }
    } catch (error) {
      console.error('개인 일정 생성 실패:', error)
      return { success: false, data: null }
    }
  },

  // 일정 상세 조회
  async getScheduleDetail(scheduleSq) {
    try {
      const response = await api.$get(`/calendar/evnts/detail/${scheduleSq}`)
      const ok = response?.status === 'OK'
      return { success: ok, data: ok ? (response.output || null) : null }
    } catch (error) {
      console.error('일정 상세 조회 실패:', error)
      return { success: false, data: null }
    }
  },

  // 일정 수정
  async updateSchedule(scheduleSq, updateData) {
    try {
      const response = await api.$patch(`/calendar/evnts/${scheduleSq}`, updateData)
      const ok = response?.status === 'OK'
      return { success: ok, data: ok ? (response.output || null) : null }
    } catch (error) {
      console.error('일정 수정 실패:', error)
      return { success: false, data: null }
    }
  },

  // 일정 삭제
  async deleteSchedule(scheduleSq) {
    try {
      const response = await api.$delete(`/calendar/evnts/${scheduleSq}`)
      const ok = response?.status === 'OK'
      return { success: ok, data: ok ? (response.output || null) : null }
    } catch (error) {
      console.error('일정 삭제 실패:', error)
      return { success: false, data: null }
    }
  }
}

export default calendarService
