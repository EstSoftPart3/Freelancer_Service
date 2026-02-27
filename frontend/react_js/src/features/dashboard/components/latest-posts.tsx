const posts = [
  {
    id: 1,
    title: '리액트 스터디 모집합니다',
    name: 'kim**',
    comments: 5,
    time: '09:55',
  },
  {
    id: 2,
    title: '포트폴리오 피드백 부탁드려요',
    name: 'lee**',
    comments: 3,
    time: '09:40',
  },
  {
    id: 3,
    title: '프리랜서 단가 어떻게 책정하나요?',
    name: 'park**',
    comments: 12,
    time: '09:20',
  },
  {
    id: 4,
    title: '협업 툴 추천해주세요',
    name: 'choi**',
    comments: 7,
    time: '08:55',
  },
  {
    id: 5,
    title: '백엔드 개발자 구합니다',
    name: 'jung**',
    comments: 2,
    time: '08:30',
  },
]

export function LatestPosts() {
  return (
    <div className='space-y-8'>
      {posts.map((post) => (
        <div key={post.id} className='flex flex-1 flex-wrap justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>{post.title}</p>
            <div className='flex items-center gap-4'>
              <p className='text-sm text-muted-foreground'>{post.name}</p>
              <p className='text-sm text-muted-foreground'>
                댓글: {post.comments}
              </p>
            </div>
          </div>
          <div className='font-medium text-muted-foreground'>{post.time}</div>
        </div>
      ))}
    </div>
  )
}
