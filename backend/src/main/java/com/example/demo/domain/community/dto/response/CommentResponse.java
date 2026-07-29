package com.example.demo.domain.community.dto.response;

import com.example.demo.domain.community.entity.*;
import com.example.demo.domain.user.dto.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long sq;
    private Long parentCommentSq; // 부모 댓글 번호 추가
    private Long userSq;
    private String userProfileImgUrl;
    private String userNickname;
    private String description;
    private LocalDateTime createdAt;
    private Integer recommendCnt;

    // 대댓글 리스트를 담기 위한 필드 (기본값 빈 리스트)
    @Builder.Default
    private List<CommentResponse> childComments = new ArrayList<>();

    public static CommentResponse fromEntity(Comment comment, UserDTO userDto, String profileImageUrl) {
        String userNickname = "탈퇴한 사용자";

        if (userDto != null && userDto.getUserNickname() != null) {
            userNickname = userDto.getUserNickname();
        }

        return CommentResponse.builder()
                .sq(comment.getCommentSq())
                .parentCommentSq(comment.getParentCommentSq()) // 엔티티에서 부모 번호 가져오기
                .userSq(comment.getUserSq())
                .userProfileImgUrl(profileImageUrl)
                .userNickname(userNickname)
                .description(comment.getCommentDescriptionTxt())
                .createdAt(comment.getCommentCreatedAtDtm())
                .recommendCnt(comment.getCommentRecommendCnt())
                .build();
    }
}