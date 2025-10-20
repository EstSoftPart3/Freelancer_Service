// 캘린더 이벤트 타입 정의
export const CalendarSourceType = {
  PERSONAL: 'PERSONAL',
  PROJECT: 'PROJECT'
}

// 캘린더 뷰 DTO (백엔드 CalendarViewDto와 매핑)
export class CalendarEvent {
  constructor(data) {
    this.scheduleSq = data.scheduleSq
    this.sourceType = data.sourceType // 'PERSONAL' | 'PROJECT'
    this.title = data.title
    this.projectSq = data.projectSq
    this.companySq = data.companySq
    this.startDt = new Date(data.startDt)
    this.endDt = data.endDt ? new Date(data.endDt) : null
  }

  // 이벤트가 특정 날짜에 해당하는지 확인
  isOnDate(date) {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    const startDate = new Date(this.startDt)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = this.endDt ? new Date(this.endDt) : startDate
    endDate.setHours(0, 0, 0, 0)
    
    return targetDate >= startDate && targetDate <= endDate
  }

  // 이벤트가 시작일인지 확인
  isStartDate(date) {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    const startDate = new Date(this.startDt)
    startDate.setHours(0, 0, 0, 0)
    
    return targetDate.getTime() === startDate.getTime()
  }

  // 이벤트가 종료일인지 확인
  isEndDate(date) {
    if (!this.endDt) return false
    
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(this.endDt)
    endDate.setHours(0, 0, 0, 0)
    
    return targetDate.getTime() === endDate.getTime()
  }

  // 이벤트가 진행 중인지 확인
  isOngoing(date) {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    const startDate = new Date(this.startDt)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = this.endDt ? new Date(this.endDt) : startDate
    endDate.setHours(0, 0, 0, 0)
    
    return targetDate > startDate && targetDate < endDate
  }
}

// 개인 일정 생성 요청 DTO (백엔드 PersonalScheduleCreateRequest와 매핑)
export class PersonalScheduleCreateRequest {
  constructor(data) {
    this.title = data.title
    this.startDt = data.startDt
    this.endDt = data.endDt || data.startDt
    this.description = data.description || ''
  }

  // 백엔드 API 형식으로 변환
  toApiFormat() {
    return {
      title: this.title,
      startDt: this.startDt,
      endDt: this.endDt,
      description: this.description
    }
  }
}

// 캘린더 필터 옵션
export class CalendarFilter {
  constructor() {
    this.contractTypeCd = null
    this.jobTypeCd = null
    this.year = null
    this.month = null
  }

  // API 파라미터로 변환
  toApiParams() {
    const params = {}
    
    if (this.contractTypeCd) {
      params.contractTypeCd = this.contractTypeCd
    }
    
    if (this.jobTypeCd) {
      params.jobTypeCd = this.jobTypeCd
    }
    
    if (this.year) {
      params.year = this.year
    }
    
    if (this.month) {
      params.month = this.month
    }
    
    return params
  }

  // 필터 초기화
  reset() {
    this.contractTypeCd = null
    this.jobTypeCd = null
    this.year = null
    this.month = null
  }
}

export default {
  CalendarEvent,
  PersonalScheduleCreateRequest,
  CalendarFilter,
  CalendarSourceType
}
