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
              <p class="text-center mb-3">구글 계정으로 로그인</p>
              <div class="d-flex justify-content-center gap-3">
                <button
                  v-for="provider in socialProviders"
                  :key="provider.name"
                  class="btn btn-icon rounded-circle border"
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
import { useRoute } from 'vue-router'
import { useModalStore } from '@/fo/stores/modalStore'
import SocialIntegrationModal from '@/fo/components/login&signup/SocialIntegrationModal.vue'
import { useSocialStore } from '@/fo/stores/socialStore'

const route = useRoute()
const alertStore = useAlertStore()
const modalStore = useModalStore()
const socialStore = useSocialStore()

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
    const token = response.output.token
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
    console.log('data', data)

    // 로컬스토리지 저장
    localStorage.setItem('userNm', data.userNm)
    localStorage.setItem('userTypeCd', data.userTypeCd)

    // Pinia 상태 저장
    userStore.setUser({
      userNm: data.userNm,
      userTypeCd: data.userTypeCd,
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
  const savedType = localStorage.getItem('savedLoginType')
  if (savedType) {
    loginType.value = savedType
  }
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
  loadSavedId()

  const { status, email, userNm, socialId } = route.query

  if (status) {
    socialStore.setTempUser({ email, userNm, socialId })

    if (status === 'NEW') {
      alertStore.show(
        '신규 회원으로 판별되어 추가 정보 기입 페이지로 이동합니다.',
        'info',
      )
      router.push('/socialSignUp')
    } else if (status === 'INTEGRATION') {
      router.replace({ query: {} })
      modalStore.openModal(SocialIntegrationModal, {
        email: socialStore.tempUser.email,
        socialId: socialStore.tempUser.socialId,
      })
    } else if (status === 'SUCCESS') {
      alertStore.show(`${userNm}님, 환영합니다!`, 'success')
      router.push('/')
    }
  }
})

// loginType 변경 시 저장된 아이디 변경 반영
watch(loginType, () => {
  if (loginType.value === 'PERSONAL') {
    form.value.id = localStorage.getItem('savedPersonalId') || ''
  } else {
    form.value.cid = localStorage.getItem('savedCompanyId') || ''
  }
})

const socialProviders = [
  {
    name: 'google',
    title: '구글 로그인',
    img: '/img/social/google.png',
  },
]

// 기존 코드
const handleSocialLogin = (provider) => {
  if (provider === 'google') {
    const client_id =
      '861271781628-76v5ct3i1qm07u5fgksg0l9in6vkqlfu.apps.googleusercontent.com'
    // 1. 현재 접속한 프로토콜(http/https)과 호스트(localhost 혹은 AWS IP)를 가져옵니다.
    // window.location.hostname은 포트 번호를 제외한 주소만 가져옵니다. (예: localhost 또는 3.3.xx.xx)
    const host = window.location.hostname

    // 2. 백엔드 포트는 8080으로 고정이므로 주소를 조합합니다.
    const redirect_uri = `http://${host}:8080/api/login/oauth2/code/google`
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=email profile&prompt=select_account`
  }
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
