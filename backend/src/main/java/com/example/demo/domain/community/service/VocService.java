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
 * <b>비공개 방어는 세 겹이다.</b> 이 클래스는 그중 상세 조회(2겹째)를 담당한다.
 * </p>
 * <ol>
 * <li>목록 SQL — {@code BoardMapper.xml} 의 {@code <sql id="secretFilter">}. 상세만 막으면
 * 목록에 제목이 남아 "누가 무엇을 문의했는지"가 드러난다.</li>
 * <li>상세 조회 — {@link #getVoc(Long, Long)} 의 작성자/관리자 확인.</li>
 * <li>교차 조회 경로 — 타입으로 필터하지 <b>않는</b> 쿼리들. {@code findBestBoards}·
 * {@code /community/boards} 는 {@code IN (1401,1402)} 화이트리스트라 자동 제외되고,
 * sitemap·RSS 는 그 두 API 만 순회하므로 VOC 가 새지 않는다.</li>
 * </ol>
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
     * 목록. 비공개 필터는 {@code BoardService.getAllBoards} 안에서 SecurityContext 기준으로 걸린다
     * — 비로그인은 공개 글만, 로그인은 공개 글 + 내 글, 관리자는 전부.
     */
    public BoardListResponse getAllVocs(String searchType, String keyword, String sortType, Long page, Long size) {
        return boardService.getAllBoards(VOC, null, null, searchType, keyword, null, null, sortType, page, size);
    }

    /**
     * 상세. 비공개 글은 작성자와 관리자만 볼 수 있다.
     *
     * <p>
     * 없는 글과 권한 없는 글의 응답을 굳이 구분하지 않는다 — 403 과 404 를 나눠 주면
     * "그 번호에 비공개 글이 있다"는 사실 자체가 새기 때문에 둘 다 403 으로 답한다.
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
        if (board == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 글입니다.");
        }
        requireReadable(board, boardRequest.getUserSq());
        boardService.updateBoard(boardRequest, boardSq, VOC);
    }

    public void deleteVoc(Long userSq, Long boardSq) {
        if (userSq == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        // 삭제 쿼리 자체가 user_sq 를 조건으로 걸어 남의 글은 0행 업데이트된다.
        boardService.deleteBoard(userSq, boardSq);
    }

    public void addViewCnt(Long boardSq) {
        boardService.addViewCntBoard(boardSq);
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
