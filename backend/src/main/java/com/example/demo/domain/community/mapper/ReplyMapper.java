package com.example.demo.domain.community.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.example.demo.domain.community.entity.Reply;
import java.util.List;

@Mapper
public interface ReplyMapper {
    Reply findById(@Param("replyCommentSq") Long replyCommentSq);
    List<Reply> findByCommentSq(@Param("commentSq") Long commentSq);
    void insert(Reply reply);
    void update(Reply reply);
    void delete(@Param("userSq") Long userSq, @Param("replyCommentSq") Long replyCommentSq);
    void updateRecommendCnt(@Param("replyCommentSq") Long replyCommentSq);
}
