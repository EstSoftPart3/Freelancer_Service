import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAlertStore } from '@/store/alertStore';
import styles from './InterviewTimeModal.module.css';

/**
 * 인터뷰 가능 시간 선택 모달
 * Props:
 * - onConfirm: (times) => void - 선택 완료 콜백
 * - onClose: () => void - 모달 닫기 콜백
 * - interviewTimes: Array<{date, times}> - 기존 선택된 인터뷰 시간
 */
export default function InterviewTimeModal({ onConfirm, onClose, interviewTimes = [] }) {
  const alertStore = useAlertStore();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState({});

  const today = new Date();
  const [leftMonth, setLeftMonth] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [rightMonth, setRightMonth] = useState({
    month: today.getMonth() === 11 ? 0 : today.getMonth() + 1,
    year: today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear(),
  });

  // 기존 선택된 인터뷰 시간 초기화
  useEffect(() => {
    const times = {};
    interviewTimes.forEach(({ date, times: timeList }) => {
      times[date] = [...timeList];
    });
    setSelectedTimes(times);
  }, [interviewTimes]);

  // 시간 옵션 생성 (09:00 ~ 18:00, 30분 단위)
  const timeOptions = useMemo(() => {
    return Array.from({ length: 19 }, (_, i) => {
      const hour = Math.floor(i / 2) + 9;
      const minute = i % 2 === 0 ? '00' : '30';
      return `${String(hour).padStart(2, '0')}:${minute}`;
    });
  }, []);

  // 날짜 포맷팅
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 과거 날짜인지 확인
  const isPastDate = (date) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < todayStart;
  };

  // 날짜 선택
  const selectDate = (date) => {
    if (isPastDate(date)) return;
    const formatted = formatDate(date);
    setSelectedDate(formatted === selectedDate ? null : formatted);
  };

  // 시간 선택 토글
  const toggleTime = (time) => {
    if (!selectedDate) return;

    setSelectedTimes((prev) => {
      const current = prev[selectedDate] || [];
      const index = current.indexOf(time);
      
      if (index === -1) {
        return { ...prev, [selectedDate]: [...current, time].sort() };
      } else {
        const updated = current.filter((t) => t !== time);
        if (updated.length === 0) {
          const { [selectedDate]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [selectedDate]: updated };
      }
    });
  };

  // 선택된 시간인지 확인
  const isSelectedTime = (time) => {
    return selectedTimes[selectedDate]?.includes(time) || false;
  };

  // 캘린더 생성
  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const weeks = [];
    let week = new Array(7).fill(null);
    let dayCounter = 1;

    // 첫 주의 앞부분을 이전 달로 채우기
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDate = new Date(year, month - 1, prevMonthLastDay - i);
      week[startDayOfWeek - 1 - i] = prevMonthDate;
    }

    // 현재 달 채우기
    for (let i = startDayOfWeek; dayCounter <= daysInMonth; i++) {
      if (i === 7) {
        weeks.push(week);
        week = new Array(7).fill(null);
        i = 0;
      }
      week[i] = new Date(year, month, dayCounter);
      dayCounter++;
    }

    // 마지막 주의 뒷부분을 다음 달로 채우기
    let nextMonthDay = 1;
    for (let i = 0; i < week.length; i++) {
      if (week[i] === null) {
        week[i] = new Date(year, month + 1, nextMonthDay);
        nextMonthDay++;
      }
    }
    weeks.push(week);

    return weeks;
  };

  // 날짜 클래스 결정
  const getDayClass = (date, currentMonth) => {
    if (!date) return '';
    const dateStr = formatDate(date);
    const isSameMonth = date.getMonth() === currentMonth;
    const isPast = isPastDate(date);
    const isSelected = dateStr === selectedDate && isSameMonth;
    const hasTimes = !!selectedTimes[dateStr]?.length && isSameMonth;

    return `${styles.day} ${isSameMonth ? styles.sameMonth : styles.otherMonth} ${
      isPast ? styles.pastDate : styles.available
    } ${isSelected ? styles.selected : ''} ${hasTimes ? styles.hasTimes : ''}`;
  };

  // 월 이동
  const prevMonthLeft = () => {
    setLeftMonth((prev) => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      return { month: newMonth, year: newYear };
    });
    setRightMonth((prev) => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      return { month: newMonth, year: newYear };
    });
  };

  const nextMonthLeft = () => {
    setLeftMonth((prev) => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      return { month: newMonth, year: newYear };
    });
    setRightMonth((prev) => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      return { month: newMonth, year: newYear };
    });
  };

  // 확인 버튼
  const handleConfirm = () => {
    if (Object.keys(selectedTimes).length === 0) {
      alertStore.show('날짜와 시간을 선택해주세요.', 'danger');
      return;
    }

    const result = Object.entries(selectedTimes).map(([date, times]) => ({
      date,
      times,
    }));

    onConfirm?.(result);
    onClose?.();
  };

  // 취소 버튼
  const handleCancel = () => {
    onClose?.();
  };

  // 선택된 시간 요약
  const formattedSummary = useMemo(() => {
    const count = Object.keys(selectedTimes).length;
    if (count === 0) return '날짜와 시간을 선택하세요';
    return `${count}개의 날짜 선택됨`;
  }, [selectedTimes]);

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.daterangepicker}>
          {/* 캘린더 영역 */}
          <div className={styles.calendarWrapper}>
            {/* 왼쪽 캘린더 */}
            <div className={styles.calendar}>
              <div className={styles.calendarHeader}>
                <button className={styles.navBtn} onClick={prevMonthLeft}>
                  ◀
                </button>
                <span className={styles.monthYear}>
                  {leftMonth.year}년 {leftMonth.month + 1}월
                </span>
                <button className={styles.navBtn} onClick={nextMonthLeft}>
                  ▶
                </button>
              </div>
              <table className={styles.calendarTable}>
                <thead>
                  <tr>
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                      <th key={i}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generateCalendar(leftMonth.month, leftMonth.year).map((week, i) => (
                    <tr key={i}>
                      {week.map((date, j) => (
                        <td
                          key={j}
                          className={getDayClass(date, leftMonth.month)}
                          onClick={() => date && selectDate(date)}
                        >
                          {date ? date.getDate() : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 오른쪽 캘린더 */}
            <div className={styles.calendar}>
              <div className={styles.calendarHeader}>
                <span className={styles.monthYear}>
                  {rightMonth.year}년 {rightMonth.month + 1}월
                </span>
              </div>
              <table className={styles.calendarTable}>
                <thead>
                  <tr>
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                      <th key={i}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generateCalendar(rightMonth.month, rightMonth.year).map((week, i) => (
                    <tr key={i}>
                      {week.map((date, j) => (
                        <td
                          key={j}
                          className={getDayClass(date, rightMonth.month)}
                          onClick={() => date && selectDate(date)}
                        >
                          {date ? date.getDate() : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 시간 선택 영역 */}
          <div className={styles.timePickerWrapper}>
            <h6 className={styles.timePickerTitle}>시간 선택 (30분 단위)</h6>
            {!selectedDate && <p className={styles.timeWarning}>날짜를 먼저 선택해주세요.</p>}
            <div className={styles.timeGrid}>
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`${styles.timeSlot} ${
                    isSelectedTime(time) ? styles.selectedTime : ''
                  }`}
                  disabled={!selectedDate}
                  onClick={() => toggleTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className={styles.drpButtons}>
            <span className={styles.drpSelected}>{formattedSummary}</span>
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={handleCancel}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary ms-2"
              onClick={handleConfirm}
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

