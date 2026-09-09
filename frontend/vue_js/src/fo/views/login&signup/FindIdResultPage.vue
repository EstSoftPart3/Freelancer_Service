<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="아이디 찾기"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: 'ID/PW' }]"
    />
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card border-0 shadow-lg">
            <div class="card-header bg-grey text-dark">
              <h5 class="mb-0">아이디 찾기 결과</h5>
            </div>
            <div class="card-body" v-if="userData">
              <div class="table-responsive">
                <table
                  class="table table-bordered table-hover text-center align-middle mb-4"
                >
                  <thead class="table-light">
                    <tr>
                      <th scope="col">구분</th>
                      <th scope="col">아이디</th>
                      <th scope="col">이름</th>
                      <th scope="col">가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ userData.userType }}</td>
                      <td>
                        <a
                          href="#"
                          class="d-flex align-items-center justify-content-center gap-2 text-decoration-none"
                        >
                          <span class="fw-bold">{{ userData.userId }}</span>
                        </a>
                      </td>
                      <td>{{ userData.userNm }}</td>
                      <td>{{ formattedDate }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex justify-content-center gap-3">
                <router-link to="/login" class="btn btn-primary px-4"
                  >로그인</router-link
                >
                <router-link
                  to="/findAccount?tab=resetPassword"
                  class="btn btn-primary btn-outline px-4"
                >
                  비밀번호 찾기
                </router-link>
              </div>
            </div>
            <div v-else class="text-center p-5">
              <p>아이디 찾기 결과가 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'

const route = useRoute()

const userData = ref(null)

if (route.query.output) {
  try {
    userData.value = JSON.parse(decodeURIComponent(route.query.output))
  } catch {
    userData.value = null
  }
}

const formattedDate = computed(() => {
  if (!userData.value || !userData.value.userCreatedAtDtm) return ''
  const date = new Date(userData.value.userCreatedAtDtm)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
})
</script>
