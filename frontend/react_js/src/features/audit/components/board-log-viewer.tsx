import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Type } from 'lucide-react'

interface BoardLogViewerProps {
  data: any
}

export function BoardLogViewer({ data }: BoardLogViewerProps) {
  if (!data) return <div className="text-muted-foreground p-4 text-sm">데이터가 없습니다.</div>

  // JSON 파싱 (데이터가 문자열로 넘어올 수 있음)
  let parsedData = data
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data)
    } catch (e) {
      // 파싱 실패 시 원본 문자열 렌더링
      return (
        <Card className="shadow-sm border-t-4 border-t-green-600">
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
          삭제된 게시글입니다. (게시글 번호: {parsedData.boardSq})
        </CardContent>
      </Card>
    )
  }

  const title = parsedData['제목'] || parsedData.boardTtl || parsedData.title || '-'
  const content = parsedData['내용'] || parsedData.boardDescriptionEdt || parsedData.content || '-'

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-green-600 shadow-sm">
        <CardHeader className="py-3 bg-muted/20 border-b">
          <CardTitle className="text-md flex items-center gap-2">
            <Type size={18} className="text-green-600" />
            <span className="font-bold truncate">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <FileText size={16} className="text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 w-full break-all">
              {content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
