// [Freelancer Service] 공지사항 관련
import { faker } from '@faker-js/faker'

// 일관된 데이터 생성을 위해 시드 설정
faker.seed(12345)

export const notices = Array.from({ length: 100 }, (_, i) => {
  return {
    // 번호: 역순으로 생성 (최신순 느낌)
    sq: 100 - i,
    // 제목: 공지사항 느낌이 나도록 문장 생성
    title: `[공지] ${faker.lorem.sentence({ min: 3, max: 8 })}`,
    // 본문: 상세 모달에서 보여줄 긴 텍스트
    content: faker.lorem.paragraphs({ min: 2, max: 4 }),
    // 작성자: 관리자 이름
    userNm: faker.person.fullName(),
    // 조회수: 0 ~ 1000 사이
    viewCnt: faker.number.int({ min: 0, max: 1000 }),
    // 추천수: 0 ~ 100 사이
    recommendCnt: faker.number.int({ min: 0, max: 100 }),
    // 댓글수: 0 ~ 20 사이
    commentCnt: faker.number.int({ min: 0, max: 20 }),
    // 등록일시: 과거 날짜를 ISO 문자열로 변환
    createdAt: faker.date.past().toISOString(),
  }
})

export type Notice = (typeof notices)[0]
