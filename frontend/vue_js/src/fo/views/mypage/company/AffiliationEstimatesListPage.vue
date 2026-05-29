<template>
  <div>
    <!--제목-->
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">견적 의뢰서</h4>
      </div>
    </div>

    <!--  신청월 기준 검색 -->
    <div class="row">
      <div
        class="col-12 d-flex justify-content-end align-items-center gap-3 mb-4"
      >
        <label class="form-label text-2 font-weight-bold text-dark mb-0"
          >신청월</label
        >
        <div class="input-group" style="width: 170px">
          <span class="input-group-text border-color-quaternary bg-light">
            <i class="fas fa-calendar-alt text-color-primary"></i>
          </span>
          <input
            type="month"
            class="form-control border-color-quaternary"
            value="2026-05"
          />
        </div>
        <!-- 검색 버튼 -->
        <button class="btn btn-primary btn-sm">검색</button>
      </div>
    </div>

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
          <th>의뢰신청날짜</th>
          <th>관리자승인상태</th>
          <th>상세보기</th>
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
          <td>
            <router-link
              to="estimates/1"
              class="btn btn-light btn-px-2 btn-py-1 text-1 font-weight-bold border"
              >보기</router-link
            >
          </td>
        </tr>
        <tr>
          <td>2</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>
            <router-link
              to="estimates/2"
              class="btn btn-light btn-px-2 btn-py-1 text-1 font-weight-bold border"
              >보기</router-link
            >
          </td>
        </tr>
        <tr>
          <td>3</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>ex</td>
          <td>
            <router-link
              to="estimates/3"
              class="btn btn-light btn-px-2 btn-py-1 text-1 font-weight-bold border"
              >보기</router-link
            >
          </td>
        </tr>
      </tbody>
    </table>

    <!--  하단 페이징  -->
    <!-- 페이징 -->
    <div class="mt-5 py-5">
      <ul class="pagination float-end">
        <li class="page-item">
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(currentPage - 1)"
          >
            <i class="fas fa-angle-left"></i>
          </a>
        </li>
        <li
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: currentPage === page }"
        >
          <a class="page-link" href="#" @click.prevent="changePage(page)">{{
            page
          }}</a>
        </li>
        <li class="page-item">
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(currentPage + 1)"
          >
            <i class="fas fa-angle-right"></i>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup></script>
