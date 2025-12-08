import ProjectApplicant from "./ProjectApplicant";


const ProjectPersonalApplyStatus = ({projectSq, localApplicants, openResumeDetailModal, renderStatusButtons, generateIconUrl}) => {

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
						{localApplicants.map((applicant, idx) => (
							<ProjectApplicant key={idx} index={idx} applicant={applicant} {...props} />
						))}
					</ul>
				)}
			</div>
		</div>
	)
}

export default ProjectPersonalApplyStatus