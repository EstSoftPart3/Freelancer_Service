// Quill 에디터가 저장한 게시글 본문 HTML을 렌더 후 후처리한다.
// 스킴 없는 링크(예: www.example.com)를 Quill이 그대로 href에 넣으면 브라우저가 현재
// 도메인의 하위 경로로 해석해 404가 난다. 여기서 절대 URL로 교정하고, 외부 링크는
// 새 탭 + noopener/noreferrer로 열리도록 한다.
// 문자열 가공이 아닌 마운트된 DOM 직접 수정(in-place) 방식인 이유: 본문이 SSR로
// 초기 HTML에 포함되면서, 문자열을 서버/클라이언트가 다르게 가공하면 hydration mismatch가 난다.
// 서버는 원본을 그대로 렌더하고 hydration 후 effect에서 이 함수로 링크만 교정한다.
export function enhanceBoardLinksInPlace(root: HTMLElement): void {
  root.querySelectorAll('a[href]').forEach((a) => {
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
}
