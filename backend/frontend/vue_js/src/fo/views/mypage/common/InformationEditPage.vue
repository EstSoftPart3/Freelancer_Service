<template>
  <div>
    <Personal v-if="userType === 'PERSONAL'" />
    <Company v-else-if="userType === 'COMPANY'" />
    <div v-else>유효하지 않은 사용자 유형입니다.</div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/fo/stores/userStore'
import { computed } from 'vue'
import Personal from '@/fo/components/mypage/personal/InformationEdit.vue'
import Company from '@/fo/components/mypage/company/InformationEdit.vue'

const userStore = useUserStore()
const userType = computed(() => userStore.userType)
</script>

<style>
/* 프로필 이미지 스타일 */
.rounded-circle {
  width: 120px;
  height: 120px;
  background-color: #f2f2f2;
  display: flex;
  justify-content: center;
  align-items: center;
}
.fas.fa-building.text-muted {
  font-size: 50px;
}

.fas.fa-user.text-muted {
  font-size: 50px;
}

input:focus {
  outline: none;
  box-shadow: none;
  border-color: inherit; /* 또는 원래의 border 색 */
}

.add {
  cursor: pointer;
  z-index: 10;
  border-radius: 50%;
  padding: 10px;
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  bottom: -10px;
  right: -10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add:hover {
  cursor: pointer;
}
#profileImage:hover {
  cursor: pointer;
}

input[type='file']:hover {
  cursor: pointer !important;
}
.add i {
  pointer-events: none; /* 아이콘이 클릭 방해 안 하게 */
}
#file-upload-button:hover {
  cursor: pointer;
}

.fas.fa-camera.text-muted {
  font-size: 20px;
}

/* 폼 그룹 스타일 */
.form-group.row.align-items-center {
  margin-bottom: 20px;
}

.form-group label {
  font-size: 16px;
}

.form-control {
  font-size: 16px;
}

.form-check {
  display: inline-block;
  margin-right: 15px;
}

.form-check-input {
  margin-right: 5px;
}

/* 수정 버튼 */
.btn-light.btn-outline {
  font-size: 14px;
}

/* 하단 버튼 */
.btn-modern {
  font-weight: 500;
}

.btn.btn-light {
  border-color: #d9d9d9;
}

.invalid-feedback {
  color: #007bff;
  display: block;
}
</style>
