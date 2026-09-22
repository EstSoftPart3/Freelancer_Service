# 로그인 / 회원가입 마이그레이션 검증 (Vue → Next.js)

> 검증 기준일: 2026-06-26
> 대상: `migration-map.md`의 "로그인 / 회원가입" 기능 행
> 방법: 아래 파일만 1:1 대조. 추측 없이 코드에 있는 것만 기록.

## 0. 대조한 파일

| 기능 | Vue | Next |
|---|---|---|
| 로그인 | `src/fo/views/login&signup/LoginPage.vue` | `app/login/page.tsx` → `components/auth/LoginForm.tsx` |
| 회원가입(셸) | `src/fo/views/login&signup/SignUpPage.vue` | `app/sign-up/page.tsx` → `components/auth/SignUpPageClient.tsx` |
| 회원가입(개인) | `src/fo/components/login&signup/PersonalSignUpForm.vue` | `components/auth/PersonalSignUpForm.tsx` |
| 회원가입(기업) | `src/fo/components/login&signup/CompanySignUpForm.vue` | `components/auth/CompanySignUpForm.tsx` |
| 이메일 인증 | (각 폼 인라인) | `hooks/useEmailVerification.ts` |
| 상태/지속성 | `src/fo/stores/userStore.js` (Pinia) | `stores/userStore.ts` (Zustand), `components/common/Providers.tsx` |
| 토큰 저장 | (localStorage, 폼 내부) | `lib/cookies.ts` |
| 라우트 가드 | `src/fo/router/index.js` (`beforeEach`) | `proxy.ts` |

공통 API 엔드포인트(양측 동일 확인): `/login`, `/me`, `/signup`, `/check-id`, `/email/send-code`, `/email/verify-code`.

---

## 1. 로그인 (LoginPage)

### 1-A. 유효성 / 입력 규칙

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 회원 유형 토글 PERSONAL/COMPANY | ✅ | `LoginForm.tsx:31,125-130` | 동일 |
| 아이디 `required` | ✅ | `LoginForm.tsx:136-141` | HTML `required` 동일. (Vue는 type별 `id`/`cid` 분리, Next는 단일 `id`로 통합 — payload 동일) |
| 비밀번호 `required`, `maxlength=32` | ✅ | `LoginForm.tsx:146-153` | 동일 (`maxLength={32}`) |
| 로그인 유지(autoLogin) 체크박스 | ✅ | `LoginForm.tsx:158-161` | 동일 |
| 아이디 저장(id_save) 체크박스 | ✅ | `LoginForm.tsx:165-168` | 동일 |

### 1-B. 로그인 분기 / API / 토큰 처리

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| `userTypeCd` = 301(개인)/302(기업) | ✅ | `LoginForm.tsx:59` | 동일 |
| `POST /login` { userId, userPw, userTypeCd, autoLogin } | ✅ | `LoginForm.tsx:56-67` | 동일 payload |
| 응답 `output.accessToken/refreshToken` 없으면 throw | ✅ | `LoginForm.tsx:68-69` | 동일 |
| **토큰 저장 위치** | ⚠️다름 | `LoginForm.tsx:71-72` | **Vue=localStorage** (`accessToken`/`refreshToken`), **Next=쿠키**(`setCookie`, SameSite=Lax). 미들웨어(`proxy.ts`)가 쿠키를 읽어야 하므로 쿠키로 이전한 것은 의도적. |
| **토큰 만료(autoLogin 연동)** | ⚠️다름 | `LoginForm.tsx:71-72,78` | Vue localStorage는 만료 개념 없이 영구. Next 쿠키는 `autoLogin ? 30일 : 1일`로 만료 설정. 즉 Next는 미체크 시 1일 후 자동 로그아웃 — Vue엔 없던 동작. |
| **userType 쿠키 저장** | ⚠️Next 전용 | `LoginForm.tsx:78` | Next는 역할 가드(`proxy.ts`)용 `userType` 쿠키를 추가 저장. Vue엔 없음(Pinia store로 판별). |
| 로그인 후 `POST /me` 호출 → 스토어 setUser | ✅ | `LoginForm.tsx:75-77` | 동일 |
| 아이디 저장 처리(체크 시 저장, 해제 시 제거) | ⚠️다름 | `LoginForm.tsx:81-90` | Vue는 해제 시 `savedPersonalId`/`savedCompanyId`/**`savedLoginType`** 모두 제거. Next는 `savedLoginType`을 **제거하지 않음**. |
| autoLogin localStorage 플래그 | ✅ | `LoginForm.tsx:91-92` | 동일 |
| 성공 알림 `OOO님 안녕하세요.` + `/`로 이동 | ✅ | `LoginForm.tsx:95-96` | 동일 |
| **로그인 실패 기본 메시지** | ⚠️다름 | `LoginForm.tsx:97-101` | Vue=`error.response?.data?.message ‖ error.message`(예: '토큰 정보가...'). Next=`...message ?? '로그인에 실패했습니다.'` (고정 폴백). |
| **`/me` 실패 시 처리** | ⚠️다름 | `LoginForm.tsx:75` (같은 try) | Vue `fetchUserInfo`는 실패 시 '로그인 정보가 만료되었습니다' 알림 + `/login` 리다이렉트. Next는 `/me`가 같은 try 안이라 일반 실패 메시지만 표시, 전용 처리/리다이렉트 없음. |
| 로딩 상태(버튼 비활성/'로그인 중...') | ⚠️Next 전용 | `LoginForm.tsx:36,173-175` | Next 추가 개선. Vue엔 없음(기능 영향 없음). |

### 1-C. 저장된 아이디/유형 복원 (마운트 로직)

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 마운트 시 저장된 로그인 유형 복원 | ⚠️다름 | `LoginForm.tsx:39-43` | **키 불일치**: Vue는 마운트 시 `localStorage('loginType')`을 읽음. Next는 `localStorage('savedLoginType')`을 읽음. |
| 유형 토글 시 유형을 localStorage에 저장 | ❌누락 | — | Vue `watch(loginType)`이 매 토글마다 `localStorage('loginType')` 저장. Next엔 토글 시 유형 저장 로직 없음(`savedLoginType`은 id_save 체크 후 로그인 시점에만 저장됨). |
| 유형별 저장된 아이디 자동 채움 + id_save 체크 반영 | ✅ | `LoginForm.tsx:45-50` | Vue `loadSavedId`/`watch`와 동등(유형 변경 시 `savedPersonalId`/`savedCompanyId` 로드). |
| autoLogin 체크박스 초기화 | ✅ | `LoginForm.tsx:42` | 동일(`autoLogin` 키). |

> Vue 내부에도 `loginType`(watch 저장) vs `savedLoginType`(id_save 저장) 키가 혼재. Next는 `savedLoginType` 하나로 정리했으나, **마운트 복원 경로가 토글 저장 경로와 끊겨** 유형 기억이 Vue만큼 동작하지 않음.

### 1-D. 소셜 로그인

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 소셜 버튼 클릭 → '준비 중입니다' 알림 | ✅ | `LoginForm.tsx:107-109` | 동작 동일 |
| **소셜 제공자 목록/표현** | ⚠️다름 | `LoginForm.tsx:20-25,197-207` | Vue=kakao/naver/google/apple + 아이콘 이미지. Next=`DOMAIN_PROVIDERS`(naver.com/gmail.com/kakao.com/nate.com — **이메일 도메인 데이터**)를 첫 글자 텍스트 아바타로 렌더. 제공자 셋·표현 모두 상이(아이콘 없음). |

---

## 2. 회원가입 — 공통 셸 (SignUpPage)

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 쿼리 `loginType`으로 개인/기업 폼 분기 | ✅ | `SignUpPageClient.tsx:11,63-65` | 동일(`useSearchParams`). Next는 `<Suspense>`로 래핑. |
| 자식 폼 `submit` → payload 키 변환 후 `POST /signup` | ✅ | `SignUpPageClient.tsx:13-47` | 키 매핑 동일(userId/userPw/userNm/userGenderCd/...). |
| `userGenderCd: Number(gender)` | ⚠️다름 | `SignUpPageClient.tsx:25` | Vue=`Number(gender)`(기업은 gender 없음 → `NaN` 전송). Next=`gender ? Number(gender) : undefined`(기업은 undefined). Next가 더 안전. |
| 생년월일 날짜 포맷팅(8자리→하이픈) | ⚠️다름 | (없음) | Vue `formatDate`가 `companyOpenDate`에 적용(단 Vue 기업폼엔 개업일 입력이 없어 실제론 null). Next는 `<input type=date>`가 이미 `yyyy-mm-dd`라 포맷 함수 불필요 → 미이전(정상). |
| **성공/실패 분기** | ⚠️다름 | `SignUpPageClient.tsx:44-53` | Vue=`response.status === 'OK'`로 성공 판정(else 실패 알림). Next=`await` 성공 시 무조건 성공 처리(2xx=성공 가정), 응답 본문 status 검사 없음. |
| 성공 시 '회원가입 완료' 알림 + `/login` 이동 | ✅ | `SignUpPageClient.tsx:46-47` | 메시지 문구만 다름(Vue: '회원 정보가 성공적으로 수정되었습니다.' — 원문 오타성, Next: '회원가입이 완료되었습니다. 로그인해주세요.'). |
| **에러 상태코드별 메시지(400/500)** | ⚠️다름 | `SignUpPageClient.tsx:48-53` | Vue=400→`message ‖ '입력값을 확인해주세요.'`, 500→'서버 오류...'로 분기. Next=`message ?? '회원가입에 실패했습니다.'` 단일 폴백(상태코드 분기 없음). |
| `companyProfileStore.resetProfile()` 호출 | ❌누락 | — | Vue는 성공 후 기업 프로필 스토어 초기화. Next엔 해당 스토어/호출 없음(미사용으로 추정되나 코드상 미이전). |

---

## 3. 회원가입 — 개인 (PersonalSignUpForm)

필드별 유효성 규칙은 **전부 동일**. 트리거 시점과 컴포넌트만 일부 차이.

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 아이디 빈값 → '아이디를 입력해주세요.' | ✅ | `PersonalSignUpForm.tsx:64` | 동일 |
| 아이디 `^[a-zA-Z0-9]{5,20}$` 아니면 에러 | ✅ | `PersonalSignUpForm.tsx:65-68` | 동일 정규식/문구 |
| 아이디 중복확인 `GET /check-id?userId=` (true면 '이미 사용 중') | ✅ | `PersonalSignUpForm.tsx:69-73` | 동일. 500 시 '서버 오류가 발생했습니다.' 동일 |
| 아이디 입력 디바운스 500ms | ✅ | `PersonalSignUpForm.tsx:76-80` | 동일(`setTimeout 500`) |
| 비밀번호 `^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$` | ✅ | `PersonalSignUpForm.tsx:82-91` | 동일 정규식/문구 |
| 비밀번호 확인 일치 검사 | ✅ | `PersonalSignUpForm.tsx:93-99` | 동일 |
| 이름 빈값/2자 미만 검사 | ✅ | `PersonalSignUpForm.tsx:101-107` | 동일 |
| 생년월일 빈값 검사 | ✅ | `PersonalSignUpForm.tsx:109-114` | 규칙 동일. **위젯 다름**: Vue=`vue3-datepicker`, Next=`<input type=date>` (둘 다 `max=오늘`). |
| 성별 빈값 검사(101 남/102 여) | ✅ | `PersonalSignUpForm.tsx:116-121,302-310` | 동일 |
| 휴대폰 `^\d{10,11}$`(하이픈 제외) | ✅ | `PersonalSignUpForm.tsx:123-132` | 동일 정규식/문구 |
| 주소: Daum 우편번호 → 주소/우편/시군구, Kakao 지오코딩 좌표 | ✅ | `PersonalSignUpForm.tsx:164-186` | 동일 로직. Vue는 `onMounted`에서 Kakao 스크립트 동적 로드, Next는 `<Script>`(Daum) + `window.kakao?.maps` 가드. |
| 주소 빈값 검사 | ✅ | `PersonalSignUpForm.tsx:134-139` | 동일 |
| 상세주소(검증 없음) | ✅ | `PersonalSignUpForm.tsx:330-332` | 동일 |
| 이메일: 아이디 빈값 / 커스텀 도메인 빈값 / `\S+@\S+\.\S+` 형식 | ✅ | `PersonalSignUpForm.tsx:141-149` | 동일 규칙/문구 |
| 도메인 셀렉트(naver/gmail/daum/nate/hotmail/직접입력) | ✅ | `PersonalSignUpForm.tsx:15,348-356` | 동일 목록 |
| 이메일 인증요청 `POST /email/send-code` | ✅ | `useEmailVerification.ts:20` | 동일 엔드포인트 |
| 인증코드 확인 `POST /email/verify-code` | ✅ | `useEmailVerification.ts:38` | 동일 엔드포인트. 성공/실패 문구 동일 |
| 인증번호 검증(빈값/미인증) | ✅ | `PersonalSignUpForm.tsx:151-156` | 동일 |
| 약관 동의 필수 | ✅ | `PersonalSignUpForm.tsx:158-162` | 동일. 단 약관 모달(`TermsAgreementModal`/`personalAgreementText`)은 Next 폼에 미구현(체크박스만). |
| 제출 시 전체 검증 후 통과해야 emit/onSubmit | ✅ | `PersonalSignUpForm.tsx:209-243` | 동일 |
| **검증 실패 시 사용자 피드백** | ⚠️다름 | `PersonalSignUpForm.tsx:222` | Vue=`console.warn`만(무반응). Next=`alertStore.show('입력 정보를 확인해주세요.')` 추가. |
| **검증 트리거 시점** | ⚠️다름 | (각 onBlur) | Vue=대부분 `@input`(실시간). Next=비번/이름/생년월일/휴대폰은 `onBlur`(포커스 아웃 시). 규칙은 같고 UX 타이밍만 다름. |
| `typeCode:301, signupTypeCode:204` 고정 | ✅ | `PersonalSignUpForm.tsx:240-241` | 동일 |

---

## 4. 회원가입 — 기업 (CompanySignUpForm)

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 아이디/비번/비번확인/담당자이름/휴대폰/주소/이메일/인증/약관 | ✅ | `CompanySignUpForm.tsx:57-110,136-157` | 규칙 동일(개인폼과 동일 검증) |
| 담당자 이름 2자 미만 검사 | ⚠️다름 | `CompanySignUpForm.tsx:90-94,140` | Vue=개인과 동일하게 **2자 미만** 검사(`validateName`). Next=공용 `req()`로 **빈값만** 검사(2자 규칙 빠짐). |
| 기업명 빈값 검사 | ⚠️다름 | `CompanySignUpForm.tsx:142` | Vue 문구='기업 인증을 진행해주세요.' / Next='기업명을 입력해주세요.' |
| **대표자 이름(companyCeoName)** | ⚠️다름 | `CompanySignUpForm.tsx:143,222-225` | **Vue: 입력 필드 없음 + 검증 없음**(`form.companyCeoName=null` 그대로 전송). **Next: 입력 필드 + 필수 검증 추가.** |
| **사업자 번호(companyBizNumber)** | ⚠️다름 | `CompanySignUpForm.tsx:144,230-232` | 동일하게 Vue엔 입력/검증 없음(null 전송), Next는 필수 입력 추가. |
| **개업일(companyOpenDate)** | ⚠️다름 | `CompanySignUpForm.tsx:145,235-237` | Vue 입력/검증 없음(null), Next는 `<input type=date>` 필수 + `max=오늘` 추가. |
| 생년월일/성별 없음(기업) | ✅ | (해당 필드 없음) | 양측 동일하게 제외 |
| `typeCode:302, signupTypeCode:204` | ✅ | `CompanySignUpForm.tsx:167` | 동일 |

> **요지:** 기업 회원가입에서 Next는 Vue엔 입력 UI조차 없던 **대표자명·사업자번호·개업일 3개 필드를 신규로 수집·필수화**함. 마이그레이션이라기보다 기능 확장. 백엔드 DTO 호환 및 의도 확인 필요.

---

## 5. 마이그레이션 리스크 점검

| 리스크 항목 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| **새로고침 후 로그인 유지** | ⚠️다름 | `userStore.ts`, `Providers.tsx:19-34` | Vue Pinia는 생성 시 **localStorage에서 동기 복원**(userSq/userNm/userType 등) → 새로고침 즉시 로그인 상태 확정. Next Zustand는 **persist 없음(메모리)** → 새로고침 시 store 초기화. 복원은 `Providers`의 `useEffect`가 accessToken 쿠키 있으면 `POST /me` **비동기** 재조회로 수행. 유지는 되나 첫 렌더는 로그아웃 상태(네트워크 왕복 후 채워짐). |
| **뒤로/앞으로 가기** | ⚠️다름 | (해당 커스텀 없음) | Vue `router.scrollBehavior`로 back/forward 시 스크롤 위치 복원·신규이동 top 고정. Next App Router는 기본 스크롤 복원에 의존(커스텀 미이전). |
| **로그인 상태로 /login·/sign-up 재접근 차단** | ❌누락 | `proxy.ts` | Vue `beforeEach`: 로그인 상태에서 publicPages(Login/SignUp/...) 접근 시 메인으로 리다이렉트. **Next proxy.ts엔 이 규칙 없음** → 로그인 후 뒤로가기로 `/login` 재진입 가능. |
| **SSR/hydration — localStorage 접근** | ✅ | `LoginForm.tsx:39-50`, `cookies.ts:3` | localStorage 접근은 모두 `useEffect` 내부(클라이언트 전용), `getCookie`는 `typeof document` 가드. 첫 렌더 크래시 위험 없음. |
| **SSR/hydration — 첫 렌더 깜빡임** | ⚠️다름 | `userStore.ts`, `Providers.tsx` | userStore 초기값이 전부 `undefined` → 로그인 사용자도 첫 렌더는 비로그인 UI, `/me` 응답 후 갱신 → 헤더 등에서 깜빡임 가능(Vue는 동기 복원이라 깜빡임 없음). |
| **보호 라우트 직접 URL 접근 리다이렉트** | ✅ | `proxy.ts:39-45` | **구현됨.** 비공개 경로 + 토큰 없으면 `/login`. 오히려 Vue보다 견고(Vue는 라우트 **이름** 화이트리스트라 mypage 일부 자식이 누락; proxy는 경로 prefix 기반으로 모든 비공개 경로 차단). |
| 역할 가드(개인/기업 전용) | ⚠️다름 | `proxy.ts:47-53` | Vue=잘못된 역할 시 메인(`/`)으로 + 알림('기업 회원만...'). Next=`/mypage`로 리다이렉트 + **알림 없음**(미들웨어라 클라이언트 토스트 불가). 대상 경로 목록도 상이(예: 프로젝트 상세 `UserProjectSpec`/`CompanyProjectSpec` 역할 가드는 `/projects/**`가 PUBLIC이라 proxy 미적용). |
| 가드 리다이렉트 시 안내 메시지 | ⚠️다름 | `proxy.ts` | Vue는 '로그인이 필요한 서비스입니다.' 등 알림 후 이동. Next 미들웨어는 메시지 없이 리다이렉트만. |

---

## 6. 수정 필요 목록 (❌누락 / ⚠️다름 우선순위)

### P1 — 동작/보안 영향 (확인·수정 권장)

1. **[❌] 로그인 상태에서 `/login`·`/sign-up` 재접근 차단 미구현** (`proxy.ts`)
   - 로그인 후 뒤로가기로 로그인/회원가입 페이지 재진입 가능. proxy에 `token && publicAuthPath → /` 규칙 추가 필요.
   - **트랙: [프론트 즉시수정·우선순위 낮음]** proxy.ts에 리다이렉트 추가.
2. **[⚠️] 기업 회원가입 신규 필수 필드 3종**(대표자명·사업자번호·개업일) (`CompanySignUpForm.tsx`)
   - Vue엔 없던 입력/검증. 백엔드 `/signup` DTO·검증과의 호환 및 기획 의도 확인 필요(의도면 정상, 아니면 제거).
   - **트랙: [기획확인 필요]** 코드수정 아님, 백엔드 DTO 확인 후 결정.
   - **[백엔드 확정 2026-06-26]** `SignUpRequestDTO`에 3개 필드 존재하나 검증 어노테이션·컨트롤러 `@Valid` 없음(optional), 게다가 `UserService.signUp()`은 기업 INSERT 시 `companyNm`만 저장하고 3개 필드는 미사용 → **백엔드는 required 아님. 프론트만 임의 필수화 → 기획 의도 확인 필요**(의도면 백엔드 검증·저장 추가, 아니면 필수 해제).
3. **[⚠️] 회원가입 성공 판정 로직 약화** (`SignUpPageClient.tsx:44-53`)
   - Vue는 `response.status==='OK'` 검사. Next는 2xx면 무조건 성공. 백엔드가 200+에러본문을 줄 수 있으면 오탐 위험 → 응답 본문 검사 추가 검토.
   - **트랙: [백엔드 응답패턴 확인 후 결정]**
   - **[백엔드 확정 2026-06-26]** `SignUpController.signUp()`이 `ApiResponse<?>`를 직접 반환(ResponseEntity 아님) → 실패해도 **HTTP는 항상 200**, body `status` 필드에만 BAD_REQUEST/500 담김. **Next의 2xx=성공 판정은 오탐 위험 → 본문 status 검사 복원 필요**(`body.status === 'OK'/200` 확인).
4. **[⚠️] 새로고침 시 로그인 상태 비동기 복원 + 첫 렌더 깜빡임** (`userStore.ts`, `Providers.tsx`)
   - Zustand `persist` 미적용. 깜빡임/초기 비로그인 UI가 문제면 persist 미들웨어 또는 쿠키 기반 초기 상태 주입 검토.
   - **트랙: [상태관리 일괄정리 트랙으로 보류]** Zustand persist/로딩가드.

### P2 — UX/표현 차이 (정합성 확인)

5. **[❌] 로그인 유형 토글 시 유형 저장 + [⚠️] 마운트 복원 키 불일치** (`LoginForm.tsx:39-50`)
   - 토글 시 유형 미저장 + 마운트는 `savedLoginType`만 읽음 → Vue만큼 "마지막 선택 유형 기억"이 동작하지 않음. 저장/복원 키 일원화 필요.
6. **[⚠️] 소셜 로그인 제공자 데이터 오류** (`LoginForm.tsx:20-25`)
   - `DOMAIN_PROVIDERS`(이메일 도메인)를 소셜 버튼으로 렌더. kakao/naver/google/apple + 아이콘으로 교정 필요(현재 동작은 '준비 중' 알림이라 기능 영향은 없음).
7. **[⚠️] 기업 담당자 이름 2자 미만 검증 누락** (`CompanySignUpForm.tsx:140`)
   - Vue는 2자 미만 차단. Next 공용 `req()`는 빈값만 검사. 개인폼과 규칙 통일 필요.
8. **[⚠️] 에러 메시지 정합성**
   - 로그인 실패 폴백(`LoginForm.tsx:99-100`), 회원가입 400/500 분기(`SignUpPageClient.tsx:48-53`), `/me` 실패 시 만료 안내+리다이렉트(`LoginForm.tsx`), 가드 리다이렉트 안내 토스트(`proxy.ts`) — Vue 대비 단순화/소실. 필요한 문구·분기 복원 검토.
9. **[⚠️] 아이디 저장 해제 시 `savedLoginType` 미제거** (`LoginForm.tsx:87-90`) — 잔존 키 정리.
10. **[⚠️] 약관 동의 모달 미구현** (`PersonalSignUpForm.tsx`/`CompanySignUpForm.tsx`)
    - Vue는 `TermsAgreementModal`로 약관 본문 노출 후 동의. Next는 체크박스만. 약관 본문 표시 필요 여부 확인.

### P3 — 미이전/참고

11. **[❌] `companyProfileStore.resetProfile()` 미이전** (`SignUpPageClient.tsx`) — 해당 스토어 Next 부재. 실제 사용처 없으면 무시 가능.
12. **[⚠️] back/forward 스크롤 복원**(`router.scrollBehavior`) 미이전 — 전역 사안이나 기록.
13. **[⚠️] autoLogin 미체크 시 1일 후 자동 로그아웃**(`LoginForm.tsx:71-72`) — Vue엔 없던 만료. 쿠키 기반 전환의 부수효과, 정책 확인.

---

## 7. 범위 메모

- 본 검증은 **로그인/회원가입 프론트엔드**만 대상. 백엔드 인증 경계는 `docs/backlog-backend-auth.md`로 분리됨(미검토).
- `find-account` / `find-id-result` / `reset-password`(계정찾기 계열)는 동일 섹션이나 이번 행 범위 밖이라 미검토. `useEmailVerification`은 해당 폼들과 공용임만 확인.
- 역할 가드의 전체 경로 목록 정합성(개인/기업 전용 페이지 매핑)은 mypage 기능 검증에서 별도 확인 권장(`proxy.ts` PERSONAL_ONLY/COMPANY_ONLY vs Vue userRolePages/companyRolePages 목록 상이).

---

## 다음 검증 대상

계정찾기·아이디찾기·비밀번호재설정 3종은 별도 세션에서 `docs/check-account-recovery.md` 로 검증 예정 (로그인 영역 마무리).
