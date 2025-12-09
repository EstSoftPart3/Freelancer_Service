
const CompanyMembers = ({
    projectSq,
    companyMembers,
		currentPageSelectedMembers,
    openResumeDetailModal,
		openResumeSelectModal,
		handleSelect,
    generateIconUrl
  }) => {

	// 이벤트 버블링 처리
	const handleApplicantClick = (e) => {
		e.preventDefault()
		
		const idx = e.target.dataset.memberIndex;
		if (idx === undefined) return;
		// 프로젝트 지원 이력서 열람
		openResumeDetailModal(companyMembers[idx].resumeSq, projectSq, companyMembers[idx].applicationSq)
	}

	// 경력 계산
	const calCareerYears = (careerStartDt, careerEndDt) => {
		if (!careerStartDt) {
			return 0;
		}

		const endDate = careerEndDt ?  new Date(careerEndDt) : new Date();
		const startDate = new Date(careerStartDt)

		// 날짜 객체가 유효하지 않은 경우 처리
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			console.error("Invalid Date format");
			return 0;
    }
		const timeDifference = endDate.getTime() - startDate.getTime();
		const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const totalYears = timeDifference / millisecondsPerDay / 365.25;
		const integerYears = Math.floor(totalYears);
		// 마이너스일 경우 처리
		return Math.max(0, integerYears);
	}

	return (
		// 지원자 현황
		<div className="row">
			<div className="col">
				{companyMembers.length === 0 ? (
					<div className="text-muted py-3" style={{ fontSize: '14px' }}>
						조건에 해당하는 소속 인원이 없습니다.
					</div>
				) : (
					<ul 
						className="simple-post-list m-0 position-relative"
						onClick={handleApplicantClick}
					>
						{companyMembers.map((member, idx) => (
							<li
								key={member.resumeSq}
								style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
							>
								<div className="post-info d-flex justify-content-between position-relative">
									<div className="d-flex flex-column gap-2">
										{/* 제목 + 회사명 + 지원상태 버튼 */}
										<div 
											className="d-flex align-items-center gap-2"
											data-member-index={idx}
										>
											<a
												href="#"
												// onClick={(e) => readResume(e, member.resumeSq, member.applicationSq)}
												className="d-flex gap-1 align-items-center text-decoration-none"
											>
												<span 
													className="text-6 m-0 p-0 d-inline-block"
													style={{ lineHeight: 'normal' }}
        								>
													{member.userNm} /
												</span>
												{member.resumeSq &&
													<span 
														className="text-5 m-0 p-0 d-inline-block" 
														style={{ lineHeight: 'normal' }}
													>
														{member.resumeTtl}
													</span>
												}
											</a>
											{!member.resumeSq && 
											<span 
													className="text-5 m-0 p-0 d-inline-block " 
													style={{ lineHeight: 'normal' }}
											>
												이력서를 선택하세요.
											</span>}
										</div>
										{/* 경력 + 사용 기술 */}
										<div
											className="d-flex justify-content-between align-items-center mt-2"
											style={{ fontSize: '16.8px !important' }}
										>
											<div className="d-flex align-items-center gap-2">
												<div className="post-meta text-4 text-nowrap">
													<span className="text-dark text-uppercase font-weight-semibold">
														경력
													</span>
													&nbsp;| {calCareerYears(member.careerStartDt, member.careerEndDt)}년차
												</div>
												<div className="text-nowrap align-self-center text-dark text-uppercase font-weight-semibold">
													<span>사용 기술 | </span>
												</div>
												<div className="d-flex align-items-center flex-wrap gap-2">
													{member.skillTagNms.map((skill) => (
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
												{/* css 잘 되는지 확인 */}
												{/* <div 
													className="d-flex align-items-center flex-wrap gap-2"
													// 👇 이 부분에 스타일을 추가하여 높이를 제한하고 스크롤을 만듭니다.
													// max-height 값은 필요에 따라 조정하세요. (예: 2줄~3줄 높이)
													style={{ 
														maxHeight: '70px',  // 최대 높이 설정 (예시 값)
														overflowY: 'auto',  // 높이를 초과하면 세로 스크롤바 생성
														paddingRight: '10px' // 스크롤바가 생길 경우 내용이 잘리지 않도록 패딩 추가
													}}
												>
													{member.skillTagNms.map((skill) => (
														<div
																key={skill}
																// 태그가 공간이 부족하다고 강제로 축소되는 것을 방지합니다.
																className="btn d-flex align-items-center p-1 gap-1 border-0 flex-shrink-0"
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
												</div> */}
											</div>
										</div>
									</div>
									<div className="d-inline-flex gap-1 align-items-center">
										{currentPageSelectedMembers?.some(sm => sm.userSq === member.userSq) ?
											<span
												onClick={() => handleSelect(member.userSq, member.resumeSq, member.userNm)}
												className="btn btn-primary btn-lg text-nowrap"
												>
												선택됨
											</span> : <span
												onClick={() => handleSelect(member.userSq, member.resumeSq, member.userNm)}
												className="btn btn-outline btn-primary btn-lg text-nowrap"
												>
												선택하기
											</span>}
										<span
											onClick={() => openResumeSelectModal(member.userSq, member.resumeSq, member.userNm)}
											className="btn btn-outline btn-primary btn-lg text-nowrap"
											>
											이력서 변경
										</span>
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

export default CompanyMembers