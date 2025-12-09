import React from "react";
import ProjectApplicant from "./ProjectApplicant";
import styles from "./ProjectCompnayApplyStatus.module.css"


const ProjectCompanyApplyStatus = ({projectSq, localApplicants, openResumeDetailModal, renderStatusButtons, generateIconUrl}) => {

	// 이벤트 버블링 처리
	// const handleApplicantClick = (e) => {
	// 	e.preventDefault()
		
	// 	const target = e.target.closest('[data-applicant-index]')
	// 	if (target) {
	// 		const [comIdx, idx] = target.dataset.applicantIndex.split('-');
	// 		// 프로젝트 지원 이력서 열람
	// 		openResumeDetailModal(localApplicants[comIdx][idx].resumeSq, projectSq, localApplicants[comIdx][idx].applicationSq)
	// 	}
	// }

	console.log('localApplicants', localApplicants)

	const props = {
		projectSq,
		renderStatusButtons,
		generateIconUrl,
		openResumeDetailModal
	}
	
	return (
		// 지원자 현황
		<div className="row">
			<div className="col">
				{localApplicants.length === 0 ? (
					<div className="text-muted py-3" style={{ fontSize: '14px' }}>
						조건에 해당하는 개인 지원자가 없습니다.
					</div>
				) : (
					<ul 
						className="simple-post-list m-0 position-relative"
					>
						{localApplicants.map((company, comIdx) => (
							// 기업명 모달
							<React.Fragment key={comIdx}>
								<div className="accordion" id="accordionPanelsStayOpenExample">
									<div className="accordion-item" style={{ border: 'none' }}>
										<h1 className="accordion-header" id="panelsStayOpen-headingOne">
											<button className={`accordion-button ${styles.grayHeader} py-1`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
												{company.companyNm}
											</button>
										</h1>
										<div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
											<div className="accordion-body">
												{(company.applicants || []).map((applicant, idx) => (
													<ProjectApplicant key={`${company.companyNm}-${idx}`} index={`${comIdx}-${idx}`} applicant={applicant} {...props} />
												))}
											</div>
										</div>
									</div>
								</div>
							</React.Fragment>
						))}
					</ul>
				)}
			</div>
		</div>
	)
}

export default ProjectCompanyApplyStatus