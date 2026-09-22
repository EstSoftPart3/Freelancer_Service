# 계정찾기 / 아이디찾기 / 비밀번호재설정 — Vue→Next 마이그레이션 검증

> 검증 세션. 추측 없이 실제 코드만 대조. 프론트엔드 한정(백엔드 인증 경계는 `docs/backlog-backend-auth.md`로 분리).
> 작성 기준일: 2026-06-26

## 0. 대조한 파일 (migration-map.md 62–64행)

| 기능 | Vue | Next |
|---|---|---|
| 계정찾기(탭) | `views/login&signup/FindAccountPage.vue` + `components/login&signup/FindIdForm.vue` + `components/login&signup/ResetPasswordForm.vue` | `app/find-account/page.tsx` → `components/auth/FindAccountForm.tsx` (FindIdForm + ResetPasswordVerifyForm 통합) + `hooks/useEmailVerification.ts` |
| 아이디찾기 결과 | `views/login&signup/FindIdResultPage.vue` | `app/find-account/result/page.tsx` |
| 비밀번호 재설정 | `views/login&signup/ResetPasswordPage.vue` | `app/reset-password/page.tsx` → `components/auth/ResetPasswordForm.tsx` |
| 라우트 가드 | `router/index.js` (publicPages) | `proxy.ts` (PUBLIC_PATHS) |

> ⚠️ Vue는 `ResetPasswordForm.vue`(본인확인 단계)와 `ResetPasswordPage.vue`(새 비번 입력 단계)가 **이름이 헷갈림**. Next는 `FindAccountForm.tsx` 내부 `ResetPasswordVerifyForm`(본인확인) + 별도 `ResetPasswordForm.tsx`(새 비번)로 분리. 본 문서는 단계로 구분: **STEP-A=본인확인**, **STEP-B=새 비번 입력**.

---

## 1. 아이디 찾기

| 기능 | 분기 / 경우의 수 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|---|
| 본인확인 수단 | 이메일 | ✅ | `FindAccountForm.tsx` `FindIdForm` | Vue·Next 모두 **이메일 전용**. 휴대폰 분기는 양쪽 다 없음(=수단 분기 자체가 미존재, 회귀 아님). |
| 이름 검증 | 빈값 / 2자 미만 / 통과 | ✅ | `vName()` (66–71) | 동일 규칙(≥2자). |
| 이메일 검증 | 빈 아이디 / 빈 도메인 / 형식오류 / 통과 | ✅ | `vEmail()` (72–79) | 동일 정규식 `\S+@\S+\.\S+`. 메시지 동등. |
| 도메인 드롭다운 | naver/gmail/daum/nate/hotmail + 직접입력 | ✅ | `EMAIL_DOMAINS` (14) | 목록 동일. |
| 인증코드 발송 | 성공 / 실패 | ✅ | `ev.sendCode` → `useEmailVerification` | 동일 엔드포인트 `/email/find/send-code`. |
| 인증코드 확인 | 정상 / 오류 | ✅ | `ev.verifyCode` → `/email/verify-code` | 동일. 오류 시 "인증번호가 일치하지 않습니다." |
| 인증코드 만료 | 만료 분기 | ⚠️ (양쪽 동일) | — | **양쪽 모두 만료를 프론트에서 구분 안 함**(타이머/카운트다운 없음). 만료=백엔드 오류→일반 실패 메시지. 회귀 아님. |
| 인증코드 재발송 | 재요청 | ⚠️ (양쪽 동일) | — | 양쪽 모두 쿨다운/재전송 제한 없음. "인증" 버튼 재클릭만. |
| 제출 전 전체검증 | 이름·이메일·인증 모두 valid | ✅ | `handleSubmit` (87–100) | 동일. 실패 시 "입력 정보를 확인해주세요." |
| 계정 있음 | `output.userId` 존재 | ✅ | `handleSubmit` (94) | 동일: 결과 페이지로 `?output=` 전달(`encodeURIComponent(JSON.stringify(output))`). |
| 계정 없음 | `userId` 없음 | ✅ | `handleSubmit` (97) | 동일: "일치하는 회원 정보를 찾을 수 없습니다." 알림, 페이지 유지. |
| 결과 표시 방식 | 마스킹 여부 | ⚠️ | `result/page.tsx` | **양쪽 모두 마스킹 없음(전체 노출)** — 동등하나, 표시 필드가 다름(아래). |
| 결과 — 구분(userType) | 컬럼 표시 | ❌ 누락 | `result/page.tsx` (14–18) | Vue는 `userData.userType`("구분") 표시. **Next 결과 페이지는 userType 미표시**(인터페이스에 필드 없음). |
| 결과 — 가입일 | 필드명·포맷 | ⚠️ 다름 | `result/page.tsx` (16,49) | Vue: `userCreatedAtDtm` → `toLocaleDateString('ko-KR')` 포맷. **Next: `regDt`를 그대로 출력**. 동일 `output` 객체를 통과시키므로 **필드명 불일치 시 가입일이 빈칸**이 됨. |
| 결과 — 이름 | 필드명 | ✅ | `result/page.tsx` (43) | 양쪽 `userNm`. |
| 결과 — 결과 없음 | output 손상/없음 | ⚠️ | `result/page.tsx` (58–62) | 양쪽 try/catch로 파싱 실패 처리. 단 **버튼 노출 차이**: Vue는 결과 없을 때 로그인/비번찾기 버튼 **숨김**, Next는 **항상 노출**. 문구도 Vue "아이디 찾기 결과가 없습니다." vs Next "일치하는 회원 정보를 찾을 수 없습니다." |

---

## 2. 비밀번호 찾기 — STEP-A 본인확인

Vue `ResetPasswordForm.vue` ↔ Next `FindAccountForm.tsx`의 `ResetPasswordVerifyForm`

| 기능 | 분기 / 경우의 수 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|---|
| 존재하지 않는 아이디/이메일 | status≠OK | ✅ | `handleSubmit` (171–176) | Vue: `OK`→이동, `BAD_REQUEST`→"일치하는 회원 정보 없음". Next: `OK`→이동, **그 외 전부 else**→동일 메시지. 동등(Next가 더 포괄적). |
| 본인확인 수단 | 이메일 | ✅ | — | 양쪽 이메일 전용. |
| 아이디 검증 | 빈값 / 4자 미만 / 통과 | ❌ 다름 | `handleSubmit` (161) | **Vue는 `userId<4자` 차단 + 실시간 체크마크. Next는 빈값만 검사(길이 규칙 없음)**. 검증 약화. |
| 이름 검증 | 빈값 / 2자 미만 / 통과 | ❌ 다름 | `handleSubmit` (162) | **Vue `name<2자` 차단. Next는 빈값만 검사**. 검증 약화. |
| 이메일 검증 메시지 | 빈아이디/빈도메인/형식 | ⚠️ 다름 | `vEmail` (151–156) | Vue는 3분기 메시지. **Next `ResetPasswordVerifyForm.vEmail`은 한 줄("올바른 이메일 형식")로 축약** — 같은 파일의 `FindIdForm.vEmail`보다도 덜 구체적(내부 불일치). |
| 도메인 드롭다운 | 목록 | ⚠️ 다름 | `EMAIL_DOMAINS` (14, 공용) | **Vue STEP-A 목록 = [naver, gmail, yahoo]**. Next는 공용 `EMAIL_DOMAINS`=[naver, gmail, daum, nate, hotmail] 사용 → **yahoo 빠지고 daum/nate/hotmail 추가**. (직접입력으로 우회 가능하나 목록 불일치.) |
| 실시간 검증 체크마크 | userId/name 유효 표시 | ⚠️ | — | Vue는 userId/name/email/code 4개 체크마크. Next는 email·인증만 표시, **userId/name 체크마크·라이브검증 없음**. UX 저하. |
| 인증코드 발송/확인/만료/재발송 | — | ✅/⚠️(동일) | `useEmailVerification` | 아이디찾기와 동일 훅·동일 엔드포인트. 만료·재발송 미구분도 동일. |
| 본인확인 성공 라우팅 | status=OK | ✅ | `handleSubmit` (172–173) | Vue `router.push({name:'ResetPassword'})` ↔ Next `router.push('/reset-password')`. 동일(별도 페이지로 이동, 쿠키 기반 세션 유지). |
| 서버 오류 | catch | ✅ | `handleSubmit` (177) | 양쪽 "서버 요청 중 오류가 발생했습니다." |

---

## 3. 비밀번호 재설정 — STEP-B 새 비밀번호 입력

Vue `ResetPasswordPage.vue` ↔ Next `ResetPasswordForm.tsx`

| 기능 | 분기 / 경우의 수 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|---|
| 새 비밀번호 유효성 | 빈값 / 규칙위반 / 통과 | ✅ | `validatePassword` (20–27) | **정규식 완전 동일**: `^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$`, maxlength 32. |
| 비밀번호 확인 | 빈값 / 불일치 / 통과 | ✅ | `validateConfirm` (29–34) | 동일. |
| 회원가입/로그인과 같은 규칙인지 | — | ⚠️ 범위 외 | — | **본 세션 범위상 signup 파일 미오픈**(지시: 다른 기능 파일 열지 말 것). Vue↔Next reset 규칙은 서로 동일함만 확인. signup 규칙과의 일치 여부는 **별도 검증 필요**. |
| 재설정 토큰: 유효 | — | ✅ (쿠키 기반) | `handleSubmit` (43–47) | **URL 토큰 미사용**. STEP-A `/reset-password/verify`가 set한 쿠키(`withCredentials`)로 `/reset-password` POST. 유효 토큰=백엔드 통과. 양쪽 동일. |
| 재설정 토큰: 만료 | — | ✅ (양쪽 동일, 백엔드 위임) | (43–53) | 프론트는 만료를 모름. 만료=백엔드 non-OK→`data.message ?? '비밀번호 재설정 실패'`(Next) / `response.message || '비밀번호 재설정 실패'`(Vue). 동등. |
| 재설정 토큰: 이미 사용됨 | — | ✅ (양쪽 동일, 백엔드 위임) | (48–52) | 동일 경로(non-OK 메시지 표시). 프론트 별도 분기 없음. |
| 재설정 토큰: 위조/잘못됨 | — | ✅ (양쪽 동일, 백엔드 위임) | (48–54) | 프론트에 토큰 자체가 없으므로 위조 대상 없음. 잘못된 쿠키=백엔드 거부→실패 메시지/`catch`. 동일. |
| 재설정 성공 라우팅 | status=OK | ✅ | `handleSubmit` (48–50) | 양쪽 "비밀번호 재설정 완료"→`/login`. |
| 재설정 실패 라우팅 | status≠OK / catch | ✅ | (51–54) | 양쪽 알림 후 페이지 유지. |

> **핵심:** "재설정 토큰 valid/expired/used/forged" 4분기는 **프론트에 토큰 개념이 없고 전부 백엔드 쿠키 세션에 위임**되어 있음. Vue·Next 동작 동일 → 프론트 회귀 없음. 단, **프론트 단독으로는 STEP-A 통과 여부를 STEP-B에서 재검증하지 않음**(아래 리스크 R1).

---

## 4. 마이그레이션 리스크

| # | 리스크 | 상태 | 근거 |
|---|---|---|---|
| R1 | **/reset-password 토큰 없이 직접 URL 접근** | ⚠️ 양쪽 동일 | `proxy.ts:9` `/reset-password`가 PUBLIC_PATHS → 누구나 폼 렌더. Vue도 router publicPages에 `ResetPassword` 포함. **양쪽 다 reset 세션 쿠키 유무를 페이지에서 가드하지 않음** → 빈손으로 폼 진입 가능, 제출은 백엔드가 거부. 회귀 아님(설계 동일). 강화하려면 STEP-A 성공 플래그/쿠키 확인 가드 필요(백엔드 경계 백로그와 연계). |
| R2 | **인증 단계 도중 새로고침** | ✅ 동등 | 양쪽 폼 상태가 컴포넌트 로컬(Vue `ref`/`reactive`, Next `useState`) → 새로고침 시 입력·`verified` **소실**(양쪽 동일). 단 **탭 상태는 양쪽 모두 URL 쿼리로 보존**: Vue `route.query.tab`+watch / Next `searchParams.get('tab')`+`router.replace`. STEP-A→STEP-B는 별도 라우트 이동이라 새 비번 페이지는 이전 클라 상태 불필요(쿠키만 의존). |
| R3 | **URL 쿼리 토큰의 SSR 처리** | ⚠️ 주의 | reset 흐름은 토큰을 URL로 안 받음(쿠키 기반) → 해당 리스크 **비해당**. **유일한 쿼리 전달은 아이디찾기 결과 `?output=`**. Next `result/page.tsx`는 **서버 컴포넌트**(`async`, `await searchParams`)에서 파싱 → userId/userNm 같은 PII가 **SSR HTML/서버 로그/URL에 노출** 가능(Vue는 클라 파싱이라 SSR 노출 없음). 손상 쿼리는 양쪽 try/catch로 "없음" 처리. |
| R4 | **결과 데이터 계약 불일치** | ❌ 확인필요 | `/find-id`가 돌려준 동일 `output`을 통과시키는데 Vue는 `userCreatedAtDtm`/`userType`/`userNm`/`userId`, Next는 `regDt`/`userNm`/`userId`(userType 없음)를 읽음. **양쪽 중 최소 한쪽 필드명이 실제 API와 어긋남** → Next에서 가입일 빈칸·구분 누락 가능. (백엔드 응답 스키마 미오픈, 범위 외 → 확인 필요.) |

---

## 5. 수정 필요 목록 (❌누락 / ⚠️다름만, 우선순위順)

### P1 — 기능/데이터 결함 (사용자에게 보임)
1. **[R4 / 1장] 아이디찾기 결과 필드 불일치** — `result/page.tsx`는 `regDt`·`userNm`을 읽고 `userType` 미사용. Vue는 `userCreatedAtDtm`·`userType` 사용. `/find-id` 실제 응답 스키마 확인 후 **Next 필드명을 API에 맞추고**, 필요 시 "구분(userType)" 컬럼 복원 + 가입일 날짜 포맷(`toLocaleDateString('ko-KR')`) 적용.
   - **[백엔드 확정 2026-06-26]** `/find-id` 실제 응답(`ApiResponse.output` = `FindIdResponseDTO`) = `userId`/`userNm`/`userType`/**`userCreatedAtDtm`**. 가입일 실제 필드명은 `userCreatedAtDtm`이고 Next의 `regDt`는 **불일치 → `regDt`를 `userCreatedAtDtm`으로 교정**해야 가입일 표시됨. `userType`은 백엔드도 동일 필드명이라 일치(구분 컬럼 복원 가능).
2. **[2장] STEP-A 아이디/이름 길이 검증 누락** — `ResetPasswordVerifyForm.handleSubmit`이 빈값만 검사. Vue는 `userId≥4`, `name≥2` 차단. 동일 규칙으로 강화.

### P2 — UX/일관성
3. **[1장] 결과 없음 시 버튼 노출 차이** — Next는 결과가 없어도 로그인/비번찾기 버튼을 항상 노출. Vue는 숨김. 의도 확인 후 정렬(문구도 통일).
4. **[2장] STEP-A 이메일 도메인 목록 불일치** — Vue STEP-A=[naver, gmail, yahoo] vs Next 공용=[naver, gmail, daum, nate, hotmail]. yahoo 누락. 목록 정책 합의 후 통일(직접입력으로 우회는 되나 일관성 문제).
5. **[2장] STEP-A 이메일 검증 메시지 축약 + 라이브 체크마크 부재** — Next `ResetPasswordVerifyForm.vEmail`이 빈아이디/빈도메인/형식을 한 메시지로 축약(같은 파일 `FindIdForm`보다도 덜 구체적). userId/name 실시간 검증·체크마크도 없음. 세분화·체크마크 추가로 Vue 동등화.

### P3 — 설계 검토 (회귀 아님, 강화 후보)
6. **[R1] /reset-password 진입 가드 부재** — 양쪽 동일하게 reset 세션 미검증으로 폼 진입 가능. 백엔드 경계 백로그와 묶어 STEP-A 통과 가드 추가 검토.
7. **[R3] 결과 `?output=` PII의 SSR/URL 노출** — Next 서버 컴포넌트 파싱으로 PII가 SSR HTML/로그에 남을 수 있음. 결과 전달을 쿼리 대신 다른 방식(POST 후 세션, 또는 클라 전용 파싱)으로 옮길지 검토.
8. **[3장] 새 비밀번호 규칙 ↔ 회원가입 규칙 일치 여부** — 본 세션 범위 외(signup 미오픈). reset 내부 Vue↔Next는 동일 확인. signup과의 정합성 별도 검증.

---

## 6. 정상 이전(회귀 없음) 확인 항목
- 아이디찾기: 이름/이메일 검증, 인증 발송·확인, 계정 유무 분기, 결과 라우팅 → ✅ 동등.
- STEP-A 본인확인: 엔드포인트(`/reset-password/verify`, `withCredentials`), 성공/실패 라우팅 → ✅ 동등.
- STEP-B 새 비번: 비밀번호 정규식·maxlength·확인 일치·성공/실패 라우팅, 토큰(쿠키) 4분기 백엔드 위임 → ✅ 동등.
- 탭 동기화(URL 쿼리 `?tab=`), 손상 쿼리 try/catch 처리 → ✅ 동등.
