import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import CommonPagination from '@/components/common/CommonPagination'
import AffiliationRecruitModal from '@/components/affiliation/AffiliationRecruitModal'
import styles from './affiliationList.module.css'

export default function AffiliationListPage() {
  const { user } = useAuth()
  const { showAlert } = useAlert()

  const [afltnList, setAfltnList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [selectedAfltn, setSelectedAfltn] = useState(null)
  
  // 필터
  const [searchType, setSearchType] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [sortType, setSortType] = useState('latest')
  
  // 주소 필터
  const [addressCdList, setAddressCdList] = useState([])
  const [childrenAddressCdList, setChildrenAddressCdList] = useState({})
  const [selectedParent, setSelectedParent] = useState('all')
  const [addressCd, setAddressCd] = useState('all')

  const size = 8

  // 숫자 포맷팅 (1000 -> 1K)
  const formatNum = (num) => {
    if (num < 1000) {
      return num.toString()
    } else if (num < 1000000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    } else {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
  }

  // "전체" 글자 제거
  const removeAllTxt = (str) => {
    if (str && str.endsWith('전체')) {
      return str.slice(0, -2)
    }
    return str
  }

  // 주소 필터 리스트 불러오기
  const getAllAddress = async () => {
    try {
      const res = await api.$get('/affiliation/address')
      if (res.status === 'OK') {
        const parentList = res.output
          .filter((tag) => tag.parentAreaCodeSq === null)
          .map((parent) => {
            const children = res.output.filter(
              (cd) => cd.parentAreaCodeSq === parent.areaCodeSq
            )
            return {
              ...parent,
              children,
            }
          })
        setAddressCdList(parentList)
      }
    } catch (error) {
      showAlert('주소 정보 로드에 실패하였습니다.', 'danger')
    }
  }

  // 공고 목록 가져오기
  const getAfltnList = async () => {
    try {
      const searchKeyword = keyword.trim()
      const searchFilter =
        searchKeyword === '' ? '' : `&searchType=${searchType}&keyword=${searchKeyword}`

      const addressFilter =
        addressCd === 'all' || !addressCd ? '' : `&addressCd=${addressCd}`

      const res = await api.$get(
        `/affiliation?page=${currentPage}&size=${size}&sortType=${sortType}${searchFilter}${addressFilter}`
      )

      if (res) {
        if (res.output.totalElements === 0) {
          setTotalPages(1)
        } else {
          setTotalPages(Math.floor((res.output.totalElements + size - 1) / size))
        }
        setAfltnList(res.output.companies || [])
      }
    } catch (error) {
      showAlert('소속 공고를 불러올 수 없습니다.', 'danger')
    }
  }

  // 부모 주소 변경
  const onParentChange = (e) => {
    const value = e.target.value
    setSelectedParent(value)
    setAddressCd(value)
    
    if (value === 'all') {
      setChildrenAddressCdList({})
    } else {
      const parent = addressCdList.find((item) => item.areaCodeSq === parseInt(value))
      setChildrenAddressCdList(parent || {})
    }
  }

  // 자식 주소 변경
  const onAddressChange = (e) => {
    setAddressCd(e.target.value)
  }

  // 스크랩 버튼 클릭
  const clickScrap = async (sq) => {
    if (!user?.userSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    
    try {
      const res = await api.$post(`/affiliation/${sq}/scrap`)
      if (res.status === 'OK') {
        showAlert(res.message, 'success')
        getAfltnList()
      } else {
        showAlert('스크랩 반영에 실패하였습니다.', 'danger')
      }
    } catch (error) {
      showAlert('로그인 후 이용해주세요.', 'danger')
    }
  }

  // 소속 신청하기 클릭
  const clickApplication = async (afltn) => {
    await api.$patch(`/affiliation/${afltn.sq}/increment-view`)
    setSelectedAfltn(afltn)
    setShowModal(true)
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedAfltn(null)
  }

  // 신청 완료 후
  const handleConfirm = () => {
    getAfltnList()
  }

  // 검색/필터 변경
  const changeFilter = () => {
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    changeFilter()
  }

  // 페이지 변경 시 목록 새로고침
  useEffect(() => {
    getAfltnList()
  }, [currentPage, sortType, addressCd])

  // 컴포넌트 마운트 시
  useEffect(() => {
    getAllAddress()
    getAfltnList()
  }, [])

  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="소속 모집 공고"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '소속' }]}
      />
      <div className={`${styles.pageContainer} py-4`}>
        {/* 검색창 및 필터 영역 */}
        <div className="row align-items-center justify-content-between py-3 border-bottom mb-3">
          {/* 왼쪽: 정렬, 지역 필터 */}
          <div className="col-md-auto">
            <div className="d-flex">
              <select
                className="form-select w-auto me-2"
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="view">조회순</option>
                <option value="scrap">스크랩순</option>
                <option value="applicant">지원자순</option>
              </select>
              
              {/* 부모 선택 */}
              <select
                className="form-select w-auto me-2"
                value={selectedParent}
                onChange={onParentChange}
              >
                <option value="all">시/도 선택</option>
                {addressCdList.map((parent) => (
                  <option key={parent.areaCodeSq} value={parent.areaCodeSq}>
                    {removeAllTxt(parent.areaSigungu)}
                  </option>
                ))}
              </select>

              {/* 자식 선택 */}
              <select
                className="form-select w-auto"
                value={addressCd}
                onChange={onAddressChange}
              >
                <option value={selectedParent}>전체</option>
                {childrenAddressCdList.children?.map((address) => (
                  <option key={address.areaCodeSq} value={address.areaCodeSq}>
                    {address.areaSigungu}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 오른쪽: 검색 */}
          <div className="col-md-auto mt-3 mt-md-0">
            <form className="d-flex" onSubmit={handleSearch}>
              <select
                className="form-select w-auto me-2"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="all">전체</option>
                <option value="company">회사명</option>
                <option value="content">내용</option>
                <option value="tag">태그</option>
              </select>
              <input
                className="form-control w-auto me-2"
                type="search"
                placeholder="검색어 입력"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button className="btn btn-primary px-3" type="submit">
                검색
              </button>
            </form>
          </div>
        </div>

        {/* 카드 리스트 */}
        <div className="row">
          <div className="col">
            <div className="blog-posts">
              {afltnList.length > 0 ? (
                <div className="row">
                  {afltnList.map((afltn) => (
                    <div key={afltn.sq} className="col-md-4 col-lg-3">
                      <article className="post post-medium border-0 pb-0 mb-5 shadow-sm rounded overflow-hidden bg-white">
                        {/* 이미지 영역 */}
                        <div className={styles.postImage}>
                          <div className="d-block h-100 w-100 position-relative">
                            <img
                              src={
                                afltn.profileImg ||
                                'https://freelancer-service.s3.ap-northeast-2.amazonaws.com/12461_3.png'
                              }
                              onError={(e) => {
                                e.target.src = 'https://freelancer-service.s3.ap-northeast-2.amazonaws.com/12461_3.png'
                              }}
                              className="img-fluid img-thumbnail img-thumbnail-no-borders rounded-0 h-100 w-100"
                              style={{ objectFit: 'cover' }}
                              alt="기업 이미지"
                            />
                            {/* 조회수 뱃지 */}
                            <div className={styles.viewBadge}>
                              <i className="bi bi-eye"></i>
                              <span>{formatNum(afltn.viewCnt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* 내용 영역 */}
                        <div className="post-content p-3 bg-white">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h2
                              className="font-weight-semibold text-5 line-height-6 mb-0"
                              style={{ fontSize: '1.1rem' }}
                            >
                              <button
                                type="button"
                                className="text-primary fw-bold text-decoration-none btn btn-link p-0"
                                onClick={() => clickApplication(afltn)}
                              >
                                {afltn.companyNm}
                              </button>
                            </h2>
                            <button
                              type="button"
                              className="btn btn-link text-muted p-0"
                              onClick={() => clickScrap(afltn.sq)}
                            >
                              <i
                                className={`bi bi-heart-fill ${afltn.isScrap ? styles.active : ''}`}
                              ></i>
                            </button>
                          </div>

                          {/* 키워드 태그 뱃지 */}
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {afltn.tags?.map((tag, index) => (
                              <span
                                key={index}
                                className="badge bg-light text-grey border"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* 설명 영역 */}
                          {afltn.greeting && afltn.greeting.trim() !== '' && (
                            <div className="description p-3 mb-3 rounded bg-color-grey">
                              <p className="mb-0 text-dark">{afltn.greeting}</p>
                            </div>
                          )}

                          <div className="d-grid">
                            <button
                              type="button"
                              className={`btn btn-sm btn-light ${!afltn.isApply ? 'text-primary' : ''}`}
                              onClick={() => clickApplication(afltn)}
                            >
                              {afltn.isApply ? '소속 신청 완료' : '소속 신청하기'}
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              ) : (
                <div>소속 공고가 없습니다.</div>
              )}

              <CommonPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 소속 신청 모달 */}
      {showModal && selectedAfltn && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <AffiliationRecruitModal
              afltnInfo={selectedAfltn}
              onClose={handleCloseModal}
              onConfirm={handleConfirm}
            />
          </div>
        </div>
      )}
    </section>
  )
}

