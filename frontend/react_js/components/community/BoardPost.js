import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import skillIconMap from '@/lib/skillIconMap'
import styles from './BoardPost.module.css'

export default function BoardPost({ boardInfo, boardType, onRefresh }) {
  const router = useRouter()
  const { user } = useAuth()
  const { showAlert } = useAlert()
  
  const viewerSq = user?.userSq || null
  
  // 날짜 포맷
  const formatTime = (createdAt) => {
    if (!createdAt) return ''
    const date = new Date(createdAt)
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day
    return `${year}-${month}-${day}`
  }
  
  // 스킬 아이콘
  const getSkillIcon = (name) => {
    const key = name.toLowerCase().replace(/[\s.]+/g, '')
    return skillIconMap[key] || skillIconMap.default
  }
  
  // 추천
  const handleRecommend = async () => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    try {
      const response = await api.$post(`/${boardType}/${boardInfo.sq}/recommend`)
      if (response.status === 'OK') {
        showAlert(response.message, 'success')
        onRefresh()
      } else {
        showAlert('추천 반영에 실패하였습니다.', 'danger')
      }
    } catch (error) {
      showAlert('추천 반영에 실패하였습니다.', 'danger')
    }
  }
  
  // 수정
  const handleEdit = () => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    router.push(`/${boardType}/register?edit=${boardInfo.sq}`)
  }
  
  // 삭제
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const response = await api.$patch(`/${boardType}/${boardInfo.sq}`)
      if (response.status === 'OK') {
        showAlert(response.message, 'success')
        router.push(`/${boardType}`)
      } else {
        showAlert('삭제에 실패하였습니다.', 'danger')
      }
    } catch (error) {
      showAlert('삭제에 실패하였습니다.', 'danger')
    }
  }
  
  // 신고
  const handleReport = () => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    showAlert('신고 기능은 준비 중입니다.', 'info')
  }
  
  return (
    <div>
      <div className="post-header">
        <h1 className="font-weight-semi-bold mb-0 position-relative">
          {/* 제목 + 오른쪽 아이콘들 */}
          <div className={`d-flex justify-content-between align-items-start ${styles.ttlArea}`}>
            <p className={`text-primary ${styles.boardTtl}`}>{boardInfo.ttl}</p>
            {/* 아이콘 버튼 */}
            <span className={`post-icons d-flex ${styles.ttlIconArea}`}>
              {/* 조회수 버튼 */}
              <button
                type="button"
                className={`btn btn-light btn-rounded text-grey d-flex align-items-center me-2 ${styles.fontSizeXs} ${styles.iconBtn}`}
              >
                <i className={`fa-solid fa-eye ${styles.fontSizeS}`}></i>
                <span className="me-2 ms-2 text-grey">조회수</span>
                <span>{boardInfo.viewCnt || 0}</span>
              </button>
              {/* 추천 버튼 */}
              <button
                type="button"
                className={`btn btn-light btn-rounded text-grey d-flex align-items-center me-2 ${styles.fontSizeXs} ${styles.iconBtn}`}
                onClick={handleRecommend}
              >
                <i className={`fa-regular fa-thumbs-up ${styles.fontSizeS}`}></i>
                <span className="me-2 ms-2 text-grey">추천</span>
                <span>{boardInfo.recommendCnt || 0}</span>
              </button>
              {/* 신고 버튼 */}
              {boardInfo.userSq !== viewerSq && (
                <button
                  type="button"
                  className={`btn btn-light btn-rounded text-grey d-flex align-items-center me-2 ${styles.fontSizeXs} ${styles.iconBtn}`}
                  onClick={handleReport}
                >
                  <i className={`fa-solid fa-land-mine-on ${styles.fontSizeS}`}></i>
                  <span className="me-2 ms-2 text-grey">신고</span>
                </button>
              )}
            </span>
          </div>
        </h1>
        <div className="post-meta">
          <span className="me-2">
            <i className="far fa-user"></i> By <a href="#">{boardInfo.userNm}</a>
          </span>
          <span>
            <i className="far fa-calendar-alt me-1"></i>
            <span className="text-primary">{formatTime(boardInfo.createdAt)}</span>
          </span>
        </div>
      </div>
      
      {/* 게시글 본문 */}
      <div
        className="post-description mt-5 mb-5 text-5"
        dangerouslySetInnerHTML={{ __html: boardInfo.description }}
      ></div>
      
      {/* 첨부파일 섹션 */}
      {boardInfo.attachments && boardInfo.attachments.length > 0 && (
        <div className="post-attachments mt-3 mb-4">
          <h5 className="font-weight-bold text-grey">첨부파일</h5>
          <ul className="list-unstyled">
            {boardInfo.attachments.map((attachment, index) => (
              <li key={index}>
                <a href={`/api/board/download/${attachment.fileSq}`} download>
                  {attachment.fileOriginalNm}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 태그 */}
      {((boardInfo.normalTags && boardInfo.normalTags.length > 0) ||
        (boardInfo.skillTags && boardInfo.skillTags.length > 0)) && (
        <div className="post-tags mt-4">
          <h5 className="font-weight-bold text-grey">태그</h5>
          {boardInfo.skillTags &&
            boardInfo.skillTags.map((skillTag, index) => (
              <a
                key={index}
                href="#"
                className="btn btn-rounded btn-primary me-2 my-2"
                onClick={(e) => e.preventDefault()}
              >
                <img
                  src={getSkillIcon(skillTag.skillTagNm)}
                  alt={skillTag.skillTagNm}
                  className={styles.skillIcon}
                />
                {skillTag.skillTagNm}
              </a>
            ))}
          {boardInfo.normalTags &&
            boardInfo.normalTags.map((normalTag, index) => (
              <a
                key={index}
                href="#"
                className="btn btn-rounded btn-light me-2 my-2"
                onClick={(e) => e.preventDefault()}
              >
                {normalTag}
              </a>
            ))}
        </div>
      )}
      
      {/* 버튼 영역 */}
      <div className="post-admin mt-4 text-end">
        {boardInfo.userSq === viewerSq && (
          <>
            <button className="btn btn-primary me-2" onClick={handleEdit}>
              수정
            </button>
            <button type="button" className="btn btn-primary" onClick={handleDelete}>
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  )
}

