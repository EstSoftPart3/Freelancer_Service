// API 오류에서 사용자에게 보여줄 메시지를 뽑아낸다.
//
// 이 프로젝트의 백엔드는 실패를 두 가지 방식으로 알린다.
//  1) HTTP 4xx/5xx + 바디 { message }
//  2) HTTP 200 + 바디 { status: "BAD_REQUEST" | "UNAUTHORIZED" | ..., message }
//     (ApiResponse 를 ResponseEntity 없이 그대로 반환하는 컨트롤러들)
//
// 2번은 lib/api.ts 의 성공 인터셉터가 reject 로 바꾸므로, 화면에서는 둘 다 catch 로 들어온다.
// 그때 err 를 그냥 버리면 "비밀번호가 일치하지 않습니다" 같은 서버 메시지가 통째로 사라진다.

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  if (message) return message

  // 인터셉터가 만든 Error 는 message 에 서버 문구를 담고 있다.
  const plain = (err as { message?: string })?.message
  if (plain && !/^(Network Error|Request failed with status code)/.test(plain)) return plain

  return fallback
}
