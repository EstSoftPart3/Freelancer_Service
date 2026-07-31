import { type SeedAnswerInput, type SeedPostInput } from '../api/seed-api'

export interface SeedParseResult {
  posts: SeedPostInput[]
  /** 사람이 읽을 수 있는 실패 사유. null 이면 성공. */
  error: string | null
}

/**
 * 외부 AI 가 뱉은 텍스트를 시드 입력으로 바꾼다.
 *
 * 실제 붙여넣기는 깨끗한 JSON 이 아니다. 관대하게 받아준다.
 *  - ```json … ``` 코드펜스를 벗긴다
 *  - 배열 / { "posts": [...] } / 단일 객체를 모두 받는다
 *  - type 의 대소문자를 맞춘다
 *  - 설명 문장이 앞뒤에 붙어 있으면 가장 바깥 대괄호 구간만 잘라 다시 시도한다
 *
 * 대신 형태가 틀리면 <b>몇 번째 항목의 무엇이 문제인지</b>를 알려준다 —
 * "Unexpected token" 만 보여주면 50건짜리 붙여넣기에서 원인을 찾을 수 없다.
 */
export function parseSeedJson(raw: string): SeedParseResult {
  const text = raw?.trim()
  if (!text) {
    return { posts: [], error: 'JSON 을 붙여넣어주세요.' }
  }

  const parsed = tryParse(text)
  if (parsed === undefined) {
    return {
      posts: [],
      error:
        'JSON 형식이 아닙니다. 설명 문장은 지우고 배열([ … ])만 남겨주세요.',
    }
  }

  const rawPosts = extractArray(parsed)
  if (!rawPosts) {
    return {
      posts: [],
      error: 'JSON 최상위가 배열이 아닙니다. [ { … }, { … } ] 형태여야 합니다.',
    }
  }
  if (rawPosts.length === 0) {
    return { posts: [], error: '항목이 0건입니다.' }
  }

  const posts: SeedPostInput[] = []
  for (let i = 0; i < rawPosts.length; i++) {
    const item = rawPosts[i] as Record<string, unknown>
    const label = `${i + 1}번째 항목`

    if (typeof item !== 'object' || item === null) {
      return { posts: [], error: `${label}이 객체가 아닙니다.` }
    }

    const type = String(item.type ?? '').toUpperCase()
    if (type !== 'BOARD' && type !== 'QNA') {
      return {
        posts: [],
        error: `${label}의 type 이 "${item.type ?? ''}" 입니다. BOARD 또는 QNA 여야 합니다.`,
      }
    }

    const title = asText(item.title)
    if (!title) {
      return { posts: [], error: `${label}에 title 이 없습니다.` }
    }
    if (title.length > 100) {
      return {
        posts: [],
        error: `${label}의 제목이 ${title.length}자입니다. 100자 이하여야 합니다.`,
      }
    }

    const body = asText(item.body)
    if (!body) {
      return { posts: [], error: `${label}("${title}")에 body 가 없습니다.` }
    }

    const answers = asAnswers(item.answers)
    if (typeof answers === 'string') {
      return { posts: [], error: `${label}("${title}")의 ${answers}` }
    }

    posts.push({
      type,
      categoryHintCd: asNumber(item.categoryHintCd),
      title,
      body,
      comments: asTexts(item.comments),
      answers: type === 'QNA' ? answers : [],
    })
  }

  return { posts, error: null }
}

/** 코드펜스를 벗기고, 그래도 안 되면 가장 바깥 대괄호 구간만 잘라 다시 시도한다. */
function tryParse(text: string): unknown | undefined {
  const unfenced = text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  for (const candidate of [unfenced, sliceOutermostArray(unfenced)]) {
    if (!candidate) continue
    try {
      return JSON.parse(candidate)
    } catch {
      // 다음 후보로
    }
  }
  return undefined
}

function sliceOutermostArray(text: string): string | null {
  const from = text.indexOf('[')
  const to = text.lastIndexOf(']')
  return from >= 0 && to > from ? text.slice(from, to + 1) : null
}

function extractArray(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed
  if (parsed && typeof parsed === 'object') {
    const posts = (parsed as Record<string, unknown>).posts
    if (Array.isArray(posts)) return posts
    // 한 건만 준 경우도 받아준다
    if ('title' in (parsed as Record<string, unknown>)) return [parsed]
  }
  return null
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asTexts(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map(asText).filter((v) => v.length > 0)
}

function asNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** 성공하면 답변 배열, 실패하면 사유 문자열을 돌려준다. */
function asAnswers(value: unknown): SeedAnswerInput[] | string {
  if (!Array.isArray(value)) return []

  const answers: SeedAnswerInput[] = []
  for (let i = 0; i < value.length; i++) {
    const item = value[i] as Record<string, unknown>
    if (typeof item !== 'object' || item === null) {
      return `answers[${i}] 가 객체가 아닙니다.`
    }
    const title = asText(item.title)
    // answer_ttl 은 NOT NULL 이라 서버가 거절한다. 여기서 먼저 잡아준다.
    if (!title) return `answers[${i}] 에 title 이 없습니다. (답변에도 제목이 필요합니다)`
    const body = asText(item.body)
    if (!body) return `answers[${i}] 에 body 가 없습니다.`

    answers.push({ title, body, comments: asTexts(item.comments) })
  }
  return answers
}
