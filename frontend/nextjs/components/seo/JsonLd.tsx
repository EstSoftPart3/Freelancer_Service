// Schema.org JSON-LD를 초기 HTML에 삽입하는 서버 컴포넌트.
// '<' 이스케이프 필수: 게시글 본문 유래 문자열에 '</script>'가 들어오면 태그가 조기 종료돼 XSS가 된다.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
