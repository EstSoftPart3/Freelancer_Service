import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  addDays, 
  isSameDay 
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { api } from '@/lib/axios';
import { CalendarEvent, CalendarSourceType } from '../../../types/calendar';
import CalendarFilterBar from './CalendarFilterBar';
import ScheduleModal from '../../../components/myPage/calendar/shedule_modal/ScheduleModal';
import ScheduleDetailModal from '../../../components/myPage/calendar/schedule_detail_modal/ScheduleDetailModal';
import styles from './Calendar.module.css';

const Calendar = () => {
  // ==================== State ====================
  const [loading, setLoading] = useState(false);
  const [favoritesMode, setFavoritesMode] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  // 모달 상태
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);
  const [showScheduleDetailModal, setShowScheduleDetailModal] = useState(false);
  const [selectedScheduleSq, setSelectedScheduleSq] = useState(null);

  // 필터 상태
  const [filters, setFilters] = useState({
    searchKeyword: '',
    contractTypeCd: null,
    jobRoleCd: null,
    calendarType: null
  });

  // ==================== Computed ====================
  const currentDate = useMemo(
    () => format(currentMonth, 'yyyy.MM', { locale: ko }),
    [currentMonth]
  );

  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const weeks = [];
    let currentWeek = [];
    let currentDate = calendarStart;

    while (currentDate <= calendarEnd) {
      currentWeek.push({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        date: currentDate.getDate(),
        fullDate: new Date(currentDate)
      });

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }

      currentDate = addDays(currentDate, 1);
    }

    return weeks;
  }, [currentMonth]);

  // ==================== 색상 팔레트 ====================
  const colorPalette = [
    { bg: '#90CAF9', border: '#90CAF9' },  // 파란색
    { bg: '#CE93D8', border: '#CE93D8' },  // 보라색
    { bg: '#A5D6A7', border: '#A5D6A7' },  // 초록색
    { bg: '#FFCC80', border: '#FFCC80' },  // 주황색
    { bg: '#F48FB1', border: '#F48FB1' },  // 핑크색
    { bg: '#80CBC4', border: '#80CBC4' },  // 청록색
    { bg: '#FFF59D', border: '#FFF59D' },  // 노란색
    { bg: '#C5E1A5', border: '#C5E1A5' },  // 라임색
    { bg: '#81D4FA', border: '#81D4FA' },  // 하늘색
    { bg: '#E6EE9C', border: '#E6EE9C' },  // 연두색
    { bg: '#EF9A9A', border: '#EF9A9A' },  // 빨간색
    { bg: '#B39DDB', border: '#B39DDB' },  // 진보라색
  ];

  // ==================== API 호출 ====================
  const loadCalendarEvents = async () => {
    try {
      setLoading(true);

      const params = {
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth() + 1,
        contractTypeCd: filters.contractTypeCd,
        recruitJobPositionTypeCd: filters.jobRoleCd,
        searchKeyword: filters.searchKeyword,
        calendarType: filters.calendarType
      };

      // API 호출 - Vue와 동일한 엔드포인트 사용
      const response = await api.$get('/calendar/evnts', { params });

      // 백엔드 응답 형식: { status: "OK", output: [...] }
      const ok = response?.status === 'OK';
      if (ok) {
        const events = (response.output || []).map(e => new CalendarEvent(e));
        setCalendarEvents(events);
      } else {
        alert('캘린더 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('캘린더 데이터 로드 실패:', error);
      alert('캘린더 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== 이벤트 핸들러 ====================
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // 필터 변경 시 및 마운트 시 데이터 로드
  useEffect(() => {
    loadCalendarEvents();
  }, [filters, currentMonth]);

  const addMonth = (months) => {
    setCurrentMonth((prev) => addMonths(prev, months));
  };

  const refreshCalendar = () => {
    loadCalendarEvents();
  };

  // 모달 제어
  const openScheduleModal = (day = null) => {
    setSelectedDateForModal(day ? day.fullDate : new Date());
    setShowScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedDateForModal(null);
  };

  const closeScheduleDetailModal = () => {
    setShowScheduleDetailModal(false);
    setSelectedScheduleSq(null);
  };

  // 일정 클릭 핸들러
  const handleScheduleClick = async (event) => {
    try {
      // 일정 상세 정보 조회 - Vue와 동일한 엔드포인트 사용
      const response = await api.$get(`/calendar/evnts/detail/${event.scheduleSq}`);

      const ok = response?.status === 'OK';
      if (ok) {
        const data = response.output;

        // 개인 일정
        if (data.personalDetail) {
          setSelectedScheduleSq(event.scheduleSq);
          setShowScheduleDetailModal(true);
        }
        // 면접 일정
        else if (data.interviewDetail) {
          setSelectedScheduleSq(event.scheduleSq);
          setShowScheduleDetailModal(true);
        }
        // 프로젝트 일정
        else if (data.projectDetail) {
          if (data.projectDetail.routePath) {
            window.location.href = data.projectDetail.routePath;
          } else {
            alert('프로젝트 상세 페이지를 찾을 수 없습니다.');
          }
        }
      } else {
        alert('일정 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('일정 클릭 처리 실패:', error);
      alert('일정 정보를 불러오는데 실패했습니다.');
    }
  };

  // ==================== 유틸리티 함수 ====================
  const isToday = (day) => {
    return isSameDay(day.fullDate, new Date());
  };

  // 특정 날짜가 일정 기간에 포함되는지 판단
  const isInPeriod = (event, date) => {
    const isStart = typeof event.isStartDate === 'function' 
      ? event.isStartDate(date) 
      : false;
    const isEnd = typeof event.isEndDate === 'function' 
      ? event.isEndDate(date) 
      : false;
    const isOngoing = typeof event.isOngoing === 'function' 
      ? event.isOngoing(date) 
      : false;

    const hasEnd = !!event.endDt || !!event.endDate || !!event.end;

    if (!hasEnd) {
      return typeof event.isOnDate === 'function' 
        ? event.isOnDate(date) 
        : false;
    }

    return isStart || isEnd || isOngoing;
  };

  const getDayItems = (day) => {
    return calendarEvents.filter(ev => isInPeriod(ev, day.fullDate));
  };

  const getItemClasses = (event, day) => {
    const classes = [];

    // 소스 타입별 클래스
    if (event.sourceType === CalendarSourceType.PERSONAL) {
      classes.push(styles['personal-schedule']);
    } else if (event.sourceType === CalendarSourceType.PROJECT) {
      classes.push(styles['project-schedule']);
    } else if (event.sourceType === CalendarSourceType.INTERVIEW) {
      classes.push(styles['interview-schedule']);
    }

    // 시작/종료/진행 상태 클래스
    if (event.isStartDate(day.fullDate)) {
      classes.push(styles.start);
    }
    if (event.isEndDate(day.fullDate)) {
      classes.push(styles.end);
    }
    if (event.isOngoing(day.fullDate)) {
      classes.push(styles.ongoing);
    }

    return classes.join(' ');
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getEventStyle = (event) => {
    const colorIndex = event.scheduleSq % colorPalette.length;
    const colors = colorPalette[colorIndex];

    return {
      backgroundColor: colors.bg,
      borderColor: colors.border,
      color: '#333'
    };
  };

  return (
    <div className={styles['calendar-container']}>
      {/* 로딩 화면 */}
      {loading && (
        <div className={styles['fullpage-loading']}>
          <div className={styles['loading-spinner']}>
            <i className="bi bi-arrow-clockwise"></i>
            <span>로딩 중...</span>
          </div>
        </div>
      )}

      {/* 캘린더 콘텐츠 */}
      <div className={styles['calendar-content']}>
        {/* 캘린더 필터바 */}
        <CalendarFilterBar onUpdate={updateFilters} />

        <div className={styles['calendar-right']}>
          {/* 캘린더 헤더 */}
          <div className={styles['calendar-right-head']}>
            <div className={styles['nav-search-bar']}>
              <div className={styles['calendar-nav']}>
                <div className={styles['icon-wrapper']} onClick={() => addMonth(-1)}>
                  <i className="bi bi-chevron-left"></i>
                </div>
                <span className={styles.current}>{currentDate}</span>
                <div className={styles['icon-wrapper']} onClick={() => addMonth(1)}>
                  <i className="bi bi-chevron-right"></i>
                </div>
              </div>
              <div className={styles['add-schedule']} onClick={() => openScheduleModal()}>
                일정 추가
              </div>
            </div>
          </div>

          {/* 메인 캘린더 */}
          <div 
            className={`${styles['calendar-body']} ${favoritesMode ? styles['schedule-mode'] : ''}`}
          >
            {calendarWeeks.map((week, weekIndex) => (
              <div 
                key={`week-${weekIndex}`} 
                className={`${styles['calendar-week']} ${styles[`week-${weekIndex}`]}`}
              >
                {week.map((day) => (
                  <div 
                    key={`${day.year}-${day.month}-${day.date}`} 
                    className={styles['calendar-cell']}
                  >
                    <div 
                      className={`${styles['day-label']} ${isToday(day) ? styles.today : ''}`}
                    >
                      {day.date}
                    </div>
                    <div 
                      className={`${styles['day-content']} ${getDayItems(day).length > 0 ? styles['has-calendar-item'] : ''}`}
                      onDoubleClick={() => {
                        if (favoritesMode) {
                          openScheduleModal(day);
                        }
                      }}
                    >
                      {getDayItems(day).length > 0 && (
                        <div className={styles['calendar-items']}>
                          {getDayItems(day).map((event) => (
                            <div
                              key={event.scheduleSq}
                              className={`${styles['calendar-item']} ${getItemClasses(event, day)}`}
                              style={getEventStyle(event)}
                            >
                              <div 
                                className={styles.company} 
                                onClick={() => handleScheduleClick(event)}
                              >
                                <div className={styles['company-name']}>
                                  <span>{truncateText(event.title, 9)}</span>
                                </div>
                                {event.sourceType === 'PERSONAL' && (
                                  <div className={styles['personal-badge']}>
                                    <i className="bi bi-person"></i>
                                  </div>
                                )}
                                {event.sourceType === 'PROJECT' && (
                                  <div className={styles['project-badge']}>
                                    <i className="bi bi-briefcase"></i>
                                  </div>
                                )}
                                {event.sourceType === 'INTERVIEW' && (
                                  <div className={styles['interview-badge']}>
                                    <i className="bi bi-clipboard-check"></i>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 개인 일정 추가 모달 */}
      {showScheduleModal && (
        <ScheduleModal
          show={showScheduleModal}
          selectedDate={selectedDateForModal}
          onClose={closeScheduleModal}
          onSuccess={refreshCalendar}
        />
      )}

      {/* 일정 상세 모달 */}
      {showScheduleDetailModal && (
        <ScheduleDetailModal
          show={showScheduleDetailModal}
          scheduleSq={selectedScheduleSq}
          onClose={closeScheduleDetailModal}
          onUpdated={refreshCalendar}
          onDeleted={refreshCalendar}
        />
      )}
    </div>
  );
};

export default Calendar;

