# 브랜딩 이미지 (Ctrl + F)

여기에 넣으면 된다. 파일명은 아래 그대로 쓸 것.

| 파일명 | 규격 | 쓰이는 곳 |
|---|---|---|
| `logo-horizontal.svg` (또는 `.png`) | 높이 36px 기준 / PNG면 72px 이상 | 헤더·푸터 로고 |
| `brand-logo.png` | 512×512 정사각, 투명배경 | JSON-LD 조직 로고, favicon·apple-icon 파생 |
| `og-image.png` | 1200×630 | 카카오톡·슬랙 링크 미리보기 |

## 넣은 뒤 해야 할 일

1. `lib/seo.ts` 의 `BRAND_LOGO_PATH` 를 `/img/brand/brand-logo.png` 로 변경
2. `components/common/CommonHeader.tsx` 의 텍스트 로고(2곳)를 `<img>` 로 교체
   — 헤더 높이가 64px 고정이라 로고는 36~40px 안에 들어가야 한다
3. `components/common/CommonFooter.tsx` 의 `<strong>Ctrl + F</strong>` 교체
4. `app/icon.tsx` / `app/apple-icon.tsx` / `app/opengraph-image.tsx` 의 임시 마크 교체
5. `app/favicon.ico` 교체
