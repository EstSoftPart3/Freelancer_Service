package com.example.demo.domain.calendar.service;

import com.amazonaws.services.kms.model.NotFoundException;
import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.calendar.dto.request.PersonalScheduleCreateRequest;
import com.example.demo.domain.calendar.dto.request.PersonalScheduleUpdateRequest;
import com.example.demo.domain.calendar.dto.response.CalendarDetailResDto;
import com.example.demo.domain.calendar.dto.response.CalendarViewDto;
import com.example.demo.domain.calendar.dto.response.ScheduleUpdateResDto;
import com.example.demo.domain.calendar.entity.CalendarIndvdiEvnt;
import com.example.demo.domain.calendar.entity.CalendarInterviewEvnt;
import com.example.demo.domain.calendar.entity.ScheduleEvnt;
import com.example.demo.domain.calendar.entity.SourceType;
import com.example.demo.domain.calendar.mapper.CalendarIndvdiEvntMapper;
import com.example.demo.domain.calendar.mapper.CalendarMapper;
import com.example.demo.domain.calendar.mapper.CalendarPositionMapper;
import com.example.demo.domain.calendar.mapper.CalendarInterviewMapper;
import com.example.demo.domain.calendar.mapper.rows.PersonalDetailRow;
import com.example.demo.domain.calendar.mapper.rows.ProjectDetailRow;
import com.example.demo.domain.project.dto.request.ApplicationSqRequest;
import com.example.demo.domain.project.dto.response.InterviewScheduleSeeDto;
import com.example.demo.domain.project.mapper.ProjectApplicationMapper;
import com.example.demo.domain.user.dto.UserDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CalendarService {
    private final CalendarMapper calendarMapper;
    private final CalendarIndvdiEvntMapper calendarIndvdiEvntMapper;
    private final CalendarPositionMapper calendarPositionMapper;
    private final CommonCodeMapper commonCodeMapper;
    private final ProjectApplicationMapper applicationMapper;
    private final CalendarInterviewMapper calendarInterviewMapper;

    //    캘린더 일정 조회
    @Transactional
    public List<CalendarViewDto> getCalendar(Long userSq, LocalDate start, LocalDate end,Long contractTypeCd,Long recruitJobPositionTypeCd,String searchKeyword){
        //사용자 조회
        UserDTO userInfo = calendarMapper.findByUser(userSq);
        Optional.ofNullable(userInfo).orElseThrow(() -> new NotFoundException("없는 회원입니다."));
        System.out.println(userSq);

        //사용자의 모든 캘린더 일정 조회
        List<CalendarViewDto> calendarViewDtoList = calendarMapper.findCalendarEvents(userSq,start, end, contractTypeCd, recruitJobPositionTypeCd,searchKeyword);
        return calendarViewDtoList;
    }

    //    캘린더 개인 일정 등록
    @Transactional
    public Long createPersonalSchedule(Long userSq, PersonalScheduleCreateRequest personalReq){
        // 공통일정 저장 (source_type = PERSONAL)
        ScheduleEvnt parent = personalReq.toParentEntity(userSq);
        if (parent.getEndDt().isBefore(parent.getStartDt())){
            throw new IllegalArgumentException("마감일은 시작일보다 이전일 수 없습니다.");
        }
        calendarMapper.insert(parent);

        //개인 일정 자식 저장
        CalendarIndvdiEvnt child = personalReq.toChildEntity(parent.getScheduleSq(),userSq);
        calendarIndvdiEvntMapper.insert(child);

        return parent.getScheduleSq();
    }

    //캘린더 필터링
    @Transactional
    public List<?> fetchFilterInfos(String type) {
        switch (type) {
            case "계약형태":
                return commonCodeMapper.findCommonCodeSqAndNmByParent(ParentCodeEnum.CONTRACT_TYPE.getCode());
            case "직무":
                return commonCodeMapper.findCommonCodeSqAndNmByParent(ParentCodeEnum.JOB_POSITION.getCode());
            default:
                throw new IllegalArgumentException("Unexpected value: " + type);
        }
    }

    //캘린더 수정
    @Transactional
    public ScheduleUpdateResDto updateSchedule(Long scheduleSq, Long userSq, PersonalScheduleUpdateRequest req){
        //path 변수 우선 적용
        req.setScheduleSq(scheduleSq);

        //사용자 검증 조회
        UserDTO userInfo = calendarMapper.findByUser(userSq);
        Optional.ofNullable(userInfo).orElseThrow(() -> new NotFoundException("없는 회원입니다."));

        //일정 검증 조회
        ScheduleEvnt scheduleEvnt = calendarMapper.findBySchedule(scheduleSq);
        Optional.ofNullable(scheduleEvnt).orElseThrow(() -> new NotFoundException("등록된 일정이 없습니다."));

        //메인 selective update
        int affected = calendarMapper.updateScheduleSelective(userSq,req);
        if (affected == 0){
            //소유권 불일치 or 이미 삭제됨 등
            throw new IllegalArgumentException("수정할 수 없습니다.");
        }

        //서브 selective update (개인 일정인경우만)
        if (req.getMemo() != null || Boolean.TRUE.equals(req.getClearMemo())){
            calendarIndvdiEvntMapper.updateByScheduleSelective(
                    scheduleSq,
                    req.getMemo(),
                    req.getClearMemo()
            );
        }

        //최종 데이터 다시 조회해서 응답 dto 구성
        ScheduleEvnt updated = calendarMapper.findBySchedule(scheduleSq);
        return new ScheduleUpdateResDto(
                updated.getScheduleSq(),
                updated.getTitle(),
                updated.getStartDt(),
                updated.getEndDt(),
                req.getMemo(),
                updated.getCalendarModifiedAtDtm()
        );
    }

    //캘린더 상세 조회
    public CalendarDetailResDto getEventDetail(Long userSq, Long scheduleSq){
        //사용자 검증
        UserDTO user = calendarMapper.findByUser(userSq);
        Optional.ofNullable(user).orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));

        //일정 검증
        ScheduleEvnt se = calendarMapper.findBySchedule(scheduleSq);
        Optional.ofNullable(se).orElseThrow(() -> new NotFoundException("일정을 찾을 수 없습니다."));

        //타입 분기
        SourceType sourceType = se.getSourceType();

        if(SourceType.PERSONAL.equals(sourceType)){
            //개인 일정 상세
            PersonalDetailRow personalDetailRow = calendarIndvdiEvntMapper.findDetailByScheduleSq(scheduleSq);
            CalendarDetailResDto.PersonalDetail personalDetail = new CalendarDetailResDto.PersonalDetail(se.getScheduleSq(), se.getTitle(),
                    se.getStartDt(), se.getEndDt(),personalDetailRow != null ? personalDetailRow.getMemo() : null);
            return new CalendarDetailResDto(SourceType.PERSONAL,personalDetail,null);
        }
        else if (SourceType.PROJECT.equals(sourceType)){
            //프로젝트 공고 일정 상세
            ProjectDetailRow projectDetailRow = calendarPositionMapper.findProjectDetailByScheduleSq(scheduleSq);
            String routePath = "/projects/" + projectDetailRow.getProjectSq() + "/details";
            CalendarDetailResDto.ProjectDetail projectDetail = new CalendarDetailResDto.ProjectDetail(se.getScheduleSq(),
            projectDetailRow.getProjectSq(), projectDetailRow.getCompanySq(), projectDetailRow.getProjectTtl(), projectDetailRow.getRecruitStartDt(),
                    projectDetailRow.getRecruitEndDt(), routePath);
            return new CalendarDetailResDto(SourceType.PROJECT,null, projectDetail);
        }else {
            throw new IllegalStateException("지원하지 않는 sourceType: " + sourceType);
        }

    }

    //일정 삭제
    public Long deletedSchedule(Long userSq, Long scheduleSq){
        //사용자 검증
        UserDTO user = calendarMapper.findByUser(userSq);
        Optional.ofNullable(user).orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));

        //일정 검증
        ScheduleEvnt se = calendarMapper.findBySchedule(scheduleSq);
        Optional.ofNullable(se).orElseThrow(() -> new NotFoundException("삭제할 일정이 없거나 권한이 없습니다."));

        //삭제 실행
        int deleted = calendarMapper.deleteSchedule(scheduleSq);

        //삭제 성공 시 원래 일정 순번 반환
        if (deleted > 0){
            return scheduleSq;
        } else {
            throw new RuntimeException("삭제 실패: 이미 삭제되었거나 존재하지 않습니다.");
        }

    }

    //캘린더 인터뷰 자동 생성
    @Transactional
    public void createdInterviewSchedule(ApplicationSqRequest request, Long userSq){
        //인터뷰 일정에 필요한 데이터 조회
        InterviewScheduleSeeDto interviewScheduleSeeDto = applicationMapper.findInterviewScheduleDataConversion(request.getApplicationSq());
        ScheduleEvnt scheduleEvnt = ScheduleEvnt.builder().scheduleUserSq(userSq).title(interviewScheduleSeeDto.getProjectTtl())
                .startDt(interviewScheduleSeeDto.getInterviewStartDt()).endDt(interviewScheduleSeeDto.getInterviewEndDt())
                .calendarCreatedAtDtm(LocalDateTime.now()).calendarModifiedAtDtm(null).scheduleIsDeletedYn("N")
                .sourceType(SourceType.INTERVIEW)
                .build();

        //공통 일정 객체 생성
        calendarMapper.insert(scheduleEvnt);

        Long scheduleSq = scheduleEvnt.getScheduleSq();

        //인터뷰 일정 객체 생성
        calendarInterviewMapper.insert(CalendarInterviewEvnt.builder().projectApplicationSq(interviewScheduleSeeDto.getApplicationSq())
                .companySq(interviewScheduleSeeDto.getCompanySq()).projectSq(interviewScheduleSeeDto.getProjectSq())
                .scheduleSq(scheduleSq).addressSq(interviewScheduleSeeDto.getAddressSq())
                .companyNmSnapshot(interviewScheduleSeeDto.getCompanyNm())
                .build());
    }


}
