import React, { useState, useMemo, useCallback } from 'react';
import './InterviewSelectModal.css';

const { Button } = require("@/public/vendor/bootstrap/js/bootstrap.bundle");

export default function InterviewSelectModal(
    {
        interviewTimes = [],
        applicationSq,
        onConfirm,
        onCancel,
        apiPatch,
    }) {

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

    const isPastDate = useCallback((d) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const target = new Date(d);
            target.setHours(0, 0, 0, 0);
            return target < today;
        }, []);

    const getMonthYear = (obj) => `${obj.month + 1}월 ${obj.year}년`;

    const formatDate = (d) => {
        const date = new Date(d);
        return `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };

    const generateCalendar = useCallback((month, year) => {
            const weeks = [];
            const firstDay = new Date(year, month, 1).getDay();
            let current = 1 - firstDay;
            for (let w = 0; w < 6; w++) {
                const week = [];
                for (let d = 0; d < 7; d++) {
                    const date = new Date(year, month, current);
                    const isSameMonth = date.getMonth() === month;
                    week.push({ date, label: isSameMonth ? date.getDate() : '' });
                    current++;
                }
                weeks.push(week);
            }
            return weeks;
        }, []);

        const leftCalendar = useMemo(
            () => generateCalendar(leftMonth.month, leftMonth.year),
            [leftMonth, generateCalendar]
        );
        const rightCalendar = useMemo(
            () => generateCalendar(rightMonth.month, rightMonth.year),
            [rightMonth, generateCalendar]
        );

        const availableTimes = useMemo(
            () => {
                const grouped = {};
                interviewTimes.forEach(({interviewTime}) => {
                    if (typeof interviewTime !== 'string') return;
                    const [date, time] = interviewTime.split('T');
                    if (!grouped[date]) grouped[date] = [];
                    grouped[date].push(time.slice(0, 5));
                });
                return grouped;
            }, [interviewTimes]);

        const displayedTimeOptions = useMemo(
            () => {
                if (!selectedDate) return [];
                return availableTimes[selectedDate] || [];
            }, [selectedDate, availableTimes]);

    const formattedRange = useMemo(
        () => {
            if (!selectedDate) return "날짜/시간을 선택하세요"
            const t = selectedTimes[selectedDate]?.[0];
            return t ? `${selectedDate} ${t}` : selectedDate;
        },
        [selectedDate, selectedTimes]
    )

        // ======= class helpers =======
    const dayClass = (d, currentMonth) => {
        const dateString = formatDate(d);
        const isSameMonth = d.getMonth() === currentMonth;
        const past = isPastDate(d);
        const hasTimes = !!(availableTimes[dateString]?.length);

        const classes = [];
        if (!past && dateString in availableTimes && isSameMonth) classes.push("available");
        if (dateString === selectedDate && isSameMonth) classes.push("selected");
        if (hasTimes && isSameMonth) classes.push("has-times");
        if (past && isSameMonth) classes.push("past-date");
        return classes.join(" ");
    };

        // ======= actions =======
    const selectDate = (date) => {
        const formatted = formatDate(date);
        if (isPastDate(date) || !(formatted in availableTimes)) return;
        setSelectedDate((prev) => (prev === formatted ? null : formatted));
    };

    const isSelectedTime = (time) => {
        const date = selectedDate;
        return !!selectedTimes[date]?.includes(time);
    };

    const toggleTime = (time) => {
        const date = selectedDate;
        if (!date) return;
        setSelectedTimes((prev) => {
        const current = prev[date] || [];
        if (current[0] === time) {
            return { ...prev, [date]: [] }; // 토글 해제
        }
        return { ...prev, [date]: [time] }; // 단일 선택 유지
        });
    };

    const prevMonth = () => {
        setLeftMonth((prev) => {
        const next = { ...prev };
        if (next.month === 0) {
            next.month = 11;
            next.year -= 1;
        } else {
            next.month -= 1;
        }
        // right = left + 1
        const rM = next.month + 1;
        const rY = next.year + (rM > 11 ? 1 : 0);
        setRightMonth({ month: rM > 11 ? 0 : rM, year: rY });
        return next;
        });
    };

    const nextMonth = () => {
        setRightMonth((prev) => {
        const next = { ...prev };
        if (next.month === 11) {
            next.month = 0;
            next.year += 1;
        } else {
            next.month += 1;
        }
        // left = right - 1
        const lM = next.month - 1;
        const lY = next.year - (lM < 0 ? 1 : 0);
        setLeftMonth({ month: lM < 0 ? 11 : lM, year: lY });
        return next;
        });
    };

    const getAccessTokenFromCookie = () => {
        const m = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
        return m ? decodeURIComponent(m[1]) : null;
    };

    const getSelectedInterviewTimeSq = () => {
        const date = selectedDate;
        const time = selectedTimes[date]?.[0];
        if (!date || !time) return null;
        const targetDatetime = `${date}T${time}:00`;
        const matched = interviewTimes.find((i) => i.interviewTime === targetDatetime);
        return matched?.interviewTimeSq ?? null;
    };

    const sendInterviewTimeRequest = async (interviewTimeSq, applicationSq) => {
        try {
          const token = getAccessTokenFromCookie();
          const payload = { applicationSq };
          if (apiPatch) {
            // 외부 axios 인스턴스를 주입받은 경우
            await apiPatch(
              `/projects/applications/interviews/${interviewTimeSq}`,
              payload,
              {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
                withCredentials: true,
              }
            );
          } else {
            // fetch 기본 구현
            await fetch(`/api/projects/applications/interviews/${interviewTimeSq}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
              credentials: "include",
              body: JSON.stringify(payload),
            }).then((r) => {
              if (!r.ok) throw new Error("Interview time patch failed");
            });
          }
          onConfirm?.(true);
          onCancel?.(); // 모달 닫기
        } catch (e) {
          console.error("❌ 인터뷰 시간 선택 실패", e);
          // 필요 시 토스트/알림 연동
          alert("날짜와 시간을 선택해주세요.");
        }
      };
    
      const handleConfirm = () => {
        const interviewTimeSq = getSelectedInterviewTimeSq();
        if (!interviewTimeSq || !applicationSq) {
          alert("날짜와 시간을 선택해주세요.");
          return;
        }
        sendInterviewTimeRequest(interviewTimeSq, applicationSq);
      };
        
// ======= render =======
return (
    <div>
      <div className="daterangepicker ltr show-calendar openscenter">
        <div className="calendar-wrapper">
          {/* LEFT CALENDAR */}
          <div className="drp-calendar left">
            <div className="calendar-table">
              <table className="table-condensed">
                <thead>
                  <tr>
                    <th className="prev available" onClick={prevMonth}>
                      <span>&lt;</span>
                    </th>
                    <th colSpan={5} className="month">
                      {getMonthYear(leftMonth)}
                    </th>
                    <th></th>
                  </tr>
                  <tr>
                    <th>일</th>
                    <th>월</th>
                    <th>화</th>
                    <th>수</th>
                    <th>목</th>
                    <th>금</th>
                    <th>토</th>
                  </tr>
                </thead>
                <tbody>
                  {leftCalendar.map((week, rowIndex) => (
                    <tr key={`left-${rowIndex}`}>
                      {week.map((day, colIndex) => (
                        <td
                          key={`left-${colIndex}-${rowIndex}`}
                          className={dayClass(day.date, leftMonth.month)}
                          onClick={() =>
                            !isPastDate(day.date) && selectDate(day.date)
                          }
                        >
                          {day.label}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT CALENDAR */}
          <div className="drp-calendar right">
            <div className="calendar-table">
              <table className="table-condensed">
                <thead>
                  <tr>
                    <th></th>
                    <th colSpan={5} className="month">
                      {getMonthYear(rightMonth)}
                    </th>
                    <th className="next available" onClick={nextMonth}>
                      <span>&gt;</span>
                    </th>
                  </tr>
                  <tr>
                    <th>일</th>
                    <th>월</th>
                    <th>화</th>
                    <th>수</th>
                    <th>목</th>
                    <th>금</th>
                    <th>토</th>
                  </tr>
                </thead>
                <tbody>
                  {rightCalendar.map((week, rowIndex) => (
                    <tr key={`right-${rowIndex}`}>
                      {week.map((day, colIndex) => (
                        <td
                          key={`right-${colIndex}-${rowIndex}`}
                          className={dayClass(day.date, rightMonth.month)}
                          onClick={() =>
                            !isPastDate(day.date) && selectDate(day.date)
                          }
                        >
                          {day.label}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className= "time-picker-wrapper">
        <h6 className="time-picker-title">시간 선택 (30분 단위)</h6>
        {!selectedDate && (
            <p className="time-warning">날짜를 먼저 선택해주세요.</p>
        )}
        <div className="time-grid">
            {displayedTimeOptions.map((time) => (
                <button
                key={time}
                className={`time-slot ${isSelectedTime(time) ? `selected` : ``}`}
                disabled={!selectedDate}
                onClick={() => toggleTime(time)}
                >
                    {time}
                </button>
            ))}
        </div>
        <div className="drp-buttons">
            <span className="drp-selected">{formattedRange}</span>
            <button className="cancelBtn btn btn-sm btn-default" type="button" onClick={useModalStore().closeModal()}>
                취소
            </button>
            <button className="applyBtn btn btn-sm btn-primary" type="button" onClick={handleConfirm}>적용</button>
        </div>
        </div>
    </div>
)
}