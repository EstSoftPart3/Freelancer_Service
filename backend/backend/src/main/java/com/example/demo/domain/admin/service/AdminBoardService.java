package com.example.demo.domain.admin.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.domain.admin.dto.AdminBoardListDTO;
import com.example.demo.domain.admin.dto.response.AdminBoardDetailResponseDTO;
import com.example.demo.domain.admin.dto.response.AdminBoardListResponseDTO;
import com.example.demo.domain.admin.mapper.AdminBoardMapper;
import com.example.demo.domain.admin.mapper.AdminTagMapper;
import com.example.demo.domain.community.converter.NormalTagConverter;
import com.example.demo.domain.community.converter.SkillTagConverter;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.dto.response.AnswerListResponse;
import com.example.demo.domain.community.dto.response.BoardAttachmentResponse;
import com.example.demo.domain.community.dto.response.CommentResponse;
import com.example.demo.domain.community.entity.Answer;
import com.example.demo.domain.community.entity.Board;
import com.example.demo.domain.community.entity.BoardAttachment;
import com.example.demo.domain.community.entity.Comment;
import com.example.demo.domain.community.mapper.AnswerMapper;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.mapper.CmntTagMapper;
import com.example.demo.domain.community.mapper.CommentMapper;
import com.example.demo.domain.community.mapper.CommunityUserMapper;
import com.example.demo.domain.community.mapper.RecommendationMapper;
import com.example.demo.domain.community.service.AnswerService;
import com.example.demo.domain.community.service.CommentService;
import com.example.demo.domain.mypage.dto.ProfileImageInfoDTO;
import com.example.demo.domain.mypage.repository.InformationEditRepository;
import com.example.demo.domain.mypage.service.InformationEditService;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminBoardService {
        private final AdminBoardMapper adminBoardMapper;
        private final CmntTagMapper cmntTagMapper;
        private final AdminTagMapper adminTagMapper;
        private final RecommendationMapper recommendationMapper;
        private final BoardMapper boardMapper;
        private final NormalTagConverter normalTagConverter;
        private final SkillTagConverter skillTagConverter;
        private final AnswerMapper answerMapper;
        private final FileStorageService fileStorageService;
        private final InformationEditRepository informationEditRepository;
        private final CommunityUserMapper communityUserMapper;
        private final InformationEditService informationEditService;
        private final CommentService commentService;
        private final AnswerService answerService;
        private final NotificationService notificationService;

        @Transactional(readOnly = true)
        public AdminBoardListResponseDTO getAdminBoards(List<Long> typeCds, String keyword, String tagKeyword,
                        String sortField, String sortOrder, Long page, Long size) {

                // 1. 페이징 시작점(Offset) 계산
                Long offset = (page - 1) * size;

                // 2. Admin 전용 DTO 리스트 조회
                // (Mapper 인터페이스의 반환 타입도 AdminBoardListDTO로 맞춰야 합니다.)
                List<AdminBoardListDTO> boards = adminBoardMapper.findAllUnified(
                                typeCds, keyword, tagKeyword, sortField, sortOrder, offset, size);

                // 3. 전체 개수 조회
                Long totalElements = adminBoardMapper.findAllUnifiedCnt(typeCds, keyword, tagKeyword);

                // 4. Admin 전용 응답 DTO 조립
                return AdminBoardListResponseDTO.builder()
                                .boards(boards)
                                .totalElements(totalElements)
                                .page(page)
                                .size(size)
                                .build();
        }

        @Transactional
        public void deleteMaster(Long sq, String mainType) {
                if ("BOARD".equals(mainType)) {
                        adminBoardMapper.deleteBoardMaster(sq);
                        // FO 로직 이식: 태그 및 추천 삭제
                        cmntTagMapper.deleteNT(sq, null);
                        cmntTagMapper.deleteST(sq, null);
                        recommendationMapper.deleteAll(sq, null, null);
                } else if ("ANSWER".equals(mainType)) {
                        adminBoardMapper.deleteAnswerMaster(sq);
                        // FO 로직 이식: 답변 관련 태그 및 추천 삭제
                        cmntTagMapper.deleteNT(null, sq);
                        cmntTagMapper.deleteST(null, sq);
                        recommendationMapper.deleteAll(null, sq, null);
                }
        }

        private void handleBoardFiles(Long boardSq, BoardRequest boardRequest) {
                // 1. DB에 저장된 기존 파일 SQ 리스트 조회
                List<Long> fileSqs = boardMapper.findFiles(boardSq);

                // 2. 클라이언트에서 유지하겠다고 보낸 파일 SQ 리스트 (없으면 빈 리스트)
                List<Long> clientFileSqs = boardRequest.getAttachments() != null
                                ? boardRequest.getAttachments()
                                : new java.util.ArrayList<>();
                java.util.Set<Long> clientFileSqSet = new java.util.HashSet<>(clientFileSqs);

                // 3. 삭제 대상 추출: 기존 파일 중 클라이언트 리스트에 없는 것
                List<Long> deletedFileSqs = fileSqs.stream()
                                .filter(fileSq -> !clientFileSqSet.contains(fileSq))
                                .collect(java.util.stream.Collectors.toList());

                // 4. 파일 삭제 처리 (매핑 삭제 및 파일 상태 업데이트)
                for (Long fileSq : deletedFileSqs) {
                        boardMapper.deleteBoardFile(boardSq, fileSq);
                        boardMapper.deleteFile(fileSq);
                }

                // 5. 신규 파일 업로드 및 저장
                if (boardRequest.getFiles() != null) {
                        for (org.springframework.web.multipart.MultipartFile file : boardRequest.getFiles()) {
                                if (file.isEmpty())
                                        continue;

                                UploadedFileDTO uploaded = fileStorageService
                                                .uploadFile(file);

                                ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO
                                                .builder()
                                                .originalName(uploaded.getOriginalName())
                                                .savedName(uploaded.getSavedName())
                                                .contentType(uploaded.getContentType())
                                                .size(uploaded.getSize())
                                                .build();

                                informationEditRepository.saveFile(fileInfo); // 파일 테이블 저장
                                boardMapper.insertFile(boardSq, fileInfo.getFileSq()); // 게시글-파일 매핑 저장
                        }
                }
        }

        @Transactional
        public void updateBoardMaster(Long boardSq, Long boardTypeCd, BoardRequest boardRequest) {
                // 1. 유형에 따른 분기 (1404는 답변 테이블, 나머지는 게시판 테이블)
                if (boardTypeCd == 1404L) {
                        updateAnswerLogic(boardSq, boardRequest);
                } else {
                        updateBoardLogic(boardSq, boardTypeCd, boardRequest);
                }
        }

        @Transactional
        private void updateBoardLogic(Long boardSq, Long boardTypeCd, BoardRequest boardRequest) {
                Board board = boardMapper.findByIdBoard(boardSq, boardTypeCd);
                if (board == null)
                        throw new IllegalArgumentException("존재하지 않는 게시글입니다.");

                board.setBoardTtl(boardRequest.getTtl());
                board.setBoardDescriptionEdt(boardRequest.getDescription());
                if (boardRequest.getBoardAdoptStatusCd() != null) {
                        board.setBoardAdoptStatusCd(boardRequest.getBoardAdoptStatusCd());
                }
                boardMapper.update(board);

                // [수정] 관리자 전용 매퍼 사용 (userSq 무시)

                if (boardRequest.getNormalTags() != null && !boardRequest.getNormalTags().isEmpty()) {
                        adminTagMapper.deleteNT(boardSq, null);
                        cmntTagMapper.insertNT(normalTagConverter.convertStringsToNormalTags(boardSq, null,
                                        boardRequest.getNormalTags()));
                }
                if (boardTypeCd == 1402L && boardRequest.getSkillTags() != null) {
                        // 1. 기존 태그 삭제 (이미 adminTagMapper 사용 중이므로 안전)
                        adminTagMapper.deleteST(boardSq, null);

                        // 2. [해결] 프론트에서 보내준 DTO 리스트(ID 포함)를 컨버터에 그대로 전달
                        // 이 과정에서 skill_tag_sq가 null이 아니게 되어 SQL 에러가 해결됩니다.
                        cmntTagMapper.insertST(
                                        skillTagConverter.convertStringsToSkillTags(boardSq, null,
                                                        boardRequest.getSkillTags()));
                }

                handleBoardFiles(boardSq, boardRequest);
        }

        private void handleAnswerFiles(Long answerSq, BoardRequest boardRequest) {
                // 1. 기존 답변 파일 조회
                List<Long> fileSqs = answerMapper.findFiles(answerSq);

                List<Long> clientFileSqs = boardRequest.getAttachments() != null
                                ? boardRequest.getAttachments()
                                : new java.util.ArrayList<>();
                java.util.Set<Long> clientFileSqSet = new java.util.HashSet<>(clientFileSqs);

                // 2. 삭제 대상 처리
                List<Long> deletedFileSqs = fileSqs.stream()
                                .filter(fileSq -> !clientFileSqSet.contains(fileSq))
                                .collect(java.util.stream.Collectors.toList());

                for (Long fileSq : deletedFileSqs) {
                        answerMapper.deleteAnswerFile(answerSq, fileSq); // 답변 전용 삭제 매퍼
                        boardMapper.deleteFile(fileSq); // 파일 자체는 공통 삭제 로직 사용
                }

                // 3. 신규 답변 파일 업로드
                if (boardRequest.getFiles() != null) {
                        for (org.springframework.web.multipart.MultipartFile file : boardRequest.getFiles()) {
                                if (file.isEmpty())
                                        continue;

                                UploadedFileDTO uploaded = fileStorageService
                                                .uploadFile(file);

                                ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO
                                                .builder()
                                                .originalName(uploaded.getOriginalName())
                                                .savedName(uploaded.getSavedName())
                                                .contentType(uploaded.getContentType())
                                                .size(uploaded.getSize())
                                                .build();

                                informationEditRepository.saveFile(fileInfo);
                                answerMapper.insertFile(answerSq, fileInfo.getFileSq()); // 답변-파일 매핑 저장
                        }
                }
        }

        @Transactional
        private void updateAnswerLogic(Long answerSq, BoardRequest boardRequest) {
                Answer answer = answerMapper.findById(answerSq);
                if (answer == null)
                        throw new IllegalArgumentException("존재하지 않는 답변입니다.");

                answer.setAnswerTtl(boardRequest.getTtl());
                answer.setAnswerDescriptionEdt(boardRequest.getDescription());
                answerMapper.update(answer);

                // [수정] 여기도 반드시 adminTagMapper를 사용해야 관리자 권한으로 삭제됩니다!
                adminTagMapper.deleteNT(null, answerSq);
                adminTagMapper.deleteST(null, answerSq);

                if (boardRequest.getNormalTags() != null) {
                        cmntTagMapper.insertNT(normalTagConverter.convertStringsToNormalTags(null, answerSq,
                                        boardRequest.getNormalTags()));
                }

                // [추가] 답변도 스킬 태그가 있다면 처리 (필요 시)
                if (boardRequest.getSkillTags() != null) {
                        cmntTagMapper.insertST(skillTagConverter.convertStringsToSkillTags(null, answerSq,
                                        boardRequest.getSkillTags()));
                }

                handleAnswerFiles(answerSq, boardRequest);
        }

        @Transactional(readOnly = true)
        public AdminBoardDetailResponseDTO getAdminBoardDetail(Long sq, Long boardTypeCd) {

                if (boardTypeCd == 1404L) {
                        // --- [1. 답변글(ANSWER) 상세 조회] ---
                        Answer answer = answerMapper.findById(sq);
                        if (answer == null)
                                throw new IllegalArgumentException("존재하지 않는 답변입니다.");

                        // 작성자 이름 조회
                        UserDTO userInfo = communityUserMapper.findById(answer.getUserSq());
                        String userNm = (userInfo != null) ? userInfo.getUserNm() : "존재하지 않는 사용자";

                        // 답변 전용 댓글 조회 및 트리 변환
                        List<CommentResponse> flatComments = commentMapper.findByAnswerSq(sq).stream()
                                        .filter(Objects::nonNull)
                                        .map(comment -> {
                                                UserDTO userDto = communityUserMapper.findById(comment.getUserSq());
                                                String profileImageUrl = informationEditService
                                                                .getProfileImageUrl(userDto.getUserSq());
                                                return CommentResponse.fromEntity(comment, userDto, profileImageUrl);
                                        }).collect(Collectors.toList());
                        List<CommentResponse> commentTree = commentService.convertToTree(flatComments);

                        return AdminBoardDetailResponseDTO.builder()
                                        .sq(answer.getAnswerSq())
                                        .userSq(answer.getUserSq())
                                        .userNm(userNm)
                                        .ttl(answer.getAnswerTtl())
                                        .description(answer.getAnswerDescriptionEdt())
                                        .boardTypeCd(1404L)
                                        .mainType("ANSWER")
                                        .parentBoardSq(answer.getBoardSq())
                                        .parentBoardTypeCd(1402L)
                                        .attachments(getAnswerAttachments(sq))
                                        .normalTags(normalTagConverter
                                                        .convertNormalTagsToStrings(cmntTagMapper.findNT(null, sq)))
                                        .skillTags(skillTagConverter
                                                        .convertSkillTagsToStrings(cmntTagMapper.findST(null, sq)))
                                        .comments(commentTree) // 답변 댓글 트리 세팅
                                        .build();

                } else {
                        // --- [2. 일반 게시글(BOARD/Q&A) 상세 조회] ---
                        Board board = boardMapper.findByIdBoard(sq, boardTypeCd);
                        if (board == null)
                                throw new IllegalArgumentException("존재하지 않는 게시글입니다.");

                        // 작성자 이름 조회
                        UserDTO userInfo = communityUserMapper.findById(board.getUserSq());
                        String userNm = (userInfo != null) ? userInfo.getUserNm() : "존재하지 않는 사용자";

                        // 게시글 전용 댓글 조회 및 트리 변환
                        List<CommentResponse> flatComments = commentMapper.findByBoardSq(sq).stream()
                                        .filter(Objects::nonNull)
                                        .map(comment -> {
                                                UserDTO userDto = communityUserMapper.findById(comment.getUserSq());
                                                String profileImageUrl = informationEditService
                                                                .getProfileImageUrl(userDto.getUserSq());
                                                return CommentResponse.fromEntity(comment, userDto, profileImageUrl);
                                        }).collect(Collectors.toList());
                        List<CommentResponse> commentTree = commentService.convertToTree(flatComments);

                        // Q&A인 경우 답변 목록 조회
                        List<AnswerListResponse> answers = (boardTypeCd == 1402L)
                                        ? answerService.getAllAnswers(sq)
                                        : null;

                        return AdminBoardDetailResponseDTO.builder()
                                        .sq(board.getBoardSq())
                                        .userSq(board.getUserSq())
                                        .userNm(userNm)
                                        .ttl(board.getBoardTtl())
                                        .description(board.getBoardDescriptionEdt())
                                        .boardAdoptStatusCd(board.getBoardAdoptStatusCd())
                                        .boardTypeCd(board.getBoardTypeCd())
                                        .mainType("BOARD")
                                        .attachments(getBoardAttachments(sq))
                                        .normalTags(normalTagConverter
                                                        .convertNormalTagsToStrings(cmntTagMapper.findNT(sq, null)))
                                        .skillTags(skillTagConverter
                                                        .convertSkillTagsToStrings(cmntTagMapper.findST(sq, null)))
                                        .comments(commentTree) // 게시글 댓글 트리 세팅
                                        .answers(answers) // Q&A 답변 목록 세팅
                                        .build();
                }
        }

        // 파일 조회 헬퍼 메서드 (FO 로직 참조)
        private List<BoardAttachmentResponse> getBoardAttachments(Long boardSq) {
                return boardMapper.findFiles(boardSq).stream()
                                .map(fileSq -> {
                                        BoardAttachment att = boardMapper.findFile(fileSq);
                                        return new BoardAttachmentResponse(att.getFileSq(), att.getFileOriginalNm(),
                                                        att.getFileSaveNm());
                                }).collect(java.util.stream.Collectors.toList());
        }

        private List<BoardAttachmentResponse> getAnswerAttachments(Long boardSq) {
                return answerMapper.findFiles(boardSq).stream()
                                .map(fileSq -> {
                                        BoardAttachment att = boardMapper.findFile(fileSq);
                                        return new BoardAttachmentResponse(att.getFileSq(), att.getFileOriginalNm(),
                                                        att.getFileSaveNm());
                                }).collect(java.util.stream.Collectors.toList());
        }

        // AdminBoardService.java

        // ... 기존 필드 주입 하단에 추가
        private final CommentMapper commentMapper;

        /**
         * 4. [마스터 권한] 댓글/대댓글 등록
         */
        @Transactional
        public void createCommentMaster(Long boardSq, Long answerSq, Long parentCommentSq, Long userSq,
                        String description) {
                if (description == null || description.trim().isEmpty()) {
                        throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
                }

                // 1. 엔티티 빌드 및 저장 (기존 로직 그대로 이식)
                Comment comment = Comment.builder()
                                .boardSq(boardSq)
                                .answerSq(answerSq)
                                .parentCommentSq(parentCommentSq)
                                .userSq(userSq)
                                .commentDescriptionTxt(description)
                                .commentTypeCd(boardSq == null ? 1602L : 1601L) // answerSq가 있으면 1602
                                .build();

                commentMapper.insert(comment);

                // 2. 카운트 업데이트 및 알림 발송
                if (comment.getCommentSq() != null) {
                        sendCommentNotification(comment);
                }
        }

        private void sendCommentNotification(Comment comment) {
                Long receiverSq = null;
                String targetUrl = "";
                String notiContent = "";

                // [알림 로직 A] 일반 게시판 또는 Q&A 게시글 직접 댓글
                if (comment.getBoardSq() != null) {
                        boardMapper.updateCommentCnt(comment.getBoardSq());
                        Board board = boardMapper.findByIdOnly(comment.getBoardSq());

                        if (board != null) {
                                receiverSq = board.getUserSq();
                                String pathPrefix = "normal".equals(board.getBoardTyp()) ? "/board/" : "/qna/";
                                targetUrl = pathPrefix + board.getBoardSq();
                                notiContent = "관리자가 내 게시글에 댓글을 남겼습니다."; // 관리자용 문구로 살짝 수정
                        }
                }
                // [알림 로직 B] Q&A 답변(Answer)에 달린 댓글 (그대로 이식)
                else if (comment.getAnswerSq() != null) {
                        answerMapper.updateCommentCnt(comment.getAnswerSq());
                        Answer answer = answerMapper.findById(comment.getAnswerSq());

                        if (answer != null) {
                                receiverSq = answer.getUserSq();
                                // 상세 페이지 URL 뒤에 answerSq 파라미터를 붙여 모달 띄우기 대응
                                targetUrl = "/qna/" + answer.getBoardSq() + "?answerSq=" + comment.getAnswerSq();
                                notiContent = "관리자가 내 Q&A 답변에 댓글을 남겼습니다.";
                        }
                }

                // [알림 발송 1] 원글/답변 작성자 발송
                if (receiverSq != null && !receiverSq.equals(comment.getUserSq())) {
                        notificationService.send(receiverSq, comment.getUserSq(), 2601L, notiContent, targetUrl);
                }

                // [알림 발송 2] 대댓글인 경우 부모 댓글 작성자 발송
                if (comment.getParentCommentSq() != null) {
                        Comment parentComment = adminBoardMapper.findCommentById(comment.getParentCommentSq());
                        if (parentComment != null) {
                                Long parentWriterSq = parentComment.getUserSq();

                                if (parentWriterSq != null && !parentWriterSq.equals(comment.getUserSq())
                                                && !parentWriterSq.equals(receiverSq)) {
                                        notificationService.send(parentWriterSq, comment.getUserSq(), 2601L,
                                                        "내 댓글에 관리자가 답글을 남겼습니다.", targetUrl);
                                }
                        }
                }
        }

        /**
         * 4. [마스터 권한] 댓글 수정
         */
        @Transactional
        public void updateCommentMaster(Long commentSq, String description) {
                if (description == null || description.trim().isEmpty()) {
                        throw new IllegalArgumentException("수정할 내용을 입력해주세요.");
                }

                // 관리자 전용 조회 (상태값 상관없이 조회하거나 admin 전용 매퍼 사용)
                Comment comment = adminBoardMapper.findCommentById(commentSq);
                if (comment == null) {
                        throw new IllegalArgumentException("존재하지 않는 댓글입니다.");
                }

                // 작성자 체크 없이 강제 업데이트
                comment.setCommentDescriptionTxt(description);
                commentMapper.update(comment);

        }

        /**
         * 4. [마스터 권한] 댓글 삭제
         */
        @Transactional
        public void deleteCommentMaster(Long commentSq) {
                Comment comment = adminBoardMapper.findCommentById(commentSq);
                if (comment == null) {
                        throw new IllegalArgumentException("존재하지 않는 댓글입니다.");
                }

                // 1. 관리자 권한 삭제 (is_deleted_yn = 'Y' 처리 등)
                adminBoardMapper.deleteCommentByAdmin(commentSq);

                // 2. 관련 데이터(추천 등) 삭제
                recommendationMapper.deleteAll(null, null, commentSq);

                // 3. 댓글수 카운트 업데이트
                if (comment.getBoardSq() != null) {
                        boardMapper.updateCommentCnt(comment.getBoardSq());
                }

        }
}