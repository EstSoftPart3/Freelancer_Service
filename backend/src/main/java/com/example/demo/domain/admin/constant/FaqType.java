package com.example.demo.domain.admin.constant;


import java.util.Arrays;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum FaqType {
    GENERAL(3001L, "일반"),
    MEMBER(3002L, "회원"),
    ACCOUNT(3003L, "계정"),
    COMPANY(3004L, "기업"),
    SERVICE(3005L, "서비스");

    private final Long code;
    private final String name;
    
    // 검증 메서드
    public static boolean isValidCode(Long code) {
        return Arrays.stream(values())
                .anyMatch(type -> type.getCode().equals(code));
    }

    // 코드값으로 이름을 찾아주는 편의 메서드
    public static String getNameByCode(Long code) {
        for (FaqType type : values()) {
            if (type.getCode().equals(code)) {
                return type.getName();
            }
        }
        return "미분류"; // 혹은 null
    }
}