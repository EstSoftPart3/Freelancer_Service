package com.example.demo.domain.user.constant;

import java.util.regex.Pattern;

/**
 * 닉네임 형식 규칙. 가입(UserService)과 수정(InformationEditService) 양쪽에서 같은 규칙을 쓴다.
 * 컬럼은 VARCHAR(20)이므로 최대 길이를 그보다 크게 두면 안 된다.
 */
public final class NicknamePolicy {

    public static final int MIN_LENGTH = 2;
    public static final int MAX_LENGTH = 20;

    /** 한글·영문·숫자·밑줄만 허용 (공백·특수문자 불가) */
    private static final Pattern ALLOWED = Pattern.compile("^[가-힣a-zA-Z0-9_]+$");

    private NicknamePolicy() {
    }

    /**
     * 형식 위반 시 IllegalArgumentException. 중복 검사는 호출부에서 별도로 한다.
     */
    public static void validate(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임을 입력해주세요.");
        }
        if (nickname.length() < MIN_LENGTH || nickname.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("닉네임은 " + MIN_LENGTH + "~" + MAX_LENGTH + "자로 입력해주세요.");
        }
        if (!ALLOWED.matcher(nickname).matches()) {
            throw new IllegalArgumentException("닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.");
        }
    }
}
