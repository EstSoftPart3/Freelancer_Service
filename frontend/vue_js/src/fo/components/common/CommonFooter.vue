<template>
  <footer id="footer" class="footer-top-border bg-color-grey">
    <div class="footer-copyright bg-color-grey">
      <div class="container py-2">
        <div class="row py-4">
          <div class="col-12 d-flex justify-content-between align-items-center">
            <p class="mb-0">
              <strong>이에스티 소프트</strong> 
            </p>
            <p class="mb-0 text-end">
              <router-link to="/privacy">개인정보 처리 방침</router-link> |
              <router-link to="/terms">이용약관</router-link>
              <span class="ms-2">- © Copyright 2024. All Rights Reserved.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
/* .footer-copyright p,
.footer-copyright strong {
  font-size: 1.03rem;
}

.footer-copyright a {
  font-size: 1.05rem;
} */

</style>
