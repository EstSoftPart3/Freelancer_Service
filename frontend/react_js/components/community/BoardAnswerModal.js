import { useRouter } from "next/router";
import BoardRegisterForm from "./BoardRegisterForm";
import { useAlert } from "@/contexts/AlertContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

/**
 * @param {boolean} isEditMode - 수정인지 등록인지 여부
 * @param {int} answerSq - 게시글에서는 게시글 번호 / 답변에서는 답변 번호
 */

const BoardAnswerModal = ({isEditMode, answerSq, boardPostRef, setShowAnswerModal, onRefresh}) => {
	const router = useRouter()
	const { showAlert } = useAlert()
	const [initialData, setInitialData] = useState(null)
	const [loading, setLoading] = useState(false)

	// 수정 모드일 때 기존 데이터 불러오기
	useEffect(() => {
		if (router.isReady && isEditMode) {
			loadAnswerData(answerSq)
		}
	}, [router.isReady, isEditMode, answerSq])

	console.log('isEditMode', isEditMode, 'answerSq', answerSq)

	// 기존 게시글 데이터 불러오기
	const loadAnswerData = async (answerSq) => {
		if (!answerSq) return;
		try {
			setLoading(true)
			const response = await api.$get(`/answer/${answerSq}`)
			if (response && response.output) {
				setInitialData(response.output)
			}
			console.log('기존 게시글 데이터 불러오기', response)
		} catch (error) {
			console.error('게시글 불러오기 실패:', error)
			showAlert('게시글을 불러올 수 없습니다.', 'danger')
			router.push('/community/qna/qnaList')
		} finally {
			setLoading(false)
		}
	}

	// HTML이 비어있는지 확인
	const isHtmlEmpty = (htmlString) => {
		const textOnly = htmlString
			.replace(/<[^>]*>/g, '') // HTML 태그 제거
			.replace(/&nbsp;/gi, '') // 공백 문자 제거
			.trim() // 앞뒤 공백 제거
		return textOnly === ''
	}
	
	// 등록/수정 처리
	const handleSubmit = async () => {
		try {
			const formData = boardPostRef.current.getData()
			const title = boardPostRef.current.getTitle()
			const content = boardPostRef.current.getContent()
			// 유효성 검사
			if (!title || title.trim() === '') {
				showAlert('제목을 입력해주세요.', 'danger')
				return
			}

			if (isHtmlEmpty(content)) {
				showAlert('내용을 입력해주세요.', 'danger')
				return
			}
			
			let response
			if (isEditMode) {
				// 수정
				response = await api.$put(`/answer/${answerSq}`, formData, {withCredentials: true})
			} else {
				// 신규 등록
				response = await api.$post('/answer', formData, {withCredentials: true})
			}

			if (response.status === 'CREATED' || response.status === 'OK') {
				showAlert(response.message || (isEditMode ? '답변 수정되었습니다.' : '답변이 등록되었습니다.'), 'success')
				
			} else {
				showAlert(`답변 ${isEditMode ? '수정' : '등록'}에 실패하였습니다.`, 'danger')
			}
		} catch (error) {
			console.error(`답변 ${isEditMode ? '수정' : '등록'} 실패:`, error)
			showAlert(`답변 ${isEditMode ? '수정' : '등록'}에 실패하였습니다.`, 'danger')
		} finally {
			onRefresh();
			setShowAnswerModal(false);
		}
	}

	// 취소
	const handleCancel = () => {
		if (confirm(`${isEditMode ? '수정' : '작성'}을 취소하시겠습니까?`)) {
			setShowAnswerModal(false)
		}
	}

	return(
		// modalStore 기본 zIndex: 1050
		<div
			className="modal fade show d-block "
			tabIndex="-1"
			style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1051 }}
		>
			<div className="modal-dialog modal-dialog-centered modal-lg ">
				<div className='modal-content'>
					<div className='modal-header mb-0'>
							<h4 className='mb-0'>{isEditMode ? 'QnA 답변 수정' : 'QnA 답변 작성'}</h4>
					</div>
					<form onSubmit={(e) => e.preventDefault()}>
						<div className="container modal-body p-3 pb-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
							<div className="tab-pane active">
								<div className="card bg-color-grey mb-4">
									<div className="card-body pb-2">
											<BoardRegisterForm
												ref={boardPostRef}
												isQna={true}
												initialData={initialData}
											/>
									</div>
								</div>
							</div>
						</div>
						<div className='modal-footer'>
							<button className='btn btn-primary' onClick={handleSubmit}>{isEditMode ? '수정' : '등록'}</button>
							<button className='btn btn-light' onClick={handleCancel}>취소</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default BoardAnswerModal;