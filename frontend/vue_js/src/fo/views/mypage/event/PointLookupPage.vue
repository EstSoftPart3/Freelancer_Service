<template>
  <div
    class="tab-pane tab-pane-navigation active show"
    id="pointLookup"
    role="tabpanel"
  >
    <h4 class="mb-0 page-title">포인트 조회</h4>

    <div class="point-summary-card">
      <span class="point-summary-label">보유 포인트</span>
      <strong class="point-summary-amount">
        {{ currentPoint.toLocaleString() }} P
      </strong>
    </div>

    <div class="history-title-wrap">
      <h5 class="history-title">포인트 내역</h5>
      <span class="history-description">포인트 변동 내역</span>
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
          <tr v-if="pointHistories.length === 0">
            <td colspan="5" class="empty-history">포인트 내역이 없습니다.</td>
          </tr>

          <tr v-for="history in pointHistories" :key="history.id">
            <td>{{ formatRegDt(history.regDt) }}</td>
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '@/axios'

const currentPoint = ref(0)
const pointHistories = ref([])

const fetchCurrentPoint = async () => {
  try {
    const response = await api.$get('/mypage/points')

    currentPoint.value = response.currentPoint ?? 0
  } catch (error) {
    console.error('보유 포인트 조회 실패:', error)
    currentPoint.value = 0
  }
}

const fetchPointHistories = async () => {
  try {
    const response = await api.$get('/mypage/points/history')

    pointHistories.value = (response ?? []).map((history, index) => ({
      id: index,
      regDt: history.regDt,
      reason: history.pointRsn,
      type: formatPointType(history.pointTp),
      changePoint:
        history.pointTp === 'EARN' ? history.chgPoint : -history.chgPoint,
      remainingPoint: history.remPoint,
    }))
  } catch (error) {
    console.error('포인트 이력 조회 실패:', error)
    pointHistories.value = []
  }
}

onMounted(() => {
  fetchCurrentPoint()
  fetchPointHistories()
})

const formatRegDt = (regDt) => {
  if (!regDt) {
    return '-'
  }

  return regDt.replace('T', ' ').slice(0, 16)
}

const formatPointType = (pointTp) => {
  if (pointTp === 'EARN') {
    return '적립'
  }

  if (pointTp === 'USE') {
    return '사용'
  }

  if (pointTp === 'DEDUCT') {
    return '차감'
  }

  return pointTp
}

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

.empty-history {
  height: 80px;
  color: #777;
  font-size: 15px;
  text-align: center;
  vertical-align: middle;
}
</style>
