# Fly.io Windows 배포 스크립트
Write-Host "🚀 Fly.io 배포 스크립트 (Windows)" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Fly CLI 확인
try {
    fly version | Out-Null
    Write-Host "✅ Fly CLI가 설치되어 있습니다." -ForegroundColor Green
} catch {
    Write-Host "❌ Fly CLI가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "📦 설치 중..." -ForegroundColor Yellow
    
    # Fly.io 설치
    Invoke-WebRequest -Uri "https://fly.io/install.ps1" -UseBasicParsing | Invoke-Expression
    
    # PATH 새로고침
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# 로그인 확인
Write-Host "`n🔐 Fly.io 로그인 확인 중..." -ForegroundColor Yellow
try {
    fly auth whoami | Out-Null
    Write-Host "✅ 로그인되어 있습니다." -ForegroundColor Green
} catch {
    Write-Host "📝 Fly.io 로그인이 필요합니다." -ForegroundColor Yellow
    fly auth login
}

# 앱 상태 확인
Write-Host "`n🏗️  Fly.io 앱 설정 중..." -ForegroundColor Yellow
try {
    fly status | Out-Null
    Write-Host "✅ 기존 앱을 사용합니다." -ForegroundColor Green
} catch {
    Write-Host "📱 새 앱을 생성합니다..." -ForegroundColor Yellow
    fly launch --name kid-text-battle-app --region nrt --no-deploy
}

# 볼륨 확인 및 생성
Write-Host "`n💾 데이터 볼륨 확인 중..." -ForegroundColor Yellow
$volumes = fly volumes list 2>$null
if ($volumes -notmatch "kid_text_battle_data") {
    Write-Host "📂 데이터 볼륨 생성 중..." -ForegroundColor Yellow
    fly volumes create kid_text_battle_data --size 1 --region nrt
} else {
    Write-Host "✅ 데이터 볼륨이 이미 존재합니다." -ForegroundColor Green
}

# 배포
Write-Host "`n🚀 배포 시작..." -ForegroundColor Cyan
fly deploy

# 결과 확인
Write-Host "`n✅ 배포 완료!" -ForegroundColor Green
Write-Host "`n📊 앱 정보:" -ForegroundColor Cyan
fly info

Write-Host "`n💡 유용한 명령어:" -ForegroundColor Yellow
Write-Host "  fly status     - 앱 상태 확인" -ForegroundColor Gray
Write-Host "  fly logs       - 로그 확인" -ForegroundColor Gray
Write-Host "  fly open       - 브라우저에서 열기" -ForegroundColor Gray
Write-Host "  fly ssh console - SSH 접속" -ForegroundColor Gray