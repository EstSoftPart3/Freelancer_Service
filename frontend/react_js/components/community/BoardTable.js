import { useRouter } from 'next/router'
import BoardTags from './BoardTags'
import styles from './BoardTable.module.css'

export default function BoardTable({ boardList, isQna }) {
  const router = useRouter()
  
  const formatTime = (createdAt) => {
    const date = new Date(createdAt)
    const year = date.getFullYear().toString().slice(-2)
    let month = date.getMonth() + 1
    let day = date.getDate()
    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day
    
    return `${year}-${month}-${day}`
  }
  
  const handleRowClick = (boardSq) => {
    const path = isQna ? `/community/qna/${boardSq}` : `/community/board/${boardSq}`
    router.push(path)
  }
  
  return (
    <div className="table-responsive">
      <table className="table table-hover table-bordered align-middle text-center">
        <thead className="table-light">
          <tr>
            <th className={styles.thWs}>순번</th>
            <th className={styles.thTtl}>제목</th>
            <th className={styles.thWm}>작성자</th>
            <th className={styles.thWl}>등록일</th>
            <th className={styles.thWs}>조회</th>
            <th className={`${styles.thWs} d-none d-md-table-cell`}>댓글</th>
            <th className={`${styles.thWs} d-none d-md-table-cell`}>추천</th>
            {isQna && <th className={styles.thWl}>상태</th>}
          </tr>
        </thead>
        <tbody>
          {boardList && boardList.length > 0 ? (
            boardList.map((board) => (
              <tr key={board.sq} style={{ cursor: 'pointer' }}>
                <td onClick={() => handleRowClick(board.sq)}>{board.sq}</td>
                <td className="text-start px-3" onClick={() => handleRowClick(board.sq)}>
                  <a
                    href={`/community/${isQna ? 'qna' : 'board'}/${board.sq}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleRowClick(board.sq)
                    }}
                  >
                    {board.ttl}
                    {isQna && board.answerCnt > 0 && (
                      <span className="text-grey ml-1 px-2">
                        <i className="fas fa-comment-dots me-1"></i>답변 {board.answerCnt}
                      </span>
                    )}
                  </a>
                  <BoardTags
                    skillTags={board.skillTags || []}
                    normalTags={board.normalTags || []}
                  />
                </td>
                <td onClick={() => handleRowClick(board.sq)}>{board.userNm}</td>
                <td onClick={() => handleRowClick(board.sq)}>{formatTime(board.createdAt)}</td>
                <td onClick={() => handleRowClick(board.sq)}>{board.viewCnt}</td>
                <td className="d-none d-md-table-cell" onClick={() => handleRowClick(board.sq)}>
                  {board.commentCnt}
                </td>
                <td className="d-none d-md-table-cell" onClick={() => handleRowClick(board.sq)}>
                  {board.recommendCnt}
                </td>
                {isQna && (
                  <td onClick={() => handleRowClick(board.sq)}>
                    {board.boardAdoptStatusCd === 1501 && (
                      <span className="badge bg-warning">진행중</span>
                    )}
                    {board.boardAdoptStatusCd === 1502 && (
                      <span className="badge bg-success">채택완료</span>
                    )}
                    {board.boardAdoptStatusCd === 1503 && (
                      <span className="badge bg-secondary">자체해결</span>
                    )}
                    {board.boardAdoptStatusCd === 1504 && (
                      <span className="badge bg-danger">미해결</span>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td className="text-start px-3 text-center" colSpan={isQna ? 8 : 7}>
                게시글이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

