<template>
  <div class="notify-setting-wrap">
    <h2 class="page-title">알림 설정</h2>

    <!-- 상태 -->
    <div v-if="loading" class="status-text">불러오는 중...</div>
    <div v-else-if="error" class="status-text error">{{ error }}</div>

    <div v-else class="card">
      <div class="table">
        <div class="thead">
          <div class="th type">알림 유형</div>
          <div class="th desc">설명</div>
          <div class="th toggle">수신 여부</div>
        </div>

        <div class="tbody">
          <div class="tr">
            <div class="td type"><b>프로젝트 알림</b></div>
            <div class="td desc">지원한 프로젝트의 상태 변경, 마감 임박 등</div>
            <div class="td toggle">
              <label class="switch">
                <input type="checkbox" v-model="toggles.project" />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="tr">
            <div class="td type"><b>댓글 알림</b></div>
            <div class="td desc">내가 작성한 글/댓글에 새로운 댓글이 등록될 때</div>
            <div class="td toggle">
              <label class="switch">
                <input type="checkbox" v-model="toggles.comment" />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="tr">
            <div class="td type"><b>지원결과 알림</b></div>
            <div class="td desc">지원한 프로젝트의 합격/불합격 결과</div>
            <div class="td toggle">
              <label class="switch">
                <input type="checkbox" v-model="toggles.result" />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="tr">
            <div class="td type"><b>기타/시스템 알림</b></div>
            <div class="td desc">서비스 공지, 이벤트 등 기타 시스템 알림</div>
            <div class="td toggle">
              <label class="switch">
                <input type="checkbox" v-model="toggles.system" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn primary" :disabled="saving" @click="onSave">
          {{ saving ? "저장 중..." : "설정 저장" }}
        </button>
        <button class="btn" :disabled="saving" @click="onReset">
          {{ saving ? "처리 중..." : "기본값으로 초기화" }}
        </button>
      </div>   
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "@/axios"; // ✅ 프로젝트 공통 axios 래퍼

const loading = ref(true);
const saving = ref(false);
const error = ref("");

/**
 * 서버 응답 구조 예시:
 * ApiResponse: { status, message, output: { userSq, projectAlarmYn, commentAlarmYn, resultAlarmYn, systemAlarmYn } }
 * 또는 output만 반환하는 경우도 있어서 res.output ?? res 로 처리
 */
const setting = ref({
  projectAlarmYn: "Y",
  commentAlarmYn: "Y",
  resultAlarmYn: "Y",
  systemAlarmYn: "Y",
});

const toggles = ref({
  project: true,
  comment: true,
  result: true,
  system: true,
});

const ynToBool = (v) => String(v || "").toUpperCase() === "Y";
const boolToYn = (v) => (v ? "Y" : "N");

const applyFromServer = (output) => {
  setting.value = {
    projectAlarmYn: output?.projectAlarmYn ?? "",
    commentAlarmYn: output?.commentAlarmYn ?? "",
    resultAlarmYn: output?.resultAlarmYn ?? "",
    systemAlarmYn: output?.systemAlarmYn ?? "",
  };

  toggles.value = {
    project: ynToBool(setting.value.projectAlarmYn),
    comment: ynToBool(setting.value.commentAlarmYn),
    result: ynToBool(setting.value.resultAlarmYn),
    system: ynToBool(setting.value.systemAlarmYn),
  };

  // 디버깅 로그 (원하면 지워도 됨)
  console.log("알림 설정 응답:", output);
};

const fetchSetting = async () => {
  loading.value = true;
  error.value = "";
  try {
    // ✅ NotificationPage.vue 규칙: api.$get 사용
    const res = await api.$get("/notifications/setting");
    const output = res?.output ?? res;
    applyFromServer(output);
  } catch (e) {
    console.error("[NotificationSetting] fetchSetting error:", e);
    error.value = "알림 설정 조회 실패 (콘솔/네트워크 확인)";
  } finally {
    loading.value = false;
  }
};

const onSave = async () => {
  saving.value = true;
  error.value = "";
  try {
    const payload = {
      projectAlarmYn: boolToYn(toggles.value.project),
      commentAlarmYn: boolToYn(toggles.value.comment),
      resultAlarmYn: boolToYn(toggles.value.result),
      systemAlarmYn: boolToYn(toggles.value.system),
    };

    // ✅ PATCH 연동
    const res = await api.$patch("/notifications/setting", payload);
    const output = res?.output ?? res;

    // 서버가 변경값을 내려주면 그대로 동기화
    if (output) applyFromServer(output);

    alert("알림 설정이 저장되었습니다.");
  } catch (e) {
    console.error("[NotificationSetting] save error:", e);
    error.value = "저장 실패 (콘솔/네트워크 확인)";
  } finally {
    saving.value = false;
  }
};

const onReset = async () => {
  if (!confirm("기본값으로 초기화할까요?")) return;

  saving.value = true;
  error.value = "";
  try {
    // ✅ POST 초기화 (서버 라우트가 다르면 여기 URL만 수정하면 됨)
    const res = await api.$post("/notifications/setting/reset");
    const output = res?.output ?? res;

    if (output) {
      applyFromServer(output);
    } else {
      // 혹시 응답이 없으면 UI 기본값으로라도 세팅
      toggles.value = { project: true, comment: true, result: true, system: true };
      setting.value = { projectAlarmYn: "Y", commentAlarmYn: "Y", resultAlarmYn: "Y", systemAlarmYn: "Y" };
    }

    alert("기본값으로 초기화되었습니다.");
  } catch (e) {
    console.error("[NotificationSetting] reset error:", e);
    error.value = "초기화 실패 (콘솔/네트워크 확인)";
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchSetting();
});
</script>

<style scoped>
.notify-setting-wrap {
  padding: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 18px;
}

.status-text {
  margin-top: 12px;
  font-size: 14px;
  color: #444;
}
.status-text.error {
  color: #d33;
}

.card {
  border: 1px solid #e7e7e7;
  border-radius: 10px;
  padding: 18px;
  background: #fff;
}

.table {
  width: 100%;
}

.thead,
.tr {
  display: grid;
  grid-template-columns: 180px 1fr 140px;
  align-items: center;
}

.thead {
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 8px;
  font-weight: 700;
  color: #444;
  font-size: 13px;
}

.tbody .tr {
  padding: 14px;
  border-bottom: 1px solid #f0f0f0;
}
.tbody .tr:last-child {
  border-bottom: none;
}

.td {
  font-size: 14px;
  color: #333;
}
.td.desc {
  color: #666;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn.primary {
  border-color: #2d6cdf;
  background: #2d6cdf;
  color: #fff;
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  color: #777;
}

/* 토글 스위치 */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #d7d7d7;
  transition: 0.2s;
  border-radius: 999px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  top: 2px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}
.switch input:checked + .slider {
  background-color: #2d6cdf;
}
.switch input:checked + .slider:before {
  transform: translateX(22px);
}
</style>
