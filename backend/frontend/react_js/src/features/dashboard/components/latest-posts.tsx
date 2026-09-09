interface latestPostsDataProps {
  id: number
  title: string
  name: string
  comments: number
  time: string
}

interface LatestPostsProps {
  data: latestPostsDataProps[]
}

export function LatestPosts({ data }: LatestPostsProps) {
  return (
    <div className='space-y-8'>
      {data.map((post) => (
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
