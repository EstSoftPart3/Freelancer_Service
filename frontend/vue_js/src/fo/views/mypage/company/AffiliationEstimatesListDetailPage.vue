<template>
  <div>
    <!--제목-->
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">견적 의뢰서 상세페이지</h4>
      </div>
    </div>
    <router-link to="/mypage/estimates" class="btn btn-primary btn-sm"
      >목록으로</router-link
    >
    <hr />
    <!--테이블조회-->
    <table class="table">
      <thead>
        <tr>
          <th>견적의뢰 번호</th>
          <th>프로젝트 분야</th>
          <th>모집형태</th>
          <th>진행상황</th>
          <th>예산범위</th>
          <th>예상시작날짜</th>
          <th>예상종료날짜</th>
          <th>참고서비스URL</th>
          <th>관리자승인상태</th>
          <th>의뢰신청날짜</th>
          <th>의뢰수정날짜</th>
          <th>삭제여부</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup></script>
