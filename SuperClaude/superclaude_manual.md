# SuperClaude 완벽 가이드
### AI 기반 GitHub 워크플로우 자동화 도구

---

## 목차

1. [소개](#소개)
2. [설치 및 설정](#설치-및-설정)
3. [명령어 상세 가이드](#명령어-상세-가이드)
4. [사용 예제](#사용-예제)
5. [고급 기능](#고급-기능)
6. [문제 해결](#문제-해결)
7. [팁과 모범 사례](#팁과-모범-사례)

---

## 소개

SuperClaude는 Anthropic의 Claude AI를 활용하여 개발자의 GitHub 워크플로우를 자동화하는 강력한 도구입니다. 

### 주요 기능
- 🤖 **AI 기반 커밋 메시지 생성**: 코드 변경사항을 분석하여 의미 있는 커밋 메시지 자동 생성
- 📅 **지능형 변경로그**: 커밋 히스토리를 사람이 읽기 쉬운 형태로 변환
- 📖 **자동 문서화**: 프로젝트 구조를 분석하여 전문적인 README 생성
- 🔍 **코드 리뷰**: 보안 취약점, 성능 문제, 유지보수성 분석
- 💡 **아이디어 브레인스토밍**: 프로젝트 개선 아이디어 제안
- 📚 **기술 문서 생성**: 아키텍처, 배포 가이드 등 상세 문서 자동 생성
- 📝 **커밋 주석 추가**: 모든 커밋에 AI가 생성한 설명 추가

### 버전 정보
- **현재 버전**: 1.0.3
- **필요 환경**: Node.js 18.0.0 이상
- **라이선스**: MIT
- **공식 웹사이트**: https://superclaude.sh
- **GitHub**: https://github.com/gwendall/superclaude

---

## 설치 및 설정

### 1. 사전 준비사항

#### 필수 요구사항
```bash
# Node.js 18+ 확인
node --version  # v18.0.0 이상이어야 함

# Git 설치 확인
git --version

# Git 사용자 정보 설정 (필수)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

#### Claude Code 설치 및 인증
```bash
# Claude Code 설치 (필수)
npm install -g @anthropic-ai/claude-code

# Claude 인증 (Console/Pro/Enterprise 중 선택)
claude
# 브라우저가 열리면 인증 진행
```

#### GitHub CLI 설치 (권장)
```bash
# Windows (winget)
winget install GitHub.cli

# macOS
brew install gh

# 인증
gh auth login
```

### 2. SuperClaude 설치

```bash
# 전역 설치
npm install -g superclaude

# 설치 확인
superclaude --version
```

### 3. 시스템 검증

```bash
# 모든 의존성과 인증 상태 확인
superclaude --verify

# 상세한 진단 정보 확인
superclaude --verify --verbose
```

---

## 명령어 상세 가이드

### 1. commit - AI 커밋 메시지 생성

#### 기본 사용법
```bash
superclaude commit
```

#### 옵션
- `--interactive, -i`: 커밋 전 메시지 확인 및 수정
- `--verbose, -v`: 상세한 진행 상황 표시
- 추가 컨텍스트 제공: `superclaude commit "수정 내용 설명"`

#### 사용 예제
```bash
# 기본 AI 커밋 (조용한 모드)
superclaude commit

# 대화형 모드 (커밋 전 확인)
superclaude commit --interactive

# 상세 모드 (AI 사고 과정 표시)
superclaude commit --verbose

# 컨텍스트 추가
superclaude commit "인증 버그 수정"

# 모든 옵션 사용
superclaude commit "사용자 대시보드 추가" -i -v
```

#### 작동 방식
1. 모든 변경된 파일 스캔
2. 코드 패턴 분석으로 커밋 타입 결정 (feat/fix/refactor 등)
3. Conventional Commit 형식으로 메시지 생성
4. 자동으로 스테이징, 커밋, 푸시 실행

### 2. changelog - 변경 로그 생성

#### 기본 사용법
```bash
superclaude changelog
```

#### 옵션
- `--verbose, -v`: 분석 과정 상세 표시

#### 사용 예제
```bash
# 기본 변경로그 생성
superclaude changelog

# 상세 분석 과정 표시
superclaude changelog --verbose
```

#### 생성되는 파일
- `CHANGELOG.md`: 전체 변경 내역
- `docs/daily-changelog.md`: 일별 변경사항
- `docs/weekly-changelog.md`: 주별 요약
- `docs/monthly-changelog.md`: 월별 개요

#### 특징
- 사소한 변경사항 필터링
- 사용자 영향 중심의 설명
- 비기술적 언어로 작성
- 시간대별 그룹화

### 3. readme - README 파일 생성

#### 기본 사용법
```bash
superclaude readme
```

#### 생성 내용
- 프로젝트 개요 및 특징
- 설치 가이드
- 사용법 및 예제
- API 문서 (해당하는 경우)
- 기여 가이드라인
- 라이선스 정보

#### 분석 대상
- `package.json` (Node.js 프로젝트)
- 프로젝트 구조
- 주요 소스 코드
- 기존 문서들

### 4. review - 코드 리뷰

#### 기본 사용법
```bash
superclaude review
```

#### 옵션
- `--verbose, -v`: 상세한 보안 평가

#### 분석 항목
- **보안 취약점**: SQL 인젝션, XSS, 인증 문제 등
- **성능 문제**: 비효율적인 알고리즘, 메모리 누수
- **코드 품질**: 중복 코드, 복잡도, 명명 규칙
- **유지보수성**: 모듈화, 의존성, 테스트 가능성

#### 출력
- `docs/code-review.md` 파일 생성
- 구체적이고 실행 가능한 개선 제안

### 5. brainstorm - 아이디어 제안

#### 기본 사용법
```bash
superclaude brainstorm
```

#### 제안 내용
- 새로운 기능 아이디어
- 성능 최적화 방안
- 아키텍처 개선 제안
- 기술 부채 해결 방법
- 사용자 경험 개선안

#### 출력
- `docs/ideas.md` 파일 생성

### 6. docs - 기술 문서 생성

#### 기본 사용법
```bash
superclaude docs
```

#### 생성 문서 내용
- 시스템 아키텍처
- 컴포넌트 관계도
- 데이터 흐름
- API 명세
- 배포 가이드
- 트러블슈팅 가이드

#### 출력
- `docs/technical-docs.md` 파일 생성

### 7. annotate - 커밋 주석 추가

#### 기본 사용법
```bash
superclaude annotate
```

#### 옵션
- `--verbose, -v`: 주석 추가 과정 표시

#### 기능
- 모든 커밋의 diff 분석
- 기술적 설명 생성
- Git notes로 저장
- 검색 가능한 커밋 히스토리 생성

#### 확인 방법
```bash
# 주석이 추가된 커밋 로그 보기
git log --show-notes
```

### 8. help - 도움말 표시

```bash
superclaude help
```

### 9. version - 버전 정보

```bash
superclaude --version
```

---

## 사용 예제

### 일일 워크플로우

```bash
# 아침: 프로젝트 상태 파악
superclaude brainstorm

# 코드 작업 후
echo "new feature" >> src/feature.js

# AI 커밋
superclaude commit
# 출력: "feat: JWT 토큰을 사용한 사용자 인증 추가"

# 문서 자동 업데이트
superclaude readme

# 릴리스 준비
superclaude changelog
```

### 팀 워크플로우

#### package.json 스크립트 설정
```json
{
  "scripts": {
    "commit": "superclaude commit --interactive",
    "commit:quick": "superclaude commit",
    "changelog": "superclaude changelog",
    "readme": "superclaude readme",
    "review": "superclaude review --verbose",
    "docs": "superclaude docs",
    "release:prep": "npm run changelog && npm run readme",
    "annotate": "superclaude annotate"
  }
}
```

#### 사용 예
```bash
# 대화형 커밋
npm run commit

# 빠른 커밋
npm run commit:quick

# 릴리스 준비 (변경로그 + README)
npm run release:prep

# 코드 리뷰
npm run review
```

### Git 별칭 설정

```bash
# Git 별칭 추가
git config --global alias.ai-commit '!superclaude commit'
git config --global alias.ai-commit-i '!superclaude commit -i'
git config --global alias.ai-changelog '!superclaude changelog'

# 사용
git ai-commit
git ai-commit-i
git ai-changelog
```

---

## 고급 기능

### 1. 플래그 조합

```bash
# 대화형 + 상세 모드
superclaude commit -i -v

# 컨텍스트 + 대화형
superclaude commit "버그 수정" -i

# 모든 옵션 활성화
superclaude commit "새 기능 추가" --interactive --verbose
```

### 2. Yarn 단축키

```bash
# package.json에 추가
{
  "scripts": {
    "superclaude:commit": "superclaude commit",
    "superclaude:commit:verbose": "superclaude commit -v",
    "superclaude:commit:interactive": "superclaude commit -i",
    "superclaude:commit:full": "superclaude commit -i -v"
  }
}
```

### 3. 직접 실행

```bash
# Node.js로 직접 실행
node C:/CleanDev/npm-global/node_modules/superclaude/bin/superclaude commit

# npx 사용
npx superclaude commit
```

### 4. 환경 변수 설정

```bash
# 기본 상세 모드 활성화
export SUPERCLAUDE_VERBOSE=true

# 기본 대화형 모드 활성화
export SUPERCLAUDE_INTERACTIVE=true
```

---

## 문제 해결

### 1. "command not found" 오류

```bash
# npm 전역 경로 확인
npm config get prefix

# PATH에 추가 (Windows)
setx PATH "%PATH%;C:\CleanDev\npm-global"

# PATH에 추가 (macOS/Linux)
export PATH="$PATH:$(npm config get prefix)/bin"
```

### 2. Claude Code 인증 오류

```bash
# Claude 재인증
claude logout
claude login

# 인증 상태 확인
superclaude --verify
```

### 3. Git 설정 오류

```bash
# Git 사용자 정보 설정
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 설정 확인
git config --list
```

### 4. GitHub 푸시 오류

#### SSH 설정 (권장)
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your@email.com"

# 공개 키 확인
cat ~/.ssh/id_ed25519.pub
# GitHub Settings > SSH Keys에 추가

# 연결 테스트
ssh -T git@github.com

# 원격 URL을 SSH로 변경
git remote set-url origin git@github.com:USERNAME/REPO.git
```

#### GitHub CLI 사용
```bash
# 설치 및 인증
gh auth login
```

### 5. 캐시 문제

```bash
# 캐시 무시하고 전체 검증
superclaude --verify --force

# npm 캐시 정리
npm cache clean --force
```

---

## 팁과 모범 사례

### 1. 커밋 메시지 최적화

- **컨텍스트 제공**: 중요한 변경사항에는 추가 설명 포함
  ```bash
  superclaude commit "성능 개선을 위한 캐싱 로직 추가"
  ```

- **대화형 모드 활용**: 중요한 커밋은 검토 후 수정
  ```bash
  superclaude commit -i
  ```

### 2. 문서화 전략

- **정기적인 업데이트**: 주요 기능 추가 후 즉시 문서 갱신
  ```bash
  # 기능 추가 후
  superclaude readme
  superclaude docs
  ```

- **릴리스 전 준비**: 항상 변경로그와 README 업데이트
  ```bash
  npm run release:prep
  ```

### 3. 코드 품질 유지

- **정기적인 리뷰**: 주 1회 이상 AI 코드 리뷰 실행
  ```bash
  superclaude review -v
  ```

- **아이디어 수집**: 스프린트 계획 전 브레인스토밍
  ```bash
  superclaude brainstorm
  ```

### 4. 팀 협업

- **일관된 커밋 메시지**: 팀 전체가 SuperClaude 사용
- **자동화 스크립트**: package.json에 표준 스크립트 정의
- **CI/CD 통합**: GitHub Actions에서 문서 자동 생성

### 5. 성능 최적화

- **선택적 주석**: 대규모 저장소는 최근 커밋만 주석 추가
- **캐시 활용**: --verify는 필요시에만 사용
- **병렬 실행**: 여러 명령을 동시에 실행 가능

---

## 추가 리소스

- **공식 웹사이트**: https://superclaude.sh
- **GitHub 저장소**: https://github.com/gwendall/superclaude
- **이슈 트래커**: https://github.com/gwendall/superclaude/issues
- **Claude Code 문서**: https://www.anthropic.com/claude-code

---

## 요약

SuperClaude는 AI를 활용하여 개발자의 반복적인 작업을 자동화하고, 코드 품질을 향상시키며, 문서화를 간소화하는 강력한 도구입니다. Claude AI의 컨텍스트 이해 능력을 활용하여 단순한 자동화를 넘어 지능적인 개발 어시스턴트 역할을 수행합니다.

주요 이점:
- ⏱️ **시간 절약**: 커밋 메시지 작성 시간 90% 단축
- 📈 **품질 향상**: 일관되고 의미 있는 커밋 메시지
- 📚 **자동 문서화**: 항상 최신 상태의 프로젝트 문서
- 🔍 **코드 품질**: AI 기반 코드 리뷰로 버그 조기 발견
- 💡 **혁신 촉진**: AI가 제안하는 개선 아이디어

SuperClaude를 일상 워크플로우에 통합하여 더 생산적이고 효율적인 개발 경험을 만들어보세요!