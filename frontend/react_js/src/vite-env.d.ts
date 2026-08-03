/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 백엔드 API 베이스 URL. 미설정 시 http://localhost:8080/api.
   * 운영 배포는 '/api'(nginx 프록시, same-origin)를 쓴다 — src/lib/api.ts 참고.
   */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
