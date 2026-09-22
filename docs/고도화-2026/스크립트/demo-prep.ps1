# 시연 사전 준비 - 실서버 프로젝트 공고 날짜 조정 (관리자 API 사용, DB 직접 접근 없음)
#
# 목적: 실서버 프로젝트 29건이 전부 "지원마감" 이라 아래 두 가지가 빈 화면으로 나온다.
#   - FO 메인 "인기 프로젝트" (모집중만 노출하는 Phase 3-A 성과)
#   - BO 프로젝트 관리 모집상태 필터 = 모집중
# 이 스크립트는 공고 6건을 모집중으로, 1건을 모집예정으로 돌려놓는다.
#
# 사용법 (Claude 자동승인 가드에 막히므로 사용자가 직접 실행할 것):
#   !powershell -ExecutionPolicy Bypass -File "C:\dev\Freelancer_Service\docs\고도화-2026\스크립트\demo-prep.ps1" -Check
#   !powershell -ExecutionPolicy Bypass -File "C:\dev\Freelancer_Service\docs\고도화-2026\스크립트\demo-prep.ps1"
#   !powershell -ExecutionPolicy Bypass -File "C:\dev\Freelancer_Service\docs\고도화-2026\스크립트\demo-prep.ps1" -Rollback
#
# git 에 올리지 말 것 (관리자 비밀번호 평문). docs/고도화-2026 은 untracked 폴더다.

param(
    [switch]$Check,      # 현황만 출력, 변경 없음
    [switch]$Rollback,   # 백업 파일로 원복
    [string]$DemoDate,   # 시연 날짜 yyyy-MM-dd. 105번 공고를 이 날 마감으로 맞춘다. 미지정이면 실행일
    [string]$AdminId = 'admin',
    [string]$AdminPw = $env:FREELANCER_ADMIN_PW,
    [string]$BaseUrl = 'https://job.estsw.co.kr'
)

# 105 번은 "모집 종료일 당일에도 채용중" 을 보여주는 공고다. 시연 날짜와 어긋나면 마감으로 잡힌다.
if (-not $DemoDate) { $DemoDate = (Get-Date).ToString('yyyy-MM-dd') }
if ($DemoDate -notmatch '^\d{4}-\d{2}-\d{2}$') { throw "DemoDate format must be yyyy-MM-dd" }

$ErrorActionPreference = 'Stop'
$BackupFile = Join-Path $PSScriptRoot 'demo-prep-backup.json'

# 변경 계획. 규칙: 모집종료 <= 수행종료 (서버가 강제), 모집시작 <= 오늘 이면 모집중
$PLAN = @(
    @{ sq = 81;  memo = 'LG CSMS 2.0 JAVA';       set = @{ recruitEndDt = '2026-09-30'; projectEndDt = '2026-12-31' } },
    @{ sq = 97;  memo = 'Spring Boot Finance';    set = @{ recruitEndDt = '2026-09-30' } },
    @{ sq = 77;  memo = 'Shinhan SuperSOL';       set = @{ recruitEndDt = '2026-10-31' } },
    @{ sq = 98;  memo = 'Shopping Admin UI';      set = @{ recruitEndDt = '2026-09-15' } },
    @{ sq = 79;  memo = 'LG CNS AI Solution';     set = @{ recruitEndDt = '2026-09-05' } },
    @{ sq = 105; memo = "ends on DEMO DAY ($DemoDate)"; set = @{ recruitEndDt = $DemoDate; projectEndDt = '2026-12-31' } },
    @{ sq = 100; memo = 'UPCOMING';               set = @{ recruitStartDt = '2026-09-01'; recruitEndDt = '2026-10-31'; projectStartDt = '2026-09-01'; projectEndDt = '2026-12-31' } }
)

function Get-AuthHeader {
    $body = @{ userId = $AdminId; userPw = $AdminPw; userTypeCd = 303; autoLogin = $false } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/admin/login" -Method Post -ContentType 'application/json' -Body $body
    if (-not $res.output.token.accessToken) { throw 'admin login failed' }
    return @{ Authorization = "Bearer $($res.output.token.accessToken)"; 'Content-Type' = 'application/json' }
}

function Get-Projects($h) {
    (Invoke-RestMethod -Uri "$BaseUrl/api/admin/projects?page=1&size=100" -Headers $h).output.projects
}

$h = Get-AuthHeader
$projects = Get-Projects $h

# ---- 현황 출력 ----
if ($Check) {
    Write-Host "== recruitStatus distribution =="
    $projects | Group-Object recruitStatus | ForEach-Object { "{0,-10} {1}" -f $_.Name, $_.Count }
    Write-Host ""
    Write-Host "== target projects =="
    $ids = $PLAN | ForEach-Object { $_.sq }
    $projects | Where-Object { $ids -contains $_.projectSq } |
        Sort-Object projectSq |
        Select-Object projectSq, recruitStatus, recruitStartDt, recruitEndDt, projectStartDt, projectEndDt |
        Format-Table -AutoSize
    exit 0
}

# ---- 원복 ----
if ($Rollback) {
    if (-not (Test-Path $BackupFile)) { throw "backup not found: $BackupFile" }
    $backup = Get-Content $BackupFile -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($b in $backup) {
        $body = @{
            recruitStartDt = $b.recruitStartDt; recruitEndDt = $b.recruitEndDt
            projectStartDt = $b.projectStartDt; projectEndDt = $b.projectEndDt
        } | ConvertTo-Json
        try {
            Invoke-RestMethod -Uri "$BaseUrl/api/admin/projects/$($b.projectSq)" -Method Patch -Headers $h -Body $body | Out-Null
            Write-Host ("restored {0}" -f $b.projectSq)
        } catch {
            Write-Host ("FAILED  {0} : {1}" -f $b.projectSq, $_.Exception.Message)
        }
    }
    Write-Host "rollback done."
    exit 0
}

# ---- 적용 ----
# 백업은 최초 1회만 만든다 (두 번 실행해도 원본이 덮이지 않게)
if (-not (Test-Path $BackupFile)) {
    $ids = $PLAN | ForEach-Object { $_.sq }
    $projects | Where-Object { $ids -contains $_.projectSq } |
        Select-Object projectSq, recruitStartDt, recruitEndDt, projectStartDt, projectEndDt |
        ConvertTo-Json | Out-File $BackupFile -Encoding UTF8
    Write-Host "backup saved -> $BackupFile"
} else {
    Write-Host "backup already exists (kept) -> $BackupFile"
}

foreach ($t in $PLAN) {
    $body = $t.set | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$BaseUrl/api/admin/projects/$($t.sq)" -Method Patch -Headers $h -Body $body | Out-Null
        Write-Host ("updated {0,-4} {1}" -f $t.sq, $t.memo)
    } catch {
        Write-Host ("FAILED  {0,-4} {1} : {2}" -f $t.sq, $t.memo, $_.Exception.Message)
    }
}

Write-Host ""
Write-Host "== after =="
Get-Projects $h | Group-Object recruitStatus | ForEach-Object { "{0,-10} {1}" -f $_.Name, $_.Count }
