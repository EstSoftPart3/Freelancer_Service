<template>
  <div class="hello">
    <h1>Freelancer_service</h1>
    <div class="background-container">
      <img alt="Vue logo" src="@/assets/logo.png" />
    </div>
    <h1>임시 메인페이지입니다.</h1>
    <div class="navigation-links">
      <h2><router-link to="/test">공통 컴퍼넌트 바로가기</router-link></h2>
      <h2><router-link to="/map/search" class="map-link">🗺️ 지도에서 프로젝트 찾기</router-link></h2>
    </div>
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

.navigation-links {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.navigation-links h2 {
  margin: 0;
}

.navigation-links a {
  color: #007bff;
  text-decoration: none;
  font-size: 1.2rem;
  padding: 10px 20px;
  border: 2px solid #007bff;
  border-radius: 8px;
  transition: all 0.3s;
  display: inline-block;
}

.navigation-links a:hover {
  background-color: #007bff;
  color: white;
}

.map-link {
  color: #28a745 !important;
  border-color: #28a745 !important;
}

.map-link:hover {
  background-color: #28a745 !important;
}

@media (max-width: 768px) {
  .hello {
    margin: 0 30px;
  }
}
</style>
