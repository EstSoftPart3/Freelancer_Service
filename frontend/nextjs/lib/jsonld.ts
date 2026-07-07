// Schema.org JSON-LD 빌더 — components/seo/JsonLd.tsx로 렌더한다.
// 원칙: 소스에 없는 값은 지어내지 않고 생략한다(잘못된 구조화 데이터는 없느니만 못함).
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, stripHtmlToExcerpt } from '@/lib/seo'
import type { BoardDetail, ProjectDetail } from '@/types'

const ORGANIZATION = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/img/logos/Company_logo.png`,
} as const

export function organizationJsonLd() {
  return { '@context': 'https://schema.org', ...ORGANIZATION }
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'ko',
  }
}

// 일반 게시글·공지 상세 — dateModified는 응답에 수정일 필드가 없어 생략
export function articleJsonLd(board: BoardDetail, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: board.ttl,
    description: stripHtmlToExcerpt(board.description),
    author: { '@type': 'Person', name: board.userNm },
    datePublished: board.createdAt,
    publisher: ORGANIZATION,
    mainEntityOfPage: `${SITE_URL}${path}`,
    inLanguage: 'ko',
  }
}

// QnA 상세 — QAPage는 답변 '본문'이 필수인데 상세 응답의 answers(AnswerSummary)에는
// 제목뿐이라 사용 불가. 백엔드가 답변 본문을 내려주면 QAPage로 승격할 것.
export function discussionForumPostingJsonLd(board: BoardDetail, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: board.ttl,
    text: stripHtmlToExcerpt(board.description, 500),
    author: { '@type': 'Person', name: board.userNm },
    datePublished: board.createdAt,
    url: `${SITE_URL}${path}`,
    commentCount: board.commentCnt,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: board.viewCnt,
    },
    inLanguage: 'ko',
  }
}

// 프로젝트 공고 — 구글 채용 리치결과(JobPosting) 대응.
// projectSalary는 원(KRW) 단위 월 단가(백엔드 formatSalary 참조). 협의(0/null)면 baseSalary 생략.
export function jobPostingJsonLd(project: ProjectDetail, path: string) {
  const isRemote = project.projectWorkType?.some((t) => /원격|재택|리모트/.test(t)) ?? false
  const streetAddress = [project.detailedAddress, project.detailedAddressDetail]
    .filter(Boolean)
    .join(' ')
    .trim()
  const hasSalary = project.salaryNegotiableYn !== 'Y' && (project.projectSalary ?? 0) > 0

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: project.projectTtl,
    description: stripHtmlToExcerpt(project.projectDetail, 5000),
    datePosted: project.projectCreatedDt,
    validThrough: project.projectRecruitEndDt,
    employmentType: 'CONTRACTOR',
    hiringOrganization: {
      '@type': 'Organization',
      name: project.companyNm,
      ...(project.companyImageUrl ? { logo: project.companyImageUrl } : {}),
    },
    ...(streetAddress
      ? {
          jobLocation: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', streetAddress, addressCountry: 'KR' },
          },
        }
      : {}),
    ...(isRemote
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: { '@type': 'Country', name: '대한민국' },
        }
      : {}),
    ...(hasSalary
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'KRW',
            value: { '@type': 'QuantitativeValue', value: project.projectSalary, unitText: 'MONTH' },
          },
        }
      : {}),
    url: `${SITE_URL}${path}`,
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
