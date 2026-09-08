package com.example.demo.domain.community.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.security.CurrentUser;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.entity.Board;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.mapper.CommunityUserMapper;
import com.example.demo.domain.user.dto.UserDTO;

import lombok.RequiredArgsConstructor;

/**
 * 고객의 소리(VOC). 저장소는 {@code TBL_BOARD_M} 을 {@code board_type_cd = 1404} 로 재사용한다
 * ({@code NoticeController} 가 공지를 1403 으로 재사용하는 것과 같은 패턴).
 *
 * <p>
 * 새 테이블을 파지 않는 이유는 첨부·답변·조회수 중복방지·신고·알림·BO 관리 여섯 개 서브시스템이
 * 전부 {@code board_sq} 를 키로 붙어 있어서다. 새 테이블은 그 여섯 개를 통째로 복제하게 만든다.
 * </p>
 *
 * <p>
 * <b>비공개 방어는 상세 조회 한 겹뿐이다.</b> 이 클래스의 {@link #getVoc(Long, Long)} 가
 * 작성자·관리자만 통과시킨다. 아래 두 가지는 <b>막혀 있지 않으니</b> 착각하지 말 것.
 * </p>
 * <ul>
 * <li>목록 SQL — {@code BoardMapper.findAll} 에는 비공개 필터가 없다(의도된 결정, 매퍼 주석 참고).
 * 즉 {@code GET /voc} 는 남의 비공개 글도 <b>제목·작성자까지 그대로 내려준다</b>.
 * 본문·첨부·답변만 상세에서 막힌다. 목록 응답의 {@code secret} 플래그는 "내 글"이라는 뜻이
 * 아니므로 FO 가 그렇게 해석하면 안 된다.</li>
 * <li>답변 조회 — {@code GET /answer/{answerSq}} 는 운영상 permitAll 이고 글 타입을 보지 않는다.
 * 비공개 문의에 달린 <b>운영자 답변 본문은 answerSq 만 알면 누구나 읽을 수 있다</b>.</li>
 * </ul>
 *
 * <p>
 * 반면 {@code findBestBoards}·{@code /community/boards} 는 {@code IN (1401,1402)}
 * 화이트리스트라 VOC 가 섞이지 않고, sitemap·RSS 는 그 두 API 만 순회한다.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class VocService {

    private static final Long VOC = BoardTypeCode.VOC.getCode();

    private final BoardService boardService;
    private final BoardMapper boardMapper;
    private final CommunityUserMapper communityUserMapper;
    private final VocMailNotifier vocMailNotifier;

    /**
     * 목록. <b>비공개 필터는 걸리지 않는다</b> — 남의 비공개 글도 제목·작성자까지 그대로 내려간다
     * (매퍼 {@code findAll} 주석의 제품 결정). 잠금 표시는 {@code secret} 플래그로 FO 가 그린다.
     *
     * <p>
     * 다만 <b>검색은 제목으로만 한다.</b> 목록에 비공개 필터가 없는 상태에서 본문 검색
     * ({@code searchType=content|all})을 허용하면, 남의 비공개 문의가 검색어를 포함하는지를
     * 목록 응답으로 알 수 있다 — 상세를 403 으로 막아 둔 본문을 한 글자씩 떠보는 오라클이 된다.
     * 제목은 어차피 목록에 그대로 노출되므로 제목 검색은 새로 새는 정보가 없다.
     * </p>
     */
    public BoardListResponse getAllVocs(String searchType, String keyword, String sortType, Long page, Long size) {
        return boardService.getAllBoards(VOC, null, null, "title", keyword, null, null, sortType, page, size);
    }

    /**
     * 상세. 비공개 글은 작성자와 관리자만 볼 수 있다.
     *
     * <p>
     * 없는 글은 404, 권한 없는 글은 403 이다. 목록이 이미 비공개 글의 존재를 드러내고 있어
     * 상태 코드를 합쳐 숨길 실익이 없고, FO 가 "삭제된 글"과 "잠긴 글"을 다르게 안내해야 한다.
     * </p>
     */
    public BoardResponse getVoc(Long userSq, Long boardSq) {
        Board board = boardMapper.findByIdBoard(boardSq, VOC);
        if (board == null || "Y".equals(board.getBoardIsDeletedYn())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 글입니다.");
        }
        requireReadable(board, userSq);
        return boardService.getBoard(userSq, boardSq, VOC);
    }

    /**
     * 등록. 저장이 끝난 뒤 운영자에게 메일로 접수 사실을 알린다 —
     * VOC 는 운영자가 BO 를 열어보기 전까지 아무도 모르는 채널이라 밀어서 알려야 한다.
     *
     * <p>
     * 메일 발송은 저장 성공 이후에만 하고, 실패해도 등록을 되돌리지 않는다
     * ({@link VocMailNotifier} 안에서 삼킨다). 알림이 늦는 것과 글이 사라지는 것 중
     * 후자가 훨씬 나쁘다.
     * </p>
     */
    public void createVoc(BoardRequest boardRequest) {
        Long boardSq = boardService.createBoard(boardRequest, VOC);

        UserDTO writer = communityUserMapper.findById(boardRequest.getUserSq());
        String nickname = Optional.ofNullable(writer)
                .map(UserDTO::getUserNickname)
                .orElse("알 수 없음");

        vocMailNotifier.notifyCreated(
                boardSq,
                boardRequest.getTtl(),
                nickname,
                Boolean.TRUE.equals(boardRequest.getIsSecret()));
    }

    /**
     * 수정. 작성자 일치 검사는 {@code BoardService.updateBoard} 가 이미 한다.
     * 여기서는 읽기 권한만 먼저 확인해 "남의 비공개 글이 존재하는지"를 수정 시도로 떠보지 못하게 막는다.
     */
    public void updateVoc(BoardRequest boardRequest, Long boardSq) {
        Board board = boardMapper.findByIdBoard(boardSq, VOC);
        if (board == null || "Y".equals(board.getBoardIsDeletedYn())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 글입니다.");
        }
        requireReadable(board, boardRequest.getUserSq());
        boardService.updateBoard(boardRequest, boardSq, VOC);
    }

    public void deleteVoc(Long userSq, Long boardSq) {
        if (userSq == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        // 삭제 쿼리는 user_sq 만 조건으로 걸어 글 종류를 가리지 않는다. 타입 확인이 없으면
        // PATCH /voc/{내 Q&A 글 번호} 로 엉뚱한 게시판 글이 태그·추천까지 함께 지워진다.
        // 확인은 BoardService 의 타입 인자 오버로드가 게시판·Q&A·공지와 똑같이 해 준다.
        boardService.deleteBoard(userSq, boardSq, VOC);
    }

    /**
     * 조회수 증가. {@code deleteVoc} 와 같은 이유로 여기서도 글 종류를 확인한다 —
     * {@code addViewCnt} 는 board_sq 만 보고 올리기 때문에, 확인이 없으면
     * {@code PATCH /voc/{남의 Q&A 글 번호}/increment-view} 로 엉뚱한 게시판의 조회수를 올릴 수 있다.
     */
    public void addViewCnt(Long boardSq) {
        boardService.addViewCntBoard(boardSq, VOC);
    }

    private void requireReadable(Board board, Long userSq) {
        if (!"Y".equals(board.getBoardIsSecretYn())) {
            return;
        }
        if (CurrentUser.isAdmin()) {
            return;
        }
        if (userSq != null && userSq.equals(board.getUserSq())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비공개 글입니다. 작성자와 관리자만 볼 수 있습니다.");
    }
}
