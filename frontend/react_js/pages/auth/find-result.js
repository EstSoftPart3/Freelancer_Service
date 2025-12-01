import CommonPageHeader from "@/components/common/CommonPageHeader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function FindResult() {
	const [resultData, setResultData] = useState();
	const router = useRouter();

	// 세션 스토리지에서 데이터 가져옴
	useEffect(() => {
		const storedData = sessionStorage.getItem('findIdResult');
		if (storedData) {
			try {
				const data = JSON.parse(storedData)
				setResultData(data)
				sessionStorage.removeItem('findIdResult')
				console.log('세션 스토리지 findIdResult 데이터 삭제 완료')
			} catch(error) {
				console.error('세션 스토리지 데이터 파싱 오류', e)
				router.replace('/auth/find-account')
			}
		} else {
			// 데이터가 없는 경우
			// router.replace('/auth/find-account')
			console.log('no sessionStorage')
		}
	}, [router])

	// 가입일 포맷 변환
	const rawDate = resultData?.userCreatedAtDtm?.split('T')[0]
	const date = rawDate?.replace(/-/g, '.');

	// 버튼 클릭
	const handleClick = (e) => {
		
	}

	return (
		<section>
					<CommonPageHeader
						title=""
						strongText="회원 찾기"
						breadcrumbs={[{ text: 'Home', link: '/' }, { text: 'Find-Account' }]}
					/>
					<div className="container">
						<div className="row justify-content-center">
							<div className="col-md-6 col-lg-10">
								<div className="d-flex flex-column card border-0 shadow-lg">
									<div className="ps-4 pt-4">
										<p className="my-0 fw-bold text-dark fs-5">{resultData?.userType} 아이디 찾기 결과</p>
									</div>
									<div className="card-body p-4">
										{/* 표 */}
										<table className="table text-center">
											<thead className="table-light">
												<tr>
													<th scope="col">구분</th>
													<th scope="col">아이디</th>
													<th scope="col">이름</th>
													<th scope="col">가입일</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<th scope="row">{resultData?.userType}</th>
													<td className="fw-bold text-primary">{resultData?.userId}</td>
													<td>{resultData?.userNm}</td>
													<td>{date}</td>
												</tr>
											</tbody>
										</table>
									</div>
									<div className="d-flex justify-content-center gap-3 mb-4">
										<button className="btn btn-primary" onClick={() => router.push('/auth/login')}>
											로그인
										</button>
										<button className="btn btn-outline-primary" onClick={() => router.push('/auth/find-account?ft=password')}>
											비밀번호 찾기
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
	)
}