package com.example.demo.domain.user.dto.request;

public record NotificationBatchRequestDTO(
        Long receiverSq,
        Long senderSq,
        Long typeCd,
        String content,
        String targetUrl) {
}