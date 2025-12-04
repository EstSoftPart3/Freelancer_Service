package com.example.demo.domain.notification.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.example.demo.domain.mypage.controller.InformationEditController;
import com.example.demo.domain.notification.enums.NotificationTypeCode;
import com.example.demo.domain.project.mapper.ProjectApplicationMapper;
import com.example.demo.domain.project.mapper.ProjectMapper;
import com.example.demo.domain.project.service.ProjectApplicationService;
import com.example.demo.domain.project.service.ProjectService;
import com.example.demo.domain.project.vo.ApplicationSummary;
import com.example.demo.domain.project.vo.ProjectReminderVo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationSchedulerService {

	private final ProjectApplicationMapper projectApplicationMapper;
	private final ProjectApplicationService projectApplicationService;
	private final ProjectMapper projectMapper;
	private final ProjectService projectService;


	/**
	 *  인터뷰 알림 스케줄러
	 *  
	 *  배포 시엔 매일 아침 8시
	 */
	@Scheduled(cron = "0 0 8 * * *")   
//	@Scheduled(cron = "*/30 * * * * *")
	public void sendInterviewReminders() {
		List<ApplicationSummary> confirmedInterviews = projectApplicationMapper.findConfirmedInterviews();
		
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime tomorrow8AM = now.plusDays(1).withHour(8).withMinute(0).withSecond(0).withNano(0);
		LocalDateTime today8AM = now.withHour(8).withMinute(0).withSecond(0).withNano(0);
		
		for (ApplicationSummary app : confirmedInterviews) {
			LocalDateTime interviewTime = app.getInterviewDt();
			
			if (interviewTime.toLocalDate().isEqual(tomorrow8AM.toLocalDate())) {
				projectApplicationService.processInterviewReminder(app, NotificationTypeCode.INTERVIEW_TOMORROW);
			}
			
			if (interviewTime.toLocalDate().isEqual(now.toLocalDate())) {
				projectApplicationService.processInterviewReminder(app, NotificationTypeCode.INTERVIEW_TODAY);
			}
		}
	}
	
	/**
	 * 프로젝트 마감 알림 스케줄러  (오전 9시, 오후 6시)
	 */
	@Scheduled(cron = "0 0 9,18 * * *")
//	@Scheduled(cron = "0 */1 * * * *")
	public void sendProjectDeadlineReminders24H() {
		List<ProjectReminderVo> reminderList24H = projectMapper.findScrapUsersForEndingProjects();
		
		for (ProjectReminderVo reminder : reminderList24H) {
			projectService.processProjectDeadlineReminder(
					reminder.getProjectSq(),
					reminder.getUserSq(),
					reminder.getRecruitEndDt(),
					NotificationTypeCode.PROJECT_DEADLINE_TOMORROW);
		}
	}
}
