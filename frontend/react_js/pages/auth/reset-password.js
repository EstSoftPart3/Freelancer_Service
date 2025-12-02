import FindAccountForm from "@/components/auth/FindAccountForm";
import CommonPageHeader from "@/components/common/CommonPageHeader";
import { useAlert } from "@/contexts/AlertContext";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPassword() {

	const router = useRouter();
	const [password, setPassword] = useState('');
	const [verifyPassword, setVerifyPassword] = useState('');
	const [isPasswordMatch, setIsPasswordMatch] = useState(false);
	const {showAlert} = useAlert();

	// 비밀번호 확인 입력 핸들러
	const handleVerifyPasswordChange = (e) => {
		setVerifyPassword(e.target.value)
		setIsPasswordMatch(password === e.target.value)
	}

	// 폼 제출 핸들러
	const handleSubmit = async (e) => {
		e.preventDefault()
		if (verifyPassword && isPasswordMatch) {
			try {
				const response = await api.$post('/reset-password', { newPassword : password}, {withCredentials: true})
				console.log('폼 제출', response)
				if (response.status === 'OK') {
					showAlert('비밀번호가 재설정 되었습니다.', 'success')
					router.push('/auth/login')
				} else {
					showAlert( response.message ||'비밀번호 재설정에 실패하였습니다.', 'danger')
				}
			} catch (error) {
				handleError(error)
			}
		} else {
			console.warn('❌ 유효성 검사 실패. 폼 제출 불가.')
			showAlert('모든 필드를 올바르게 입력해주세요.', 'danger')
		}
	}

	// 폼 제출시 에러 처리
    const handleError = (error) => {
      const status = error.response?.statuslet
      let errorMessage = 'ID 찾기에 실패하였습니다'
      if (status === 404) {
        errorMessage = error.response?.data?.message || '입력값을 확인해주세요'
      } else if (status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      showAlert(errorMessage, 'danger')
    }

	return(
		<section>
			<CommonPageHeader
				title=""
				strongText="비밀번호 재설정"
				breadcrumbs={[{ text: 'Home', link: '/' }, { text: 'Reset-Password' }]}
			/>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-md-6 col-lg-5">
						<div className="d-flex flex-column card border-0 shadow-lg">
							<div className="ps-4 pt-4">
								<p className="my-0 fw-bold text-dark fs-5">비밀번호 재설정</p>
							</div>
							<div className="card-body p-5">
								<form onSubmit={handleSubmit}>
									{/* 새로운 비밀번호 입력 */}
									<div className="mb-3">
										<label htmlFor="password" className="form-label">새로운 비밀번호</label>
										<input
											type="password"
											className="form-control"
											id="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
										/>
										{!password && <div className="text-primary">비밀번호를 입력해주세요.</div>}
									</div>
									{/* 비밀번호 입력 확인 */}
									<div className="mb-3">
										<label htmlFor="verifyPassword" className="form-label">비밀번호 확인</label>
										<input
											type="password"
											className="form-control"
											id="verifyPassword"
											value={verifyPassword}
											onChange={handleVerifyPasswordChange}
											required
										/>
										{verifyPassword && !isPasswordMatch && <div className="text-primary">비밀번호가 일치하지 않습니다.</div>}
									</div>
									{/* 제출 버튼 */}
									<div className="d-grid mb-3">
										<button type="submit" className="btn btn-primary btn-block mt-3">
											비밀번호 재설정
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>



			
		</section>
	)
}