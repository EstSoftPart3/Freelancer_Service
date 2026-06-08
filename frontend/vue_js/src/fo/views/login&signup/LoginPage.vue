<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="회원 로그인"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: 'Login' }]"
    />
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-4">
              <!-- 회원 유형 토글 버튼 -->
              <div class="btn-group w-100 mb-4" role="group">
                <button
                  class="btn w-50"
                  :class="
                    loginType === 'PERSONAL'
                      ? 'btn-primary'
                      : 'btn-outline btn-primary'
                  "
                  @click="loginType = 'PERSONAL'"
                >
                  개인회원
                </button>
                <button
                  class="btn w-50"
                  :class="
                    loginType === 'COMPANY'
                      ? 'btn-primary'
                      : 'btn-outline btn-primary'
                  "
                  @click="loginType = 'COMPANY'"
                >
                  기업회원
                </button>
              </div>

              <!-- 로그인 폼 -->
              <form @submit.prevent="login">
                <input
                  type="hidden"
                  :value="loginType === 'PERSONAL' ? 'p' : 'c'"
                  name="login_tab"
                />

                <!-- ID 입력 -->
                <div class="mb-3">
                  <label for="id" class="form-label">아이디</label>
                  <input
                    v-if="loginType === 'PERSONAL'"
                    v-model="form.id"
                    type="text"
                    class="form-control"
                    id="id"
                    required
                  />
                  <input
                    v-else
                    v-model="form.cid"
                    type="text"
                    class="form-control"
                    id="cid"
                    required
                  />
                </div>

                <!-- 비밀번호 입력 -->
                <div class="mb-3">
                  <label for="password" class="form-label">비밀번호</label>
                  <input
                    v-if="loginType === 'PERSONAL'"
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    id="password"
                    maxlength="32"
                    required
                  />
                  <input
                    v-else
                    v-model="form.cpassword"
                    type="password"
                    class="form-control"
                    id="cpassword"
                    maxlength="32"
                    required
                  />
                </div>

                <div class="form-check mb-2">
                  <input
                    v-model="form.autologin"
                    type="checkbox"
                    class="form-check-input"
                    :id="'autologin_' + loginType"
                  />
                  <label
                    class="form-check-label"
                    :for="'autologin_' + loginType"
                    >로그인 유지</label
                  >
                </div>

                <div class="form-check mb-4">
                  <input
                    v-model="form.id_save"
                    type="checkbox"
                    class="form-check-input"
                    :id="'id_save_' + loginType"
                  />
                  <label class="form-check-label" :for="'id_save_' + loginType"
                    >아이디 저장</label
                  >
                </div>

                <div class="d-grid mb-3">
                  <button type="submit" class="btn btn-primary btn-block">
                    로그인
                  </button>
                </div>

                <div class="d-flex justify-content-between mb-4">
                  <router-link
                    :to="{
                      path: '/signUp',
                      query: { loginType },
                    }"
                  >
                    회원가입
                  </router-link>

                  <a href="/findAccount">아이디/비밀번호 찾기</a>
                </div>
              </form>

              <!-- 소셜 로그인 -->
              <hr class="my-4" />
              <p class="text-center mb-3">소셜 계정으로 로그인</p>
              <div class="d-flex justify-content-center gap-3">
                <button
                  v-for="provider in socialProviders"
                  :key="provider.name"
                  class="btn btn-icon rounded-circle border-0 bg-white"
                  :title="provider.title"
                  @click="handleSocialLogin(provider.name)"
                >
                  <img
                    :src="provider.img"
                    alt=""
                    class="w-100 h-100 object-fit-cover rounded-circle"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { ref, onMounted, watch } from 'vue'
import { api } from '@/axios'
import { useUserStore } from '@/fo/stores/userStore'
import router from '@/fo/router'
import { useAlertStore } from '@/fo/stores/alertStore'

const alertStore = useAlertStore()

const loginType = ref('PERSONAL')
const form = ref({
  id: '',
  password: '',
  cid: '',
  cpassword: '',
  autologin: false,
  id_save: false,
})

const userStore = useUserStore()

const login = async () => {
  const type = loginType.value
  const userTypeCd = type === 'PERSONAL' ? 301 : 302

  const id = type === 'PERSONAL' ? form.value.id : form.value.cid
  const pw = type === 'PERSONAL' ? form.value.password : form.value.cpassword

  const payload = {
    userId: id,
    userPw: pw,
    userTypeCd,
    autoLogin: form.value.autologin,
  }
  // console.log('payload', payload)

  try {
    const response = await api.$post('/login', payload)
    const token = response.output
    if (token && token.accessToken && token.refreshToken) {
      localStorage.setItem('accessToken', token.accessToken)
      localStorage.setItem('refreshToken', token.refreshToken)
    } else {
      throw new Error('토큰 정보가 응답에 포함되지 않았습니다.')
    }

    await fetchUserInfo()

    // 아이디 저장
    if (form.value.id_save) {
      if (type === 'PERSONAL') {
        localStorage.setItem('savedPersonalId', form.value.id)
      } else {
        localStorage.setItem('savedCompanyId', form.value.cid)
      }
      localStorage.setItem('savedLoginType', loginType.value)
    } else {
      localStorage.removeItem('savedPersonalId')
      localStorage.removeItem('savedCompanyId')
      localStorage.removeItem('savedLoginType')
    }

    // **자동 로그인 저장 (여기 수정)**
    if (form.value.autologin) {
      localStorage.setItem('autoLogin', 'true')
    } else {
      localStorage.removeItem('autoLogin')
    }

    alertStore.show(userStore.userNm + '님 안녕하세요.', 'success')

    router.push('/') // 메인 페이지로 이동
  } catch (error) {
    console.error(error)
    alertStore.show(error.response?.data?.message || error.message, 'danger')
  }
}

const fetchUserInfo = async () => {
  try {
    const res = await api.$post('/me')
    const data = res.output
    // console.log('data', data)

    // Pinia 상태 저장
    userStore.setUser({
      userSq: data.userSq,
      userNm: data.userNm,
      userTypeCd: data.userTypeCd,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      isAffiliated: data.isAffiliated,
      affiliatedCompanySq: data.affiliatedCompanySq,
      companyAuthStatusCd: data.companyAuthStatusCd,
      userSignupTypeCd: data.userSignupTypeCd,
    })
  } catch (error) {
    console.error('유저 정보 불러오기 실패:', error)
    alertStore.show(
      '로그인 정보가 만료되었습니다. 다시 로그인 해주세요.',
      'danger',
    )
    router.push('/login')
  }
}

// 저장된 아이디를 form에 세팅하는 함수
const loadSavedId = () => {
  if (loginType.value === 'PERSONAL') {
    form.value.id = localStorage.getItem('savedPersonalId') || ''
    form.value.id_save = !!localStorage.getItem('savedPersonalId')
  } else {
    form.value.cid = localStorage.getItem('savedCompanyId') || ''
    form.value.id_save = !!localStorage.getItem('savedCompanyId')
  }

  // 자동 로그인 여부도 로드해서 체크박스 초기화
  form.value.autologin = localStorage.getItem('autoLogin') === 'true'
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
  const savedType = localStorage.getItem('loginType')
  if (savedType === 'PERSONAL' || savedType === 'COMPANY') {
    loginType.value = savedType
  }
  loadSavedId()
})

// loginType 변경 시 localStorage 저장 및 저장된 아이디 반영
watch(loginType, (newType) => {
  localStorage.setItem('loginType', newType)
  if (newType === 'PERSONAL') {
    form.value.id = localStorage.getItem('savedPersonalId') || ''
    form.value.id_save = !!localStorage.getItem('savedPersonalId')
  } else {
    form.value.cid = localStorage.getItem('savedCompanyId') || ''
    form.value.id_save = !!localStorage.getItem('savedCompanyId')
  }
})

const socialProviders = [
  {
    name: 'kakao',
    title: '카카오 로그인',
    img: '/img/social/kakao.png',
  },
  {
    name: 'naver',
    title: '네이버 로그인',
    img: '/img/social/naver.png',
  },
  {
    name: 'google',
    title: '구글 로그인',
    img: '/img/social/google.png',
  },
  {
    name: 'apple',
    title: '애플 로그인',
    img: '/img/social/apple.png',
  },
]

const handleSocialLogin = (provider) => {
  // 환경변수에 등록된 백엔드를 먼저가져오며, 없으면 로컬 사용
  const baseUrl =
    process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080/api/'
  window.location.href = `${baseUrl}/oauth2/authorization/${provider}`
}
</script>

<style scoped>
.btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
}

.btn-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border: none;
}
</style>
