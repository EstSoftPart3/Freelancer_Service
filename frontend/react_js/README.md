# React + Next.js 프로젝트

Vue 프로젝트를 React + Next.js로 마이그레이션한 프로젝트입니다.

## 🚀 시작하기

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
개발 서버는 http://localhost:8504 에서 실행됩니다.

### 3. 프로덕션 빌드
```bash
npm run build
npm start
```

---

## 📁 프로젝트 구조 (Next.js 정석)

```
react_js/
├── pages/                      # Next.js 페이지 (파일 기반 라우팅)
│   ├── _app.js                 # 모든 페이지의 wrapper
│   ├── _document.js            # HTML 문서 설정
│   ├── index.js                # 메인 페이지 (/)
│   ├── index.module.css        # 메인 페이지 CSS Module
│   └── auth/
│       ├── login.js            # /auth/login
│       ├── login.module.css
│       └── signup.js           # /auth/signup
│
├── components/                 # 재사용 컴포넌트
│   ├── common/
│   │   ├── CommonHeader.js
│   │   ├── CommonHeader.module.css
│   │   ├── CommonFooter.js
│   │   ├── CommonAlert.js
│   │   └── CommonPageHeader.js
│   ├── auth/
│   │   ├── PersonalSignUpForm.js
│   │   ├── PersonalSignUpForm.module.css
│   │   ├── CompanySignUpForm.js
│   │   └── CompanyVerificationModal.js
│   └── map/
│       ├── MapComponent.js
│       ├── MapComponent.module.css
│       ├── MapFilterComponent.js
│       └── LocationSelectModal.js
│
├── contexts/                   # Context API (전역 상태)
│   ├── AuthContext.js          # 인증 상태 (Vue의 userStore)
│   └── AlertContext.js         # 알림 상태 (Vue의 alertStore)
│
├── lib/                        # 유틸리티
│   ├── axios.js                # API 설정
│   ├── terms.js                # 약관 텍스트
│   └── skillIconMap.js         # 스킬 아이콘 매핑
│
└── public/                     # 정적 파일
    ├── favicon.ico
    ├── css/                    # Porto 템플릿 CSS
    ├── js/                     # Porto 템플릿 JS
    ├── vendor/                 # 외부 라이브러리
    ├── img/                    # 이미지
    └── assets/
        └── banners/
```

---

## 🔧 기술 스택

### **프레임워크**
- **React 18.3** - UI 라이브러리
- **Next.js 14.2** - React 프레임워크 (Pages Router)

### **상태 관리**
- **Context API** - 전역 상태 (Pinia 대체)
  - AuthContext (로그인 유저)
  - AlertContext (알림 메시지)

### **스타일링**
- **CSS Module** - 컴포넌트별 스타일 (`.module.css`)
- **Porto Template** - 프로페셔널 UI/UX 템플릿
- **Bootstrap 5.3** - CSS 프레임워크

### **라이브러리**
- **Axios 1.9** - HTTP 클라이언트
- **FullCalendar** - 캘린더
- **React Quill** - 리치 텍스트 에디터
- **React Datepicker** - 날짜 선택기
- **date-fns** - 날짜 유틸리티
- **lodash** - 유틸리티 함수

---

## 🎨 디자인 시스템

### **Porto Template**
- Professional Business HTML Template
- jQuery 기반 컴포넌트
- 반응형 디자인
- Font Awesome 아이콘

### **CSS 아키텍처**
1. **Global CSS** - Porto 템플릿 (`public/css/`)
2. **CSS Module** - 컴포넌트 스타일 (`.module.css`)

---

## 📝 주요 기능

### **인증 시스템**
- JWT (Access Token + Refresh Token)
- 자동 로그인
- 아이디 저장
- 소셜 로그인 준비

### **사용자 타입**
- PERSONAL (개인 회원)
- COMPANY (기업 회원)

### **Context API**
- **AuthContext** - 로그인 유저 정보, 인증 상태
- **AlertContext** - 알림 메시지 (성공/실패)

### **API 프록시**
- `/api/*` → `http://localhost:8080/api/*`

---

## 🔄 Vue에서 React로 마이그레이션

### **변경 사항**
| Vue | React |
|-----|-------|
| **Pinia** | Context API |
| **Vue Router** | Next.js Pages Router |
| **vue-quill** | react-quill |
| **vue3-datepicker** | react-datepicker |
| **bootstrap-vue-3** | react-bootstrap |
| **ref(), reactive()** | useState() |
| **onMounted()** | useEffect() |
| **computed()** | useMemo() |
| **`<style scoped>`** | CSS Module |

### **동일한 부분**
- ✅ Axios 설정 (JWT 토큰 관리)
- ✅ Porto 템플릿 디자인
- ✅ API 엔드포인트
- ✅ 비즈니스 로직

---

## 📌 폴더 역할 설명

### **pages/** - Next.js 라우팅 (필수)
- 파일 구조 = URL 구조
- `pages/index.js` → `/`
- `pages/auth/login.js` → `/auth/login`
- `_app.js` - 전역 설정, Provider 등록
- `_document.js` - HTML head/body 설정

### **components/** - 재사용 컴포넌트 (필수)
- 각 컴포넌트마다 `.module.css` 파일
- common, auth, map 등 도메인별 분류

### **contexts/** - 전역 상태 관리 (필수)
- Vue의 Pinia stores를 Context API로 대체
- AuthContext = userStore
- AlertContext = alertStore

### **lib/** - 유틸리티 (필수)
- axios 설정 (API 호출)
- 공통 상수, 유틸 함수

### **public/** - 정적 파일 (필수)
- Porto 템플릿 (css, js, vendor)
- 이미지, favicon
- URL: `/public/img/logo.png` → `/img/logo.png`

---

## 🎯 CSS 사용 규칙

### **1. Global CSS** - Porto 템플릿
```javascript
// pages/_document.js
<link rel="stylesheet" href="/css/theme.css" />
```

### **2. CSS Module** - 컴포넌트별
```javascript
// Component.js
import styles from './Component.module.css'
<div className={styles.container}>...</div>
```

### **3. Bootstrap 클래스** - 그대로 사용
```javascript
<div className="container">
  <button className="btn btn-primary">버튼</button>
</div>
```

---

## 🔑 환경 변수

- **개발 서버 포트:** 8504
- **백엔드 API:** http://localhost:8080
- **API Proxy:** `/api` → `http://localhost:8080/api`

---

## 📚 참고 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Porto Template](https://themeforest.net/item/porto-responsive-html5-template/)
- [CSS Modules](https://github.com/css-modules/css-modules)

---

## 🐛 트러블슈팅

### 무한 API 호출 문제
- `useEffect` dependency를 빈 배열 `[]`로 설정
- Context 함수를 `useCallback`으로 감싸기

### CSS가 적용 안 됨
- Global CSS는 `_document.js` 또는 `_app.js`에서만 import
- Component CSS는 CSS Module 사용

### Favicon 안 바뀜
- 브라우저 캐시 삭제 (Ctrl+Shift+R)
- `public/favicon.ico` 파일 확인

---

## ✨ 완성된 페이지

- ✅ 메인 페이지 (배너, 지도, 인기 프로젝트, FAQ)
- ✅ 로그인 페이지 (개인/기업 토글, 소셜 로그인)
- ✅ 회원가입 페이지 (개인/기업, 이메일 인증, 기업 인증)
- ✅ Header (로그인/비로그인 메뉴)
- ✅ Footer
- ✅ Alert 시스템
