const ProjectPersonalApplyStatus = ({projectSq, localApplicants, openResumeDetailModal, renderStatusButtons, generateIconUrl}) => {

	// 프로젝트 지원 이력서 열람
	const readResume = (e, resumeSq, applicationSq) => {
		e.preventDefault();
		openResumeDetailModal(resumeSq, projectSq, applicationSq);
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
						<ul className="simple-post-list m-0 position-relative">
							{localApplicants.map((applicant) => (
								<li
									key={applicant.applicationSq}
									style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
								>
									<div className="post-info position-relative">
										{/* 제목 + 회사명 + 지원상태 버튼 */}
										<div className="d-flex justify-content-between align-items-center gap-2">
											<div className="d-flex gap-2">
												<a
													href="#"
													onClick={(e) => readResume(e, applicant.resumeSq, applicant.applicationSq)}
													className="d-flex gap-1 align-items-center text-decoration-none"
												>
													<span className="text-6 m-0">
														{applicant.resumeNmTtlVo.resumeNm} /
													</span>
													<span className="text-5 m-0">
														{applicant.resumeNmTtlVo.resumeTtl}
													</span>
												</a>
											</div>
											<div className="d-flex gap-2">
												{renderStatusButtons(applicant)}
											</div>
										</div>

										{/* 경력 + 열람일자 */}
										<div className="d-flex justify-content-between align-items-center mt-2">
											<div className="post-meta text-4">
												<span className="text-dark text-uppercase font-weight-semibold">
													경력
												</span>
												&nbsp;| {applicant.careerYear}년차
											</div>
											<div className="post-meta text-4">
												<span className="text-dark text-uppercase font-weight-semibold">
													열람일자
												</span>
												&nbsp;| {applicant.appStatusVo.readResumeDt || '미열람'}
											</div>
										</div>

										{/* 사용 기술 + 지원일자 */}
										<div
											className="d-flex justify-content-between align-items-center mt-2"
											style={{ fontSize: '16.8px !important' }}
										>
											<div className="d-flex align-items-center gap-2">
												<div className="text-nowrap align-self-start text-dark text-uppercase font-weight-semibold">
													<span>사용 기술 | </span>
												</div>
												<div className="d-flex align-items-center flex-wrap gap-2">
												{applicant.skillNames.map((skill) => (
													<div
														key={skill}
														className="btn d-flex align-items-center p-1 gap-1 border-0"
													>
														<img
															src={generateIconUrl(skill)}
															alt={skill}
															width="24"
															height="24"
															/>
														<span>{skill}</span>
													</div>
												))}
												</div>
											</div>
											<div className="d-flex align-self-start post-meta text-nowrap" style={{ fontSize: '16.8px' }}>
												<span
													className="text-dark text-uppercase font-weight-semibold"
													style={{ fontSize: '16.8px' }}
												>
													지원일자
												</span>
												&nbsp;| {applicant.appStatusVo.appDt}
											</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					)}

					
				</div>
			</div>
	)
}

export default ProjectPersonalApplyStatus