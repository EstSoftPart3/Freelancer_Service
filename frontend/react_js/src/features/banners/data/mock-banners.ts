import bannerImg1 from '@/assets/FObanner1.png'
import bannerImg2 from '@/assets/FObanner2.png'
import type { Banner } from './schema'

export const INITIAL_MOCK_BANNERS: Banner[] = [
  {
    bannerSq: 1,
    bannerTitle: '생각을 뒤집다, 세상을 바꾼다',
    bannerImageUrl: bannerImg1,
    displayOrder: 1,
    startDtm: '2025-01-01T00:00:00',
    endDtm: '2025-12-31T23:59:59',
    isActive: true,
    bannerClickCount: 1284,
    bannerLinkUrl: '/',
  },
  {
    bannerSq: 2,
    bannerTitle: '경계를 허물다, 미래를 그리다',
    bannerImageUrl: bannerImg2,
    displayOrder: 2,
    startDtm: '2025-03-01T00:00:00',
    endDtm: '2025-12-31T23:59:59',
    isActive: true,
    bannerClickCount: 956,
    bannerLinkUrl: '/projects',
  },
  {
    bannerSq: 3,
    bannerTitle: '참신함이 만나는 곳 | CREATIVE UNION',
    bannerImageUrl: '',
    displayOrder: 3,
    startDtm: '2024-06-01T00:00:00',
    endDtm: '2024-12-31T23:59:59',
    isActive: false,
    bannerClickCount: 412,
    bannerLinkUrl: '/community',
  },
]
