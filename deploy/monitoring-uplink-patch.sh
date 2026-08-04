
# ---------------------------------------------------------------------
# 업링크(인터넷 회선) 확인                              [2026-08-04 추가]
#
#   랜선 분리·공유기 다운이면 "외부 전부 실패 + 내부 전부 정상" 이 되어
#   터널 장애와 증상이 완전히 똑같다. 2026-08-03 실제로 랜선이 빠졌는데
#   터널 문제로 오판해 22시간 동안 85회를 재시작했다(전부 무의미).
#
#   업링크가 죽었으면 터널을 재시작해도 절대 복구되지 않으므로,
#   재시작 대상을 정하기 전에 여기서 먼저 갈라낸다.
#
#   반환: 0=업링크 정상 / 1=업링크 장애($UPLINK_REASON 에 사유)
# ---------------------------------------------------------------------
uplink_ok() {
    UPLINK_REASON=""
    local gw

    # 1) 기본 경로와 게이트웨이 — 랜선 분리면 여기서 잡힌다
    gw=$(/usr/sbin/ip route show default 2>/dev/null | awk '/default/{print $3; exit}')
    if [ -z "$gw" ]; then
        UPLINK_REASON="기본 경로 없음 - 랜선 분리 또는 링크 다운"
        return 1
    fi
    if ! ping -c 2 -W 2 "$gw" >/dev/null 2>&1; then
        UPLINK_REASON="게이트웨이($gw) 무응답 - 랜선 분리 또는 공유기 다운"
        return 1
    fi

    # 2) 공인망 도달 — 공유기는 살아있고 회선(ISP)만 죽은 경우.
    #    DNS 를 타지 않도록 IP 로 직접 친다.
    if ! $CURL $CURL_V4 -s -o /dev/null --max-time 6 https://1.1.1.1/ 2>/dev/null; then
        UPLINK_REASON="공인망 도달 불가(1.1.1.1) - 인터넷 회선 장애"
        return 1
    fi

    # 3) DNS — cloudflared 는 argotunnel.com SRV 조회에 실패하면 스스로 종료한다.
    #    회선이 살아도 리졸버가 죽으면 터널은 못 뜬다.
    if ! getent hosts cloudflare.com >/dev/null 2>&1; then
        UPLINK_REASON="DNS 조회 불가 - 리졸버 장애"
        return 1
    fi

    return 0
}
