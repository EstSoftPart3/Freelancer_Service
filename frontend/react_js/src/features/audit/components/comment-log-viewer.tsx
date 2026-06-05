import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

interface CommentLogViewerProps {
  data: any
}

export function CommentLogViewer({ data }: CommentLogViewerProps) {
  if (!data) return <div className="text-muted-foreground p-4 text-sm">데이터가 없습니다.</div>

  // JSON 파싱
  let parsedData = data
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data)
    } catch (e) {
      return (
        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="p-4 text-sm whitespace-pre-wrap">
            {data}
          </CardContent>
        </Card>
      )
    }
  }

  // 삭제된 경우의 상태 처리
  if (parsedData.status === 'DELETED') {
    return (
      <Card className="bg-red-50/50 border-red-100 shadow-sm">
        <CardContent className="p-4 flex items-center text-red-600 text-sm font-medium">
          삭제된 댓글입니다. (댓글 번호: {parsedData.commentSq})
        </CardContent>
      </Card>
    )
  }

  const content = parsedData['내용'] || parsedData.commentDescriptionTxt || parsedData.content || '-'

  return (
    <Card className="shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-start gap-3">
        <MessageSquare size={18} className="text-orange-500 mt-0.5 shrink-0" />
        <div className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 w-full break-all bg-gray-50/50 p-3 rounded-md">
          {content}
        </div>
      </CardContent>
    </Card>
  )
}
