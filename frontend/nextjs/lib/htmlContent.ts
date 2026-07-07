// Quill 에디터가 저장한 게시글 본문 HTML을 렌더 직전에 후처리한다.
// 스킴 없는 링크(예: www.example.com)를 Quill이 그대로 href에 넣으면 브라우저가 현재
// 도메인의 하위 경로로 해석해 404가 난다. 여기서 절대 URL로 교정하고, 외부 링크는
// 새 탭 + noopener/noreferrer로 열리도록 한다.
export function enhanceBoardHtml(html: string): string {
  if (typeof window === 'undefined' || !html) return html

  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    if (!href) return

    const isInternal = href.startsWith('/') || href.startsWith('#')
    const hasScheme = /^([a-z][a-z0-9+.-]*:)/i.test(href) // http:, https:, mailto:, tel: 등

    if (!isInternal && !hasScheme) {
      a.setAttribute('href', `https://${href}`)
    }

    if (!isInternal) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
    }
  })

  return doc.body.innerHTML
}
