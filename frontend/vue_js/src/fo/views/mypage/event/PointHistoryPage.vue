<template>
  <div
    class="tab-pane tab-pane-navigation active show"
    id="pointHistory"
    role="tabpanel"
  >
    <h4 class="mb-0 page-title">포인트 내역</h4>

    <div class="point-summary-card">
      <span class="point-summary-label">보유 포인트</span>
      <strong class="point-summary-amount">
        {{ currentPoint.toLocaleString() }} P
      </strong>
    </div>

    <div class="history-title-wrap">
      <h5 class="history-title">포인트 내역</h5>
      <span class="history-description"> 최근 3개월 포인트 변동 내역 </span>
    </div>

    <div class="history-table-wrap">
      <table class="table point-history-table">
        <thead>
          <tr>
            <th>일시</th>
            <th>포인트 사유</th>
            <th>구분</th>
            <th>변동 포인트</th>
            <th>잔여 포인트</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="history in pointHistories" :key="history.id">
            <td>{{ history.regDt }}</td>
            <td>{{ history.reason }}</td>
            <td>
              <span
                class="point-type-badge"
                :class="history.type === '적립' ? 'earn' : 'use'"
              >
                {{ history.type }}
              </span>
            </td>
            <td :class="history.changePoint > 0 ? 'point-plus' : 'point-minus'">
              {{ formatChangePoint(history.changePoint) }} P
            </td>
            <td>{{ history.remainingPoint.toLocaleString() }} P</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-wrap">
      <button type="button" class="page-btn">&laquo;</button>
      <button type="button" class="page-btn active">1</button>
      <button type="button" class="page-btn">2</button>
      <button type="button" class="page-btn">3</button>
      <button type="button" class="page-btn">4</button>
      <button type="button" class="page-btn">5</button>
      <button type="button" class="page-btn">&raquo;</button>
    </div>
  </div>
</template>

<script setup>
const currentPoint = 12500

const pointHistories = [
  {
    id: 1,
    regDt: '2026-05-28 10:00',
    reason: '출석체크',
    type: '적립',
    changePoint: 10,
    remainingPoint: 12500,
  },
  {
    id: 2,
    regDt: '2026-05-27 09:45',
    reason: '출석체크',
    type: '적립',
    changePoint: 10,
    remainingPoint: 12490,
  },
  {
    id: 3,
    regDt: '2026-05-26 11:20',
    reason: '출석체크',
    type: '적립',
    changePoint: 10,
    remainingPoint: 12480,
  },
  {
    id: 4,
    regDt: '2026-05-25 14:15',
    reason: '프로젝트 지원',
    type: '사용',
    changePoint: -100,
    remainingPoint: 12470,
  },
  {
    id: 5,
    regDt: '2026-05-24 16:30',
    reason: '출석체크',
    type: '적립',
    changePoint: 10,
    remainingPoint: 12570,
  },
  {
    id: 6,
    regDt: '2026-05-23 13:05',
    reason: '출석체크',
    type: '적립',
    changePoint: 10,
    remainingPoint: 12560,
  },
  {
    id: 7,
    regDt: '2026-05-22 17:40',
    reason: '프로젝트 지원',
    type: '사용',
    changePoint: -100,
    remainingPoint: 12550,
  },
  {
    id: 8,
    regDt: '2026-05-21 09:10',
    reason: '출석체크',
    type: '적립',
    changePoint: 10,
    remainingPoint: 12650,
  },
  {
    id: 9,
    regDt: '2026-05-20 10:25',
    reason: '출석체크',
    type: '적립',
    changePoint: 10,
    remainingPoint: 12640,
  },
  {
    id: 10,
    regDt: '2026-05-19 15:00',
    reason: '프로젝트 지원',
    type: '사용',
    changePoint: -100,
    remainingPoint: 12630,
  },
]

const formatChangePoint = (point) => {
  if (point > 0) {
    return `+${point.toLocaleString()}`
  }

  return point.toLocaleString()
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #111;
}

.point-summary-card {
  width: 100%;
  min-height: 95px;
  margin-top: 28px;
  padding: 0 32px;

  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;

  display: flex;
  align-items: center;
}

.point-summary-label {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-right: 34px;
}

.point-summary-amount {
  font-size: 38px;
  font-weight: 700;
  color: #0069d9;
  letter-spacing: 2px;
}

.history-title-wrap {
  margin-top: 36px;
  margin-bottom: 16px;

  display: flex;
  align-items: center;
}

.history-title {
  margin-bottom: 0;
  margin-right: 28px;

  font-size: 22px;
  font-weight: 700;
  color: #111;
}

.history-description {
  font-size: 14px;
  color: #777;
}

.history-table-wrap {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
}

.point-history-table {
  width: 100%;
  margin-bottom: 0;
  table-layout: fixed;
}

.point-history-table thead th {
  height: 52px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #ddd;

  text-align: center;
  vertical-align: middle;

  font-size: 15px;
  font-weight: 700;
  color: #222;
}

.point-history-table tbody td {
  height: 54px;
  border-bottom: 1px solid #eee;

  text-align: center;
  vertical-align: middle;

  font-size: 15px;
  color: #222;
}

.point-history-table tbody tr:last-child td {
  border-bottom: none;
}

.point-type-badge {
  display: inline-block;
  min-width: 42px;
  padding: 5px 10px;

  border-radius: 4px;

  font-size: 14px;
  font-weight: 700;
}

.point-type-badge.earn {
  color: #0069d9;
  background-color: #eaf3ff;
}

.point-type-badge.use {
  color: #e60012;
  background-color: #ffecec;
}

.point-plus {
  color: #0069d9 !important;
  font-weight: 700;
}

.point-minus {
  color: #e60012 !important;
  font-weight: 700;
}

.pagination-wrap {
  margin-top: 18px;

  display: flex;
  justify-content: center;
  gap: 8px;
}

.page-btn {
  min-width: 38px;
  height: 38px;

  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;

  font-size: 15px;
  color: #333;

  cursor: pointer;
}

.page-btn.active {
  background-color: #0069d9;
  border-color: #0069d9;
  color: #fff;
  font-weight: 700;
}

.page-btn:hover {
  border-color: #0069d9;
}
</style>
