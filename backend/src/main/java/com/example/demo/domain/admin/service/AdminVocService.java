package com.example.demo.domain.admin.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.util.SortDirectionUtil;
import com.example.demo.domain.admin.dto.AdminBoardListDTO;
import com.example.demo.domain.admin.dto.response.AdminBoardListResponseDTO;
import com.example.demo.domain.admin.mapper.AdminBoardMapper;
import com.example.demo.domain.admin.mapper.AdminVocMapper;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.dto.request.AnswerRequest;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.mapper.CmntTagMapper;
import com.example.demo.domain.community.mapper.RecommendationMapper;
import com.example.demo.domain.community.service.AnswerService;
import com.example.demo.domain.community.service.BoardService;

import lombok.RequiredArgsConstructor;

/**
 * BO 고객의 소리 관리.
 *
 * <p>
 * 답변 등록은 {@link AnswerService#createAnswer} 를 그대로 재사용한다 — 알림(2607)·링크(/voc/…)
 * 분기가 이미 그 안에 있어서, 여기서 알림을 따로 쏘면 같은 알림이 두 번 가거나 한쪽만 고쳐진다.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AdminVocService {

    private final AdminVocMapper adminVocMapper;
    private final AdminBoardMapper adminBoardMapper;
    private final CmntTagMapper cmntTagMapper;
    private final RecommendationMapper recommendationMapper;
    private final BoardService boardService;
    private final AnswerService answerService;

    @Transactional(readOnly = true)
    public AdminBoardListResponseDTO getAdminVocs(String keyword, Boolean answered,
            String sortField, String sortOrder, Long page, Long size) {

        Long offset = (page - 1) * size;
        Long totalElements = adminVocMapper.countVocs(keyword, answered);
        // sortOrder 는 XML 에서 ${sortOrder} 로 직접 삽입되므로 ASC/DESC 로 정규화(SQL Injection 방지)
        List<AdminBoardListDTO> vocs = adminVocMapper.findAllVocs(keyword, answered, sortField,
                SortDirectionUtil.normalize(sortOrder), offset, size);

        // BO zod 스키마가 배열 필드에 null 을 허용하지 않아 빈 배열로 채운다(AdminNoticeService 와 같은 이유).
        for (AdminBoardListDTO dto : vocs) {
            if (dto.getNormalTags() == null) {
                dto.setNormalTags(new ArrayList<>());
            }
            if (dto.getSkillTags() == null) {
                dto.setSkillTags(new ArrayList<>());
            }
        }

        return AdminBoardListResponseDTO.builder()
                .boards(vocs)
                .totalElements(totalElements)
                .page(page)
                .size(size)
                .build();
    }

    /**
     * 상세. 관리자는 비공개 글도 볼 수 있어야 하므로 {@code VocService} 의 권한 검사를 거치지 않고
     * {@code BoardService} 를 직접 부른다. 이 경로는 {@code /admin/**} 이라 ROLE_ADMIN 이 이미 보장된다.
     */
    @Transactional(readOnly = true)
    public BoardResponse getAdminVoc(Long userSq, Long boardSq) {
        return boardService.getBoard(userSq, boardSq, BoardTypeCode.VOC.getCode());
    }

    /**
     * 답변 등록. 문의자에게 알림(2607)이 나가는 지점이라 답변 본문이 비어 있으면 여기서 끊는다.
     */
    @Transactional
    public void createAnswer(Long userSq, Long boardSq, String ttl, String description) {
        AnswerRequest request = new AnswerRequest();
        request.setUserSq(userSq);
        request.setBoardSq(boardSq);
        request.setTtl(ttl);
        request.setDescription(description);
        request.setNormalTags(Collections.emptyList());
        request.setSkillTags(Collections.emptyList());

        answerService.createAnswer(request);
    }

    /**
     * 삭제(논리). {@code BoardService.deleteBoard} 는 쓰지 않는다 — 그쪽 UPDATE 는
     * {@code WHERE ... AND user_sq = #{userSq}} 라 <b>남의 글에는 0행이 반영되고 조용히 성공한다.</b>
     * 관리자 삭제는 작성자 조건이 없는 마스터 쿼리를 써야 한다.
     */
    @Transactional
    public void deleteVoc(Long boardSq) {
        adminBoardMapper.deleteBoardMaster(boardSq);
        cmntTagMapper.deleteNT(boardSq, null);
        cmntTagMapper.deleteST(boardSq, null);
        recommendationMapper.deleteAll(boardSq, null, null);
    }
}
