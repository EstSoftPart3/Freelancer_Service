# 광고 배너 이미지

메인 캐러셀(`components/main/MainPage.tsx` 의 `SLIDES`)에 들어간다.

| 파일명 | 규격 |
|---|---|
| `ad-1.png` ~ `ad-3.png` | 가로형 배너. 캐러셀이 `h-[64vh]` 라 **1920×720 내외** 권장 (16:6 전후) |

`object-cover` 로 잘리므로 중요한 내용은 가운데에 둘 것.
클릭 시 이동할 링크는 `MainPage.tsx` 의 `SLIDES[].linkUrl` 에 적는다.
