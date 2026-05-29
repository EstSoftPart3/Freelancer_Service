<template>
  <div
    class="tab-pane tab-pane-navigation active show"
    id="pointLookup"
    role="tabpanel"
  >
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0 page-title">포인트 조회</h4>
    </div>

    <div class="point-page-wrap">
      <div class="point-card">
        <p class="point-label">보유 포인트</p>

        <h3 class="point-amount">{{ currentPoint.toLocaleString() }} P</h3>
      </div>

      <button
        type="button"
        class="btn btn-primary point-history-btn"
        @click="goPointHistory"
      >
        포인트 내역 보기
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 임시 보유 포인트 데이터
 *
 * 지금은 화면 설계용이므로 프론트에서 직접 값을 넣어둡니다.
 * 나중에 백엔드 API 연결 후에는 이 값을 API 응답값으로 교체하면 됩니다.
 */
const currentPoint = 12500

/**
 * 포인트 내역 페이지로 이동
 */
const goPointHistory = () => {
  router.push('/mypage/points/history')
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #111;
}

.point-page-wrap {
  width: 100%;
  padding-top: 40px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.point-card {
  width: 100%;
  max-width: 900px;
  min-height: 220px;

  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 보유 포인트 텍스트 */
.point-label {
  margin-bottom: 18px;

  font-size: 22px;
  font-weight: 700;
  color: #222;
}

/* 포인트 금액 */
.point-amount {
  margin-bottom: 0;

  font-size: 58px;
  font-weight: 700;
  color: #007bff;
  letter-spacing: 1px;
}

/* 포인트 내역 보기 버튼 */
.point-history-btn {
  width: 360px;
  height: 54px;
  margin-top: 48px;

  font-size: 18px;
  font-weight: 700;
}
</style>
