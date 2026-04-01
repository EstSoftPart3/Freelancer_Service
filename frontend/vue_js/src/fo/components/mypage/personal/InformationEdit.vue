<template>
  <section>
    <PasswordCheck v-if="!isConfirmed" @confirmed="isConfirmed = true">
      <h4 class="mb-3" style="font-size: 24px">회원 정보 수정</h4>
    </PasswordCheck>
    <div v-else>
      <div class="overflow-hidden mb-3">
        <h4 class="mb-3" style="font-size: 24px">회원 정보 수정</h4>
      </div>

      <!-- 프로필 이미지 (사람 아이콘 또는 URL 이미지) -->
      <div class="text-center mb-4">
        <div
          class="position-relative d-inline-block"
          @mouseenter="hovering = true"
          @mouseleave="hovering = false"
        >
          <!-- 프로필 이미지 영역 -->
          <div
            class="rounded-circle overflow-hidden"
            style="width: 100px; height: 100px"
          >
            <img
              v-if="userProfileImageUrl"
              :src="userProfileImageUrl"
              alt="Profile Image"
              class="img-fluid w-100 h-100 object-fit-cover"
            />
            <div v-else class="rounded-circle">
              <i class="fas fa-user text-muted fa-2x"></i>
            </div>

            <!-- X 버튼 (hover 시에만 표시) -->
          </div>
          <button
            v-if="userProfileImageUrl && hovering"
            class="position-absolute"
            style="top: 0; right: 0; z-index: 10"
            @click="removeProfileImage"
          >
            &times;
          </button>

          <!-- 사진 변경 버튼 -->
          <label
            for="profileImage"
            class="btn btn-light btn-sm position-absolute add"
          >
            <i class="fas fa-camera text-muted"></i>
            <!-- 파일 입력 -->
            <input
              ref="profileImageInput"
              type="file"
              id="profileImage"
              class="position-absolute top-0 start-0 w-100 h-100 opacity-0"
              title="사진 변경"
              @change="onFileChange"
              accept="image/*"
            />
          </label>
        </div>
      </div>

      <form
        role="form"
        class="needs-validation"
        novalidate="novalidate"
        @submit.prevent="saveAll"
        @keydown.enter.prevent
      >
        <!-- 아이디 (변경 불가) -->
        <div class="form-group row align-items-center">
          <label class="col-lg-2 col-form-label text-2">아이디</label>
          <div class="col-lg-10">
            <input
              class="form-control text-3 h-auto py-2 border-0"
              type="text"
              name="username"
              :value="form.userId"
              readonly
            />
          </div>
        </div>

        <!-- 비밀번호 + 수정 버튼 -->
        <div class="form-group row align-items-center">
          <label class="col-lg-2 col-form-label text-2">비밀번호</label>
          <div class="col-lg-7">
            <template v-if="!editing.userPw">
              <input
                class="form-control text-3 h-auto py-2"
                type="password"
                name="password"
                readonly
                value="********"
              />
            </template>
            <template v-else>
              <input
                class="form-control text-3 h-auto py-2"
                type="password"
                name="password"
                placeholder="새 비밀번호"
                :value="form.userPw"
                @input="onPasswordInput"
              />
              <input
                class="form-control text-3 h-auto py-2 mt-2"
                type="password"
                name="repeatPassword"
                placeholder="비밀번호 확인"
                v-model="repeatPassword"
                @input="validateRepeatPassword"
              />
              <div v-if="passwordError" class="invalid-feedback d-block">
                {{ passwordError }}
              </div>
            </template>
          </div>
          <div class="col-lg-3 text-end">
            <template v-if="!editing.userPw">
              <button
                type="button"
                class="btn btn-light btn-outline"
                @click="toggleEdit('userPw')"
              >
                수정
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="btn btn-primary btn-outline me-2"
                @click="saveField('userPw')"
                :disabled="!passwordValid || !repeatPasswordValid"
              >
                확인
              </button>
              <button
                type="button"
                class="btn btn-light btn-outline"
                @click="cancelEdit('userPw')"
              >
                취소
              </button>
            </template>
          </div>
        </div>

        <!-- 이름 (변경 불가) -->
        <div class="form-group row align-items-center">
          <label class="col-lg-2 col-form-label text-2">이름</label>
          <div class="col-lg-10">
            <input
              class="form-control text-3 h-auto py-2 border-0"
              type="text"
              name="name"
              v-model="form.userNm"
              readonly
            />
          </div>
        </div>

        <!-- 생년월일 + 수정 버튼 (변경 불가) -->
        <div class="form-group row align-items-center">
          <label class="col-lg-2 col-form-label text-2">생년월일</label>
          <div class="col-lg-7">
            <input
              class="form-control text-3 h-auto py-2 border-0"
              type="date"
              name="dob"
              readonly
              v-model="form.userBirthDt"
            />
          </div>
        </div>

        <!-- 성별 -->
        <div class="form-group row align-items-center">
          <label class="col-lg-2 col-form-label text-2">성별</label>
          <div class="col-lg-7">
            <input
              class="form-control text-3 h-auto py-2 border-0"
              name="gender"
              value="남성"
              v-model="form.userGenderNm"
              readonly
            />
          </div>
        </div>

        <!-- 이메일 + 수정 버튼 -->
        <div class="form-group row align-items-center">
          <label class="col-lg-2 col-form-label text-2">이메일</label>

          <!-- 수정 모드 아닐 때 -->
          <div class="col-lg-7" v-if="!editing.userEmail">
            <input
              class="form-control text-3 h-auto py-2 border-0"
              type="email"
              name="email"
              :readonly="true"
              v-model="form.userEmail"
            />
          </div>

          <!-- 수정 모드일 때 -->
          <div class="col-lg-7" v-else>
            <div class="input-group">
              <input
                type="text"
                v-model="editEmail.emailId"
                class="form-control"
                placeholder="이메일 아이디"
              />
              <span class="input-group-text">@</span>
              <input
                type="text"
                v-model="editEmail.emailDomain"
                list="domain-list"
                class="form-control"
                placeholder="도메인 입력 또는 선택"
              />

              <datalist id="domain-list">
                <option value="naver.com"></option>
                <option value="gmail.com"></option>
                <option value="daum.net"></option>
                <option value="nate.com"></option>
                <option value="hotmail.com"></option>
              </datalist>
              <button
                type="button"
                class="btn btn-primary"
                @click="sendVerification"
              >
                인증 요청
              </button>
            </div>
            <div v-if="emailError" class="invalid-feedback d-block">
              {{ emailError }}
            </div>
          </div>

          <!-- 오른쪽 버튼 영역 -->
          <div class="col-lg-3 text-end">
            <template v-if="!editing.userEmail">
              <button
                type="button"
                class="btn btn-light btn-outline"
                @click="toggleEdit('userEmail')"
              >
                수정
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="btn btn-primary btn-outline me-2"
                @click="saveField('userEmail')"
                :disabled="!isVerified"
              >
                확인
              </button>
              <button
                type="button"
                class="btn btn-light btn-outline"
                @click="cancelEdit('userEmail')"
              >
                취소
              </button>
            </template>
          </div>
        </div>

        <!-- 인증번호 입력 영역 (수정 모드일 때만 표시) -->
        <div v-if="editing.userEmail" class="row mt-2">
          <div class="col-lg-5"></div>
          <div class="form-group col-lg-4">
            <div class="input-group text-end">
              <label class="form-label d-flex align-items-center">
                <i
                  v-if="isVerified"
                  class="bi bi-check-circle-fill me-1"
                  style="color: #007bff"
                ></i
              ></label>
              <input
                type="text"
                v-model="editEmail.verificationCode"
                class="form-control"
                placeholder="인증번호 입력"
              />
              <div v-if="verifycodeError" class="invalid-feedback d-block">
                {{ verifycodeError }}
              </div>
              <button type="button" class="btn btn-primary" @click="verifyCode">
                확인
              </button>
            </div>
          </div>
        </div>

        <!-- 휴대폰번호 + 수정 버튼 -->
        <div class="form-group row align-items-center">
          <label class="col-lg-2 col-form-label text-2">휴대폰번호</label>
          <div class="col-lg-7">
            <template v-if="!editing.userPhoneNum">
              <input
                class="form-control text-3 h-auto py-2"
                type="text"
                name="phone"
                readonly
                :value="formatPhoneNumber(form.userPhoneNum)"
              />
            </template>
            <template v-else>
              <input
                class="form-control text-3 h-auto py-2"
                type="text"
                name="phone"
                v-model="form.userPhoneNum"
                @input="validatePhone"
              />
              <div v-if="phoneError" class="invalid-feedback">
                {{ phoneError }}
              </div>
            </template>
          </div>
          <div class="col-lg-3 text-end">
            <template v-if="!editing.userPhoneNum">
              <button
                type="button"
                class="btn btn-light btn-outline"
                @click="toggleEdit('userPhoneNum')"
              >
                수정
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="btn btn-primary btn-outline me-2"
                @click="saveField('userPhoneNum')"
              >
                확인
              </button>
              <button
                type="button"
                class="btn btn-light btn-outline"
                @click="cancelEdit('userPhoneNum')"
              >
                취소
              </button>
            </template>
          </div>
        </div>

        <!-- 주소 + 수정 버튼 -->
        <div class="form-group row align-items-center">
          <label class="col-lg-2 col-form-label text-2">주소</label>

          <div class="col-lg-7">
            <template v-if="!editing.address">
              <input
                class="form-control text-3 h-auto py-2"
                type="text"
                :value="form.address + ' ' + form.detailAddress"
                readonly
              />
            </template>

            <template v-else>
              <div class="row">
                <div class="col-8 pe-1">
                  <input
                    class="form-control text-3 h-auto py-2"
                    type="text"
                    name="address"
                    :value="form.address"
                    @click="openPostcode"
                    placeholder="주소 검색 클릭"
                  />
                </div>
                <div class="col-4 ps-1">
                  <input
                    class="form-control text-3 h-auto py-2"
                    type="text"
                    name="detailAddress"
                    v-model="form.detailAddress"
                    placeholder="상세주소 입력"
                  />
                </div>
              </div>
            </template>
          </div>

          <div class="col-lg-3 text-end">
            <template v-if="!editing.address">
              <button
                type="button"
                class="btn btn-light btn-outline"
                @click="toggleEdit('address')"
              >
                수정
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="btn btn-primary btn-outline d-inline-block me-2"
                @click="saveField('address')"
              >
                확인
              </button>
              <button
                type="button"
                class="btn btn-light btn-outline d-inline-block"
                @click="cancelEdit('address')"
              >
                취소
              </button>
            </template>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="form-group row mt-4">
          <div class="col-lg-12 text-center">
            <button
              type="submit"
              class="btn btn-primary btn-modern d-inline-block me-2"
            >
              저장
            </button>
            <button
              class="btn btn-light btn-modern d-inline-block"
              @click="resetForm"
            >
              초기화
            </button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import PasswordCheck from '../common/PasswordCheck.vue'
import { watchEffect, reactive, ref } from 'vue'
import { api } from '@/axios'
import { debounce } from 'lodash'
import { useAlertStore } from '@/fo/stores/alertStore'

const alertStore = useAlertStore()

const isConfirmed = ref(false)

const userProfileImageUrl = ref(null)
const profileImageInput = ref(null)
const hovering = ref(false)

// 상태 변수들
const error = ref(null)

// 불러온 원본 데이터를 저장할 객체
const originalData = reactive({
  userId: '',
  userPw: '',
  userEmail: '',
  userNm: '',
  userBirthDt: '',
  userGenderNm: '',
  userPhoneNum: '',
  address: '',
  detailAddress: '',
  zonecode: '',
  sigunguCode: '',
  latitude: null,
  longitude: null,
})

// 양방향 바인딩용 폼 객체
const form = reactive({ ...originalData })

const editEmail = reactive({
  emailId: '',
  emailDomain: '',
  verificationCode: '',
})

// 편집 상태를 관리할 객체
const editing = reactive({
  userPw: false,
  userEmail: false,
  userPhoneNum: false,
  address: false,
})

// 파일 변경 이벤트 핸들러
const onFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)

    // API 호출 (경로 및 토큰 등 필요에 맞게 변경)
    const response = await api.$post(
      '/mypage/edit/profile-image/update',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    if (response.status === 'OK') {
      // 성공하면 새 이미지 URL을 다시 조회하거나, 클라이언트에서 미리 URL 생성해서 교체 가능
      // 여기선 간단히 URL.createObjectURL 로 미리보기 처리
      userProfileImageUrl.value = URL.createObjectURL(file)
      alertStore.show('프로필 이미지가 업데이트되었습니다.', 'success')
    } else {
      alertStore.show('프로필 이미지 업데이트에 실패했습니다.', 'danger')
    }
  } catch (error) {
    alertStore('프로필 이미지 업데이트 중 오류가 발생했습니다.', 'danger')
    console.error(error)
  }
}

const removeProfileImage = async () => {
  try {
    const response = await api.$delete('/mypage/edit/profile-image')
    if (response.status === 'OK') {
      alertStore.show('프로필 이미지가 삭제되었습니다.', 'sucess')
      userProfileImageUrl.value = null
    }
  } catch (error) {
    alertStore('프로필 이미지 삭제에 실패하였습니다.', 'danger')
    console.err(error)
  }
}

const passwordError = ref('')
const passwordValid = ref(false)
const repeatPassword = ref('')
const repeatPasswordValid = ref(false)
const emailError = ref('')
const verifycodeError = ref('')
const isVerified = ref(false)

const resetRepeatPasswordState = () => {
  repeatPassword.value = ''
  repeatPasswordValid.value = false
}

// 비밀번호 유효성 검사 + 중복 확인
const validatePasswordCore = async (pw) => {
  passwordError.value = ''
  passwordValid.value = false

  if (!pw) {
    passwordError.value = '비밀번호를 입력해주세요.'
    return
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pw)) {
    passwordError.value = '8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.'
    return
  }
  if (!repeatPassword.value) {
    passwordError.value = '비밀번호 확인을 입력하세요.'
    return
  }
  if (repeatPassword.value !== form.userPw) {
    passwordError.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  repeatPasswordValid.value = true

  try {
    // API 요청 바디
    const requestBody = {
      currentPassword: form.userPw, // 입력한 비밀번호
    }
    const response = await api.$post(`/mypage/edit/check-password`, requestBody)
    // console.log('res', response)
    if (response.status === 'OK' && response.output === true) {
      passwordError.value = '기존 비밀번호와 동일합니다.'
    } else {
      passwordValid.value = true
      passwordError.value = '사용 가능한 비밀번호입니다.'
    }
  } catch (e) {
    passwordError.value = '서버 오류가 발생했습니다.'
  }
}

const validateRepeatPassword = () => {
  repeatPasswordValid.value =
    !!repeatPassword.value && repeatPassword.value === form.userPw
  validatePasswordCore(form.userPw)
}

// 디바운스 처리 함수
const validatePassword = debounce((pw) => {
  validatePasswordCore(pw)
}, 400)

// input 이벤트 핸들러
const onPasswordInput = (e) => {
  form.userPw = e.target.value
  repeatPasswordValid.value = false
  validatePassword(form.userPw)
}

// 주소 검색 함수 (다음 주소 API 사용)
function openPostcode() {
  new window.daum.Postcode({
    oncomplete: function (data) {
      let addr =
        data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress

      form.zonecode = data.zonecode
      form.address = addr
      form.detailAddress = ''
      form.sigunguCode = data.sigunguCode

      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(addr, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          form.latitude = result[0].y
          form.longitude = result[0].x
        } else {
          form.latitude = null
          form.longitude = null
        }
      })
    },
  }).open()
}

// 이메일 유효성 검사
const validateEmail = () => {
  emailError.value = ''
  const email = editEmail.emailId + '@' + editEmail.emailDomain
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!editEmail.emailId || !editEmail.emailDomain) {
    emailError.value = '이메일을 모두 입력하세요.'
    return false
  }
  if (!emailRegex.test(email)) {
    emailError.value = '유효한 이메일 형식이 아닙니다.'
    return false
  }
  return true
}
// 인증번호 유효성 검사
const validateVerifycode = () => {
  verifycodeError.value = ''
  if (!editEmail.verificationCode) {
    verifycodeError.value = '인증번호를 입력하세요.'
    return false
  }
  return true
}

// 인증 요청 함수
const sendVerification = async () => {
  if (!validateEmail()) return

  error.value = ''
  try {
    const email = editEmail.emailId + '@' + editEmail.emailDomain
    // const response =
    await api.$post('/email/send-code', { email })

    // console.log('인증 이메일 전송 완료', response)
    // alertStore.show(
    //   '인증 코드를 전송했습니다. 인증 코드 : ' + response.output.code,
    //   'success',
    // )
    alertStore.show('인증 코드를 전송했습니다. ', 'success')
    isVerified.value = false
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error)
    const message =
      error.response?.data?.message || '이메일 인증 요청에 실패했습니다.'
    alertStore.show(message, 'danger')
  }
}

// 인증번호 확인 함수
const verifyCode = async () => {
  if (!validateVerifycode()) return

  error.value = ''
  try {
    const email = editEmail.emailId + '@' + editEmail.emailDomain
    // const response =
    await api.$post('/email/verify-code', {
      email,
      code: editEmail.verificationCode,
    })
    // console.log('인증 성공', response)
    alertStore.show('이메일 인증에 성공하였습니다.', 'info')
    isVerified.value = true
  } catch (error) {
    console.error('인증 코드 검증 실패:', error)
    verifycodeError.value = '인증번호가 일치하지 않습니다.'
    alertStore.show('이메일 인증에 실패하였습니다.', 'danger')
    isVerified.value = false
  }
}

function formatPhoneNumber(number) {
  const clean = number.replace(/\D/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (clean.length === 10) {
    return clean.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
  } else {
    return number // 길이가 다르면 그냥 원본 반환
  }
}

const phoneError = ref('')
const phoneValid = ref(false)

// 휴대폰 번호 유효성 검사
const validatePhone = () => {
  phoneError.value = ''
  phoneValid.value = false
  if (!form.userPhoneNum) {
    phoneError.value = '휴대폰 번호를 입력해주세요.'
  } else if (!/^\d{10,11}$/.test(form.userPhoneNum)) {
    phoneError.value = '올바른 휴대폰 번호 형식이 아닙니다. (하이픈 제외)'
  } else {
    phoneError.value = ''
    phoneValid.value = true
  }
}

// 편집 모드 토글
function toggleEdit(field) {
  if (field === 'userPw') {
    resetRepeatPasswordState()
  }
  editing[field] = true
}

function saveField(field) {
  if (
    field === 'userPw' &&
    (!passwordValid.value || !repeatPasswordValid.value)
  )
    return
  if (field === 'userEmail' && !isVerified.value) return
  if (field === 'userPhoneNum' && !phoneValid.value) return

  if (field === 'userEmail') {
    form.userEmail = `${editEmail.emailId}@${editEmail.emailDomain}`
  }

  if (field === 'userPw') {
    resetRepeatPasswordState()
  }

  editing[field] = false
  // console.log('form', form)
}

function cancelEdit(field) {
  editing[field] = false

  if (field === 'address') {
    form.address = originalData.address
    form.detailAddress = originalData.detailAddress
    form.zonecode = originalData.zonecode
    form.sigunguCode = originalData.sigunguCode
    form.latitude = originalData.latitude
    form.longitude = originalData.longitude
  } else if (field === 'userEmail') {
    form.userEmail = originalData.userEmail
    editEmail.emailId = ''
    editEmail.emailDomain = ''
    editEmail.verificationCode = ''
  } else if (field === 'userPw') {
    form.userPw = originalData.userPw
    resetRepeatPasswordState()
  } else {
    form[field] = originalData[field]
  }
}

function resetForm() {
  for (const key in originalData) {
    form[key] = originalData[key]
  }
  resetRepeatPasswordState()
  Object.keys(editing).forEach((field) => {
    editing[field] = false
  })
}

function isFormChanged() {
  return (
    form.userPw !== '' ||
    form.userEmail !== originalData.userEmail ||
    form.userPhoneNum !== originalData.userPhoneNum ||
    form.zonecode !== originalData.zonecode ||
    form.address !== originalData.address ||
    form.detailAddress !== originalData.detailAddress ||
    form.sigunguCode !== originalData.sigunguCode ||
    form.latitude !== originalData.latitude ||
    form.longitude !== originalData.longitude
  )
}

const saveAll = async () => {
  const isAnyEditing = Object.values(editing).some((v) => v === true)
  if (isAnyEditing) {
    alertStore.show('수정 중인 항목을 먼저 저장하거나 취소해주세요.', 'danger')
    return
  }
  if (!isFormChanged()) {
    alertStore.show('변경된 정보가 없습니다.', 'danger')
    return
  }

  const requestBody = {
    personal: {
      userPw: form.userPw || undefined, // 비밀번호는 입력된 경우에만 보냄
      userEmail: form.userEmail,
      userPhoneNum: form.userPhoneNum,
      zonecode: form.zonecode,
      address: form.address,
      detailAddress: form.detailAddress,
      sigunguCode: form.sigunguCode,
      latitude: form.latitude,
      longitude: form.longitude,
    },
  }

  try {
    const response = await api.$post('/mypage/edit/update', requestBody)

    if (response.status === 'OK') {
      alertStore.show(
        response.message || '회원 정보가 성공적으로 수정되었습니다.',
        'success',
      )
      await fetchUserInfo()
      resetForm()
    } else {
      alertStore.show(
        response.message || '회원 정보 수정에 실패하였습니다.',
        'danger',
      )
    }
  } catch (err) {
    const status = err.response?.status
    let errorMessage = '회원 정보 수정에 실패하였습니다.'

    if (status === 400) {
      errorMessage = err.response?.data?.message || '입력값을 확인해주세요.'
    } else if (status === 500) {
      errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }

    alertStore.show(errorMessage, 'danger')
  }
}

async function fetchUserInfo() {
  try {
    const response = await api.$get('/mypage/edit/info', null)
    const data = response.output
    // console.log('data', data)

    Object.assign(originalData, {
      userId: data.userId,
      userEmail: data.userEmail,
      userPw: '',
      userNm: data.userNm,
      userBirthDt: data.userBirthDt,
      userGenderNm: data.userGenderNm,
      userPhoneNum: data.userPhoneNum,
      address: data.address,
      detailAddress: data.detailAddress || '',
      zonecode: data.zonecode,
      sigunguCode: data.sigunguCode,
      latitude: data.latitude,
      longitude: data.longitude,
    })
    Object.assign(form, originalData)
    userProfileImageUrl.value = data.userProfileImageUrl
  } catch (err) {
    console.error('정보 조회 실패', err)
    error.value = err.message
  }
}

watchEffect(() => {
  if (isConfirmed.value) {
    fetchUserInfo()
  }
})
</script>

<style scoped>
input[readonly] {
  border: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  pointer-events: none;
}

.form-check-input[disabled] {
  pointer-events: none;
}
</style>
