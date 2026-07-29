import api from '@/lib/api'

/** 백엔드 NicknamePolicy와 같은 규칙 — 한글·영문·숫자·밑줄 2~20자 */
export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9_]{2,20}$/
export const NICKNAME_HINT = '한글·영문·숫자·밑줄 2~20자'

/** 형식만 검사한다. 통과하면 빈 문자열, 아니면 사용자에게 보여줄 사유. */
export function validateNicknameFormat(value: string): string {
  if (!value) return '닉네임을 입력해주세요.'
  if (!NICKNAME_PATTERN.test(value)) return `닉네임은 ${NICKNAME_HINT}로 입력해주세요.`
  return ''
}

/**
 * 형식 검사 후 서버 중복 확인까지. 사용 가능하면 빈 문자열, 아니면 사유를 돌려준다.
 * `/check-nickname`은 ApiResponse 래핑이라 HTTP는 항상 200 — body의 output/message를 봐야 한다.
 */
export async function checkNicknameAvailable(value: string): Promise<string> {
  const formatError = validateNicknameFormat(value)
  if (formatError) return formatError

  try {
    const { data } = await api.get<{ status: string; message: string; output: boolean }>(
      `/check-nickname?userNickname=${encodeURIComponent(value)}`,
    )
    return data?.output ? '' : (data?.message ?? '이미 사용 중인 닉네임입니다.')
  } catch {
    return '서버 오류가 발생했습니다.'
  }
}
