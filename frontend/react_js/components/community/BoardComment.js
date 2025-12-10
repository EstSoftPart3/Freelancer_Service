import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import ReportModal from './ReportModal'
import styles from './BoardComment.module.css'

export default function BoardComment({ comments = [], boardSq, boardType, onRefresh }) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [newComment, setNewComment] = useState('')
  const [editSq, setEditSq] = useState(null)
  const [editDescription, setEditDescription] = useState('')
  
  // 대댓글 관련 상태
  const [showReplyForm, setShowReplyForm] = useState(null)
  const [replyDescription, setReplyDescription] = useState('')
  const [editReplySq, setEditReplySq] = useState(null)
  const [editReplyDescription, setEditReplyDescription] = useState('')
  const [commentReplies, setCommentReplies] = useState({})
  
  // 신고 모달 상태
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTarget, setReportTarget] = useState({ typeCd: null, sq: null })
  
  const viewerSq = user?.userSq || null
  
  // 대댓글 목록 구성
  useEffect(() => {
    console.log('댓글 데이터:', comments)
    const replies = {}
    comments.forEach(comment => {
      // Vue에서는 comment.replies 사용, 둘 다 지원
      const replyList = comment.replyComments || comment.replies || []
      console.log(`댓글 ${comment.sq}의 대댓글:`, replyList)
      if (Array.isArray(replyList)) {
        replies[comment.sq] = replyList
      }
    })
    setCommentReplies(replies)
    console.log('최종 대댓글 목록:', replies)
  }, [comments])
  
  // 날짜 포맷
  const formatTime = (createdAt) => {
    if (!createdAt) return ''
    const date = new Date(createdAt)
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    
    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day
    if (hour < 10) hour = '0' + hour
    if (minute < 10) minute = '0' + minute
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
  
  // 댓글 등록
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    if (!newComment.trim()) {
      showAlert('댓글을 입력해주세요.', 'danger')
      return
    }
    
    try {
      const response = await api.$post(`/comment`, {
        boardSq: Number(boardSq), // 문자열 → 숫자 변환
        answerSq: null,
        description: newComment.trim()
      })
      if (response.status === 'CREATED' || response.status === 'OK') {
        showAlert(response.message || '댓글이 등록되었습니다.', 'success')
        setNewComment('')
        onRefresh()
      } else {
        showAlert('댓글 등록에 실패했습니다.', 'danger')
      }
    } catch (error) {
      console.error('댓글 등록 에러:', error)
      showAlert('댓글 등록에 실패했습니다.', 'danger')
    }
  }
  
  // 댓글 수정 모드
  const clickEdit = (commentSq, description) => {
    setEditSq(commentSq)
    setEditDescription(description)
  }
  
  // 댓글 수정 제출
  const editRegisterConfirm = async (e, commentSq) => {
    e.preventDefault()
    
    if (!editDescription || editDescription.trim() === '') {
      showAlert('내용을 입력해주세요.', 'danger')
      return
    }
    
    try {
      const requestData = {
        userSq: viewerSq,
        description: editDescription.trim()
      }
      
      console.log('댓글 수정 요청:')
      console.log('- commentSq:', commentSq)
      console.log('- viewerSq:', viewerSq)
      console.log('- description:', editDescription.trim())
      console.log('- 전송 데이터:', JSON.stringify(requestData))
      
      const response = await api.$put(`/comment/${commentSq}`, requestData)
      
      console.log('댓글 수정 응답:', response)
      
      if (response.status === 'OK') {
        showAlert(response.message || '댓글이 수정되었습니다.', 'success')
        setEditSq(null)
        setEditDescription('')
        onRefresh()
      } else {
        showAlert('댓글 수정에 실패했습니다.', 'danger')
      }
    } catch (error) {
      console.error('댓글 수정 에러:', error)
      console.error('에러 응답:', error.response?.data)
      showAlert(error.response?.data?.message || '댓글 수정에 실패했습니다.', 'danger')
    }
  }
  
  // 댓글 삭제
  const openDeleteConfirm = async (commentSq) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    
    try {
      const response = await api.$patch(`/comment/${commentSq}`)
      if (response.status === 'OK') {
        showAlert('댓글이 삭제되었습니다.', 'success')
        onRefresh()
      } else {
        showAlert('댓글 삭제에 실패했습니다.', 'danger')
      }
    } catch (error) {
      showAlert('댓글 삭제에 실패했습니다.', 'danger')
    }
  }
  
  // 댓글 추천
  const rcmndComment = async (commentSq) => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    try {
      const response = await api.$post(`/comment/${commentSq}/recommend`)
      if (response.status === 'OK') {
        showAlert(response.message, 'success')
        onRefresh()
      } else {
        showAlert('추천 반영에 실패했습니다.', 'danger')
      }
    } catch (error) {
      showAlert('추천 반영에 실패했습니다.', 'danger')
    }
  }
  
  // 댓글 신고
  const clickReportApplication = (commentSq) => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    setReportTarget({ typeCd: 2003, sq: commentSq })
    setShowReportModal(true)
  }
  
  // 대댓글 작성
  const createReply = async (e, commentSq) => {
    e.preventDefault()
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    if (!replyDescription.trim()) {
      showAlert('내용을 입력해주세요.', 'danger')
      return
    }
    
    try {
      const response = await api.$post('/reply', {
        commentSq: Number(commentSq),
        boardSq: Number(boardSq),
        description: replyDescription.trim()
      })
      
      if (response.status === 'CREATED') {
        showAlert(response.message, 'success')
        setReplyDescription('')
        setShowReplyForm(null)
        onRefresh()
      }
    } catch (error) {
      showAlert('대댓글 등록에 실패하였습니다.', 'danger')
    }
  }
  
  // 대댓글 수정 모드
  const clickEditReply = (replyCommentSq, description) => {
    setEditReplySq(replyCommentSq)
    setEditReplyDescription(description)
  }
  
  // 대댓글 수정 제출
  const editReplyConfirm = async (e, replyCommentSq) => {
    e.preventDefault()
    if (!editReplyDescription.trim()) {
      showAlert('내용을 입력해주세요.', 'danger')
      return
    }
    
    try {
      // Vue와 동일하게 query parameter로 전달
      const params = new URLSearchParams()
      params.append('description', editReplyDescription)
      const response = await api.$put(`/reply/${replyCommentSq}?${params.toString()}`)
      
      if (response.status === 'OK') {
        showAlert(response.message || '대댓글이 수정되었습니다.', 'success')
        setEditReplySq(null)
        setEditReplyDescription('')
        onRefresh()
      }
    } catch (error) {
      showAlert('대댓글 수정에 실패했습니다.', 'danger')
    }
  }
  
  // 대댓글 삭제
  const deleteReply = async (replyCommentSq) => {
    if (!confirm('대댓글을 삭제하시겠습니까?')) return
    
    try {
      const response = await api.$patch(`/reply/${replyCommentSq}`)
      if (response.status === 'OK') {
        showAlert('대댓글이 삭제되었습니다.', 'success')
        onRefresh()
      }
    } catch (error) {
      showAlert('대댓글 삭제에 실패했습니다.', 'danger')
    }
  }
  
  // 대댓글 추천
  const rcmndReply = async (replyCommentSq) => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    
    try {
      const response = await api.$post(`/reply/${replyCommentSq}/recommend`)
      if (response.status === 'OK') {
        showAlert(response.message, 'success')
        onRefresh()
      }
    } catch (error) {
      showAlert('대댓글 추천에 실패하였습니다.', 'danger')
    }
  }
  
  // 대댓글 신고
  const clickReportReply = (replyCommentSq) => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    setReportTarget({ typeCd: 2004, sq: replyCommentSq })
    setShowReportModal(true)
  }
  
  return (
    <div>
      <div className="post-comments mt-5 post-comments">
        <h4 className={`mb-3 ${styles.fontSize15}`}>댓글 ({comments.length})</h4>
        <ul className="comments">
          {comments.map((comment) => (
            <li key={comment.sq}>
              <div className="comment">
                <div className={`img-thumbnail img-thumbnail-no-borders d-none d-sm-block ${styles.thumbWrapper}`}>
                  {comment.userProfileImgUrl ? (
                    <img
                      className="avatar object-fit-cover"
                      alt=""
                      src={comment.userProfileImgUrl}
                    />
                  ) : (
                    <div className={`rounded-circle ${styles.commentProfile}`}>
                      <i className="fas fa-user text-muted"></i>
                    </div>
                  )}
                </div>
                <div className={`comment-block ${styles.fontSize12}`}>
                  <div className="comment-arrow"></div>
                  {/* 이름 + 버튼 */}
                  {editSq !== comment.sq && (
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className={`comment-by text-primary ${styles.fontSize13}`}>
                        <strong>{comment.userNm}</strong>
                      </span>
                      {/* 작성자 본인 */}
                      {comment.userSq === viewerSq ? (
                        <span className="comment-icons d-flex">
                          <button
                            className={`text-danger me-2 ${styles.fontSize10}`}
                            onClick={() => clickEdit(comment.sq, comment.description)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <span className="ms-2 text-primary">수정</span>
                          </button>
                          <button
                            className={`text-danger ${styles.fontSize10}`}
                            onClick={() => openDeleteConfirm(comment.sq)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <span className="ms-2 text-primary">삭제</span>
                          </button>
                        </span>
                      ) : (
                        /* 다른 사람 */
                        <span className="comment-icons d-flex">
                          <button
                            className={`text-danger me-2 ${styles.fontSize10}`}
                            onClick={() => rcmndComment(comment.sq)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <span className="ms-2 text-primary">
                              추천 {comment.recommendCnt || 0}
                            </span>
                          </button>
                          <button
                            className={`text-danger ${styles.fontSize10}`}
                            onClick={() => clickReportApplication(comment.sq)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <span className="ms-2 text-primary">신고</span>
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* 내용 */}
                  {editSq !== comment.sq ? (
                    <p className={styles.fontSize12}>{comment.description}</p>
                  ) : (
                    <form onSubmit={(e) => editRegisterConfirm(e, comment.sq)}>
                      <div className="input-group">
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          type="text"
                          maxLength="5000"
                          className="form-control"
                          placeholder="댓글을 입력해주세요"
                          required
                        />
                        <button type="submit" className="btn btn-primary">
                          댓글 수정
                        </button>
                      </div>
                    </form>
                  )}
                  
                  {/* 날짜 */}
                  {editSq !== comment.sq && (
                    <span className={`date float-end ${styles.fontSize11}`}>
                      {formatTime(comment.createdAt)}
                    </span>
                  )}
                  
                  {/* 대댓글 달기 버튼 */}
                  {editSq !== comment.sq && (
                    <div className="mt-2 mb-2" style={{ clear: 'both' }}>
                      {showReplyForm !== comment.sq ? (
                        <button
                          onClick={() => setShowReplyForm(comment.sq)}
                          className={`btn btn-link btn-sm p-0 text-primary ${styles.fontSize11}`}
                          style={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          대댓글 달기
                        </button>
                      ) : null}
                    </div>
                  )}
                  
                  {/* 대댓글 목록 */}
                  {commentReplies[comment.sq] && commentReplies[comment.sq].length > 0 && (
                    <ul className="comments replies">
                      {commentReplies[comment.sq].map((reply) => {
                        const replyCreatedAt =
                          reply.replyCommentCreatedAtDtm ||
                          reply.replyCommentCreatedAt ||
                          reply.createdAt ||
                          null

                        return (
                        <li key={reply.replyCommentSq}>
                          <div className="comment">
                            <div className={`img-thumbnail img-thumbnail-no-borders d-none d-sm-block ${styles.thumbWrapper}`}>
                              <div className={`rounded-circle ${styles.replyProfile}`}>
                                <i className="fas fa-user text-muted"></i>
                              </div>
                            </div>
                            <div className={`comment-block ${styles.fontSize12}`}>
                              <div className="comment-arrow"></div>
                              {editReplySq !== reply.replyCommentSq && (
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className={`comment-by text-primary ${styles.fontSize13}`}>
                                    <i className="fas fa-level-up-alt fa-rotate-90 me-2" style={{ fontSize: '0.8rem', opacity: 0.6 }}></i>
                                    <strong>{reply.userNm}</strong>
                                  </span>
                                  {reply.userSq === viewerSq ? (
                                    <span className="comment-icons d-flex">
                                      <button
                                        onClick={() => clickEditReply(reply.replyCommentSq, reply.replyCommentDescriptionTxt)}
                                        className={`text-danger me-2 ${styles.fontSize10}`}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                      >
                                        <span className="ms-2 text-primary">수정</span>
                                      </button>
                                      <button
                                        onClick={() => deleteReply(reply.replyCommentSq)}
                                        className={`text-danger ${styles.fontSize10}`}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                      >
                                        <span className="ms-2 text-primary">삭제</span>
                                      </button>
                                    </span>
                                  ) : (
                                    <span className="comment-icons d-flex">
                                      <button
                                        onClick={() => rcmndReply(reply.replyCommentSq)}
                                        className={`text-danger me-2 ${styles.fontSize10}`}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                      >
                                        <span className="ms-2 text-primary">
                                          추천 {reply.replyCommentRecommendCnt || 0}
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => clickReportReply(reply.replyCommentSq)}
                                        className={`text-danger ${styles.fontSize10}`}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                      >
                                        <span className="ms-2 text-primary">신고</span>
                                      </button>
                                    </span>
                                  )}
                                </div>
                              )}
                              {editReplySq !== reply.replyCommentSq ? (
                                <p className={styles.fontSize12}>{reply.replyCommentDescriptionTxt}</p>
                              ) : (
                                <form onSubmit={(e) => editReplyConfirm(e, reply.replyCommentSq)}>
                                  <div className="input-group">
                                    <input
                                      value={editReplyDescription}
                                      onChange={(e) => setEditReplyDescription(e.target.value)}
                                      type="text"
                                      maxLength="5000"
                                      className="form-control"
                                      placeholder="대댓글을 입력해주세요"
                                      required
                                    />
                                    <button type="submit" className="btn btn-primary">
                                      대댓글 수정
                                    </button>
                                  </div>
                                </form>
                              )}
                              {editReplySq !== reply.replyCommentSq && (
                                <span className={`date ${styles.replyDate} ${styles.fontSize11}`}>
                                  {formatTime(replyCreatedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                        )})}
                    </ul>
                  )}
                  
                  {/* 대댓글 작성 폼 */}
                  {showReplyForm === comment.sq && (
                    <div className="mt-3">
                      <form onSubmit={(e) => createReply(e, comment.sq)}>
                        <div className="input-group">
                          <input
                            value={replyDescription}
                            onChange={(e) => setReplyDescription(e.target.value)}
                            type="text"
                            maxLength="5000"
                            className="form-control"
                            placeholder="대댓글을 입력해주세요"
                          />
                          <button type="submit" className="btn btn-primary">
                            대댓글 작성
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowReplyForm(null)}
                          >
                            취소
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* 댓글 작성 폼 */}
      <div className={`post-comments mt-4 ${styles.commentForm}`}>
        <h4 className={`mb-2 ${styles.fontSize15}`}>댓글 작성</h4>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              type="text"
              maxLength="5000"
              className="form-control"
              placeholder="댓글을 입력해주세요"
            />
            <button type="submit" className="btn btn-primary">
              댓글 작성
            </button>
          </div>
        </form>
      </div>
      
      {/* 신고 모달 */}
      {showReportModal && (
        <ReportModal
          reportTypeCd={reportTarget.typeCd}
          sq={reportTarget.sq}
          onClose={() => {
            setShowReportModal(false)
            setReportTarget({ typeCd: null, sq: null })
          }}
          onSuccess={() => {
            // 신고 성공 후 필요한 액션 (선택적)
          }}
        />
      )}
    </div>
  )
}

