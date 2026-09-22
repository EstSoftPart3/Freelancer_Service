# 시연 사전 준비 - 커뮤니티 시드 등록 (BO 화면과 동일한 /admin/seed API 사용)
#
# 목적: 최근 7일 내 작성글이 0건이라 아래 위젯이 빈 목록으로 나온다.
#   - /community          우측 "추천글"  (주간 7일)
#   - /community/list     사이드바 "지금 인기" (1일)
#   - /community          "베스트글" (월간 30일) 도 4건뿐
# 시연용 게시글 6건(댓글 15, 답변 3)을 오늘 작성일로 등록해 세 위젯을 채운다.
#
# 사용법 (Claude 자동승인 가드에 막히므로 사용자가 직접 실행할 것):
#   !powershell -ExecutionPolicy Bypass -File "C:\dev\Freelancer_Service\docs\고도화-2026\스크립트\demo-seed.ps1" -Preview
#   !powershell -ExecutionPolicy Bypass -File "C:\dev\Freelancer_Service\docs\고도화-2026\스크립트\demo-seed.ps1"
#   !powershell -ExecutionPolicy Bypass -File "C:\dev\Freelancer_Service\docs\고도화-2026\스크립트\demo-seed.ps1" -Revoke
#
# 등록된 글 번호는 스크립트 폴더의 demo-seed-committed.json 에 남는다. 회수는 이 파일을 쓴다.
# (BO 화면 회수 버튼은 브라우저 localStorage 를 쓰므로 스크립트 등록분은 화면에서 회수되지 않는다)
#
# git 에 올리지 말 것 (관리자 비밀번호 평문).

param(
    [switch]$Preview,    # 미리보기만, 등록하지 않음
    [switch]$Revoke,     # 등록 기록 파일로 회수
    [int]$ViewMin = 20,  # 조회수 하한. 베스트 점수(조회x1+댓글x2+추천x3)가 붙어야 인기 위젯에 뜬다
    [int]$ViewMax = 300,
    [string]$AdminId = 'admin',
    [string]$AdminPw = $env:FREELANCER_ADMIN_PW,
    [string]$BaseUrl = 'https://job.estsw.co.kr'
)

$ErrorActionPreference = 'Stop'
$SeedFile   = Join-Path (Split-Path $PSScriptRoot -Parent) '시연용-시드.json'
$CommitFile = Join-Path $PSScriptRoot 'demo-seed-committed.json'

function Get-AuthHeader {
    $body = @{ userId = $AdminId; userPw = $AdminPw; userTypeCd = 303; autoLogin = $false } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/admin/login" -Method Post -ContentType 'application/json' -Body $body
    if (-not $res.output.token.accessToken) { throw 'admin login failed' }
    return @{ Authorization = "Bearer $($res.output.token.accessToken)" }
}

function Invoke-Seed($h, $path, $bodyText) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyText)
    return Invoke-RestMethod -Uri "$BaseUrl/api/admin/seed/$path" -Method Post -Headers $h `
        -ContentType 'application/json; charset=utf-8' -Body $bytes
}

$h = Get-AuthHeader

# ---- 회수 ----
if ($Revoke) {
    if (-not (Test-Path $CommitFile)) { throw "commit record not found: $CommitFile" }
    $rec = Get-Content $CommitFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $sqs = @($rec.boardSqs) -join ','
    if (-not $sqs) { throw 'no boardSqs in record' }
    # 작성자 조건을 함께 걸어야 실유저 글이 섞여도 안 지워진다 (서버가 봇 계정만 대상으로 삼는다)
    $body = '{"boardSqs":[' + $sqs + ']}'
    $res = Invoke-Seed $h 'community/revoke' $body
    "revoked: " + ($res.output | ConvertTo-Json -Compress)
    Rename-Item $CommitFile "$CommitFile.done" -Force
    exit 0
}

if (-not (Test-Path $SeedFile)) { throw "seed json not found: $SeedFile" }
$postsJson = Get-Content $SeedFile -Raw -Encoding UTF8

# TODAY = 오늘 08시~현재에 분산. PAST 로 넣으면 과거로 흩어져 목록 상단이 갱신되지 않는다.
$opt = '{"spreadMode":"TODAY","spreadDays":1,"hotWindowRatio":[40,30,20,10],' +
       '"commentMin":2,"commentMax":4,"answerMin":1,"answerMax":2,' +
       "`"viewMin`":$ViewMin,`"viewMax`":$ViewMax," +
       '"adoptRatio":{"inProgress":20,"adopted":50,"selfSolved":15,"unresolved":15},' +
       '"balanceCategories":true}'
$seed = 20260825

# ---- 미리보기 (등록도 이 결과를 그대로 쓴다: randomSeed + plannedAt 을 되돌려줘야 재현된다) ----
$previewBody = '{"randomSeed":' + $seed + ',"options":' + $opt + ',"posts":' + $postsJson + '}'
$plan = Invoke-Seed $h 'community/preview' $previewBody

Write-Host "== preview =="
Write-Host ("boards {0} / qna {1} / answers {2} / comments {3}" -f `
    $plan.output.summary.totalBoards, $plan.output.summary.totalQna, `
    $plan.output.summary.totalAnswers, $plan.output.summary.totalComments)
Write-Host ("plannedAt {0}" -f $plan.output.plannedAt)
Write-Host ("createdAt {0} ~ {1}" -f $plan.output.summary.createdAtMin, $plan.output.summary.createdAtMax)
if ($plan.output.warnings.Count -gt 0) {
    Write-Host "-- warnings --"
    $plan.output.warnings | ForEach-Object { Write-Host ("   " + $_) }
}

if ($Preview) { exit 0 }

# ---- 등록 ----
# plannedAt 을 되돌려주지 않으면 400. randomSeed 만으로는 배분이 재현되지 않는다.
$commitBody = '{"randomSeed":' + $seed + ',"plannedAt":"' + $plan.output.plannedAt + '","options":' + $opt + ',"posts":' + $postsJson + '}'
$commit = Invoke-Seed $h 'community' $commitBody

Write-Host ""
Write-Host "== committed =="
Write-Host ("boards {0} / answers {1} / comments {2}" -f `
    $commit.output.insertedBoards, $commit.output.insertedAnswers, $commit.output.insertedComments)
Write-Host ("boardSqs: " + (@($commit.output.boardSqs) -join ', '))
if ($commit.output.warnings.Count -gt 0) {
    Write-Host "-- warnings --"
    $commit.output.warnings | ForEach-Object { Write-Host ("   " + $_) }
}

@{ boardSqs = @($commit.output.boardSqs); executedAt = $commit.output.executedAt } |
    ConvertTo-Json | Out-File $CommitFile -Encoding UTF8
Write-Host "record saved -> $CommitFile"
