package com.example.demo.domain.chatroom.sequence;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;


@Component
@RequiredArgsConstructor
public class ChatMsgSequenceGenerator {

    private static final String CHAT_MSG_SEQ_KEY = "chatMsgSq";

    private final MongoOperations mongoOperations;

    public Long nextChatMsgSq() {
        ChatMsgSequenceDocument counter = mongoOperations.findAndModify(
            Query.query(Criteria.where("_id").is(CHAT_MSG_SEQ_KEY)),
            new Update().inc("seq", 1),
            FindAndModifyOptions.options().returnNew(true).upsert(true),
            ChatMsgSequenceDocument.class
        );
        return counter != null ? counter.getSeq() : 1L;
    }
}
