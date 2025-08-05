# Replit 배포 자동 트리거 시스템 🤖

## 자동 실행 트리거 키워드

다음 키워드가 감지되면 자동으로 DevOps Replit Agent가 활성화됩니다:

### 1차 트리거 (즉시 실행)
- "replit 배포"
- "replit에 배포"
- "replit.com 배포"
- "레플릿 배포"
- "deploy to replit"
- "replit deployment"

### 2차 트리거 (컨텍스트 확인)
- "온라인 배포" + "무료"
- "웹 호스팅" + "간단한"
- "배포하고 싶어" + "쉽게"
- "서버 없이" + "실행"

## 자동 응답 플로우

### 단계 1: 프로젝트 분석
```javascript
// 자동으로 실행되는 분석
const analyzeProject = () => {
  return {
    hasPackageJson: fs.existsSync('package.json'),
    framework: detectFramework(),
    hasDatabase: checkDatabase(),
    currentFiles: getProjectStructure()
  };
};
```

### 단계 2: 맞춤형 가이드 제공
```javascript
const getCustomGuide = (projectInfo) => {
  if (projectInfo.framework === 'next') {
    return 'Next.js Replit 배포 가이드';
  } else if (projectInfo.framework === 'express') {
    return 'Express Replit 배포 가이드';
  }
  // ... 기타 프레임워크
};
```

### 단계 3: 필수 파일 자동 생성
```javascript
const createReplitFiles = () => {
  // .replit 파일 생성
  // replit.nix 파일 생성
  // 환경 설정 파일 생성
};
```

## Claude.ai 통합 설정

### 자동 감지 규칙
```yaml
triggers:
  - pattern: "replit|레플릿"
    context: "배포|deploy|호스팅|hosting"
    action: "activate_replit_agent"
    
  - pattern: "온라인.*실행|웹.*배포"
    context: "무료|free|간단|simple"
    suggestion: "replit_deployment"
    
  - pattern: "배포.*어떻게|deploy.*how"
    response: "check_replit_suitable"
```

### 자동 실행 스크립트
```javascript
// agents/replit-auto-deploy.js
class ReplitAutoDeployer {
  constructor() {
    this.triggers = [
      /replit.*배포/i,
      /deploy.*replit/i,
      /레플릿.*배포/i,
      /replit\.com/i
    ];
  }
  
  shouldActivate(userInput) {
    return this.triggers.some(trigger => trigger.test(userInput));
  }
  
  async activate() {
    console.log('🚀 Replit 배포 모드 활성화됨!');
    
    // 1. 프로젝트 분석
    const analysis = await this.analyzeProject();
    
    // 2. 필수 파일 생성
    await this.createRequiredFiles(analysis);
    
    // 3. 가이드 표시
    this.showDeploymentGuide(analysis);
    
    // 4. 체크리스트 실행
    await this.runChecklist();
  }
  
  async analyzeProject() {
    // 프로젝트 구조 분석
    const files = await this.scanDirectory('.');
    const packageJson = await this.readPackageJson();
    
    return {
      type: this.detectProjectType(files, packageJson),
      database: this.detectDatabase(files),
      framework: this.detectFramework(packageJson),
      hasReplitConfig: files.includes('.replit'),
      missingFiles: this.checkMissingFiles(files)
    };
  }
  
  async createRequiredFiles(analysis) {
    const files = [];
    
    if (!analysis.hasReplitConfig) {
      files.push({
        name: '.replit',
        content: this.generateReplitConfig(analysis)
      });
    }
    
    if (!analysis.hasNixConfig) {
      files.push({
        name: 'replit.nix',
        content: this.generateNixConfig(analysis)
      });
    }
    
    // 파일 생성
    for (const file of files) {
      await this.createFile(file.name, file.content);
      console.log(`✅ ${file.name} 생성됨`);
    }
  }
  
  showDeploymentGuide(analysis) {
    console.log('\n📋 Replit 배포 가이드\n');
    
    if (analysis.type === 'nextjs') {
      console.log('Next.js 앱 감지됨! 다음 단계를 따라하세요:');
      console.log('1. next.config.js에 output: "standalone" 추가');
      console.log('2. 이미지 최적화 비활성화');
      console.log('3. 환경 변수 설정');
    }
    
    // 데이터베이스 가이드
    if (analysis.database) {
      console.log(`\n💾 ${analysis.database} 데이터베이스 설정:`);
      this.showDatabaseGuide(analysis.database);
    }
  }
}

// 자동 실행 등록
module.exports = new ReplitAutoDeployer();
```

## 사용자 경험 향상

### 스마트 제안
```javascript
// 사용자가 "배포하고 싶어"라고 하면
if (userWantsDeploy && !hasDeploymentPlatform) {
  suggest(`
    무료로 쉽게 배포하시려면 Replit을 추천드립니다!
    - 설정이 간단해요
    - 무료 플랜 제공
    - 자동 HTTPS
    
    Replit 배포를 시작하시겠습니까? (Y/n)
  `);
}
```

### 문제 자동 해결
```javascript
// 일반적인 문제 자동 감지 및 해결
const autoFix = {
  'port_error': () => {
    // process.env.PORT 자동 수정
    updateFile('server.js', /port = \d+/, 'port = process.env.PORT || 3000');
  },
  
  'memory_limit': () => {
    // 메모리 최적화 설정 추가
    addToFile('.replit', 'run = "node --max-old-space-size=512 index.js"');
  },
  
  'build_error': () => {
    // 빌드 명령어 수정
    updatePackageJson({ scripts: { build: 'next build' } });
  }
};
```

## 완전 자동화 명령어

### 한 줄 배포
```bash
# 이 명령어 하나로 모든 것이 자동 설정됩니다
npx replit-deploy-agent
```

### 대화형 배포
```
사용자: "이 프로젝트를 온라인에서 실행하고 싶어"
Claude: "Replit 배포를 도와드릴게요! 프로젝트를 분석중..."

[자동 실행]
✅ Next.js 프로젝트 감지
✅ SQLite 데이터베이스 감지  
✅ .replit 파일 생성
✅ 환경 설정 완료

다음 단계:
1. GitHub에 코드 푸시
2. Replit.com에서 Import
3. Run 버튼 클릭!
```

## 트러블슈팅 자동화

### 에러 패턴 매칭
```javascript
const errorPatterns = {
  'Cannot find module': {
    solution: 'npm install 실행',
    autoFix: () => execSync('npm install')
  },
  
  'EADDRINUSE': {
    solution: 'PORT 환경 변수 사용',
    autoFix: () => updatePortConfig()
  },
  
  'JavaScript heap out of memory': {
    solution: '메모리 제한 증가',
    autoFix: () => addMemoryFlag()
  }
};
```

이제 "Replit 배포"라는 말만 나와도 자동으로 모든 것이 준비됩니다! 🚀