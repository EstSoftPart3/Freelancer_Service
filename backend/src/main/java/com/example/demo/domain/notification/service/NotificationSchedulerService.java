package com.example.demo.domain.notification.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.demo.domain.notification.enums.NotificationTypeCode;
import com.example.demo.domain.project.mapper.ProjectApplicationMapper;
import com.example.demo.domain.project.service.ProjectApplicationService;
import com.example.demo.domain.project.vo.ApplicationSummary;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationSchedulerService {
	
	private final ProjectApplicationMapper projectApplicationMapper;
	private final ProjectApplicationService projectApplicationService;

	
	// 배포 시엔  매일 아침 8시
	@Scheduled(cron = "0 0 8 * * *")   
//	@Scheduled(cron = "*/30 * * * * *")
	public void sendInterviewReminders() {
		List<ApplicationSummary> confirmedInterviews = projectApplicationMapper.findConfirmedInterviews();
		
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime tommorrow8AM = now.plusDays(1).withHour(8).withMinute(0).withSecond(0).withNano(0);
		LocalDateTime today8AM = now.withHour(8).withMinute(0).withSecond(0).withNano(0);
		
		for (ApplicationSummary app : confirmedInterviews) {
			LocalDateTime interviewTime = app.getInterviewDt();
			
			if (interviewTime.toLocalDate().isEqual(tommorrow8AM.toLocalDate())) {
				projectApplicationService.processInterviewReminder(app, NotificationTypeCode.INTERVIEW_TOMORROW);
			}
			
			if (interviewTime.toLocalDate().isEqual(now.toLocalDate()) 
					&& now.isAfter(today8AM) && now.isBefore(today8AM.plusMinutes(1))) {
				projectApplicationService.processInterviewReminder(app, NotificationTypeCode.INTERVIEW_TODAY);
			}
		}
	}
}
