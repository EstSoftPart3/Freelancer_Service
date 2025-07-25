<template>
  <div class="hello">
    <h1>Freelancer_service</h1>
    <div class="background-container">
      <img alt="Vue logo" src="@/assets/logo.png" />
    </div>
    <h1>임시 메인페이지입니다.</h1>
    <h1><router-link to="/test">공통 컴퍼넌트 바로가기</router-link></h1>
  </div>
</template>

<script setup></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
  background-color: #d3d3d3; /* 회색 배경 */
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0 100px;
}

@media (max-width: 768px) {
  .hello {
    margin: 0 30px;
  }
}
</style>
