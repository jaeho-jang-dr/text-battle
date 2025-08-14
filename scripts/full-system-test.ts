// 전체 시스템 유닛 테스트
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3010/api';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class SystemTester {
  private results: TestResult[] = [];
  private token1?: string;
  private token2?: string;
  private user1?: any;
  private user2?: any;
  private character1?: any;
  private character2?: any;

  async runAllTests() {
    console.log("🧪 Text Battle 전체 시스템 테스트 시작\n");
    console.log("═".repeat(60));
    
    // 서버 연결 테스트
    await this.test("서버 연결", this.testServerConnection.bind(this));
    
    // 인증 시스템 테스트
    await this.test("회원가입 - 사용자 1", () => this.testSignup("test1@example.com", "Test123!", "테스트전사1", "warrior"));
    await this.test("회원가입 - 사용자 2", () => this.testSignup("test2@example.com", "Test123!", "테스트마법사2", "mage"));
    await this.test("로그인 - 사용자 1", () => this.testLogin("test1@example.com", "Test123!", 1));
    await this.test("로그인 - 사용자 2", () => this.testLogin("test2@example.com", "Test123!", 2));
    
    // 캐릭터 시스템 테스트
    await this.test("캐릭터 조회 - 사용자 1", () => this.testGetCharacter(1));
    await this.test("캐릭터 조회 - 사용자 2", () => this.testGetCharacter(2));
    
    // 배틀 시스템 테스트
    await this.test("NPC와 배틀 - 사용자 1", () => this.testNPCBattle(1));
    await this.test("리더보드 확인", this.testLeaderboard.bind(this));
    await this.test("PvP 배틀 - 사용자 1 vs 사용자 2", this.testPvPBattle.bind(this));
    
    // 배틀 제한 테스트
    await this.test("배틀 쿨다운 테스트", this.testBattleCooldown.bind(this));
    
    // 통계 테스트
    await this.test("배틀 통계 확인", this.testBattleStats.bind(this));
    
    // 관리자 기능 테스트 (준비)
    await this.test("관리자 로그인 테스트", this.testAdminLogin.bind(this));
    
    // 결과 출력
    this.printResults();
  }

  private async test(name: string, testFn: () => Promise<void>) {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        message: "성공",
        duration: Date.now() - startTime
      });
      console.log(`✅ ${name}`);
    } catch (error: any) {
      this.results.push({
        name,
        passed: false,
        message: error.message || "알 수 없는 오류",
        duration: Date.now() - startTime
      });
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  private async testServerConnection() {
    const response = await fetch(API_BASE_URL.replace('/api', ''));
    if (!response.ok) throw new Error("서버 연결 실패");
  }

  private async testSignup(email: string, password: string, name: string, type: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, characterType: type })
    });
    
    if (!response.ok && response.status !== 409) {
      const error = await response.json();
      throw new Error(error.error || "회원가입 실패");
    }
  }

  private async testLogin(email: string, password: string, userNum: number) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "로그인 실패");
    }
    
    const data = await response.json();
    if (userNum === 1) {
      this.token1 = data.token;
      this.user1 = data.user;
    } else {
      this.token2 = data.token;
      this.user2 = data.user;
    }
  }

  private async testGetCharacter(userNum: number) {
    const token = userNum === 1 ? this.token1 : this.token2;
    if (!token) throw new Error("토큰이 없습니다");
    
    const response = await fetch(`${API_BASE_URL}/characters/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error("캐릭터 조회 실패");
    
    const character = await response.json();
    if (userNum === 1) {
      this.character1 = character;
    } else {
      this.character2 = character;
    }
  }

  private async testNPCBattle(userNum: number) {
    const token = userNum === 1 ? this.token1 : this.token2;
    const character = userNum === 1 ? this.character1 : this.character2;
    
    if (!token || !character) throw new Error("인증 정보가 없습니다");
    
    const npcId = `npc_${Math.floor(Math.random() * 20) + 1}`;
    const response = await fetch(`${API_BASE_URL}/battles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        attackerId: character.id,
        defenderId: npcId
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "배틀 생성 실패");
    }
    
    const result = await response.json();
    const battle = result.data || result;
    
    // 간단한 결과 검증
    if (!battle.id || !battle.winnerId) {
      throw new Error("배틀 결과가 올바르지 않습니다");
    }
  }

  private async testLeaderboard() {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    
    if (!response.ok) throw new Error("리더보드 조회 실패");
    
    const leaderboard = await response.json();
    
    // 리더보드에 캐릭터가 있는지 확인
    const hasChar1 = leaderboard.some((entry: any) => entry.id === this.character1?.id);
    const hasChar2 = leaderboard.some((entry: any) => entry.id === this.character2?.id);
    
    console.log(`   - 리더보드 엔트리 수: ${leaderboard.length}`);
    console.log(`   - 사용자 1 포함: ${hasChar1 ? '예' : '아니오'}`);
    console.log(`   - 사용자 2 포함: ${hasChar2 ? '예' : '아니오'}`);
  }

  private async testPvPBattle() {
    if (!this.token1 || !this.character1 || !this.character2) {
      throw new Error("PvP 배틀을 위한 정보가 부족합니다");
    }
    
    const response = await fetch(`${API_BASE_URL}/battles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token1}`
      },
      body: JSON.stringify({
        attackerId: this.character1.id,
        defenderId: this.character2.id
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "PvP 배틀 생성 실패");
    }
    
    const result = await response.json();
    const battle = result.data || result;
    
    console.log(`   - 승자: ${battle.winnerId === this.character1.id ? '사용자 1' : '사용자 2'}`);
    console.log(`   - 공격자 점수: ${battle.attackerScore}`);
    console.log(`   - 방어자 점수: ${battle.defenderScore}`);
  }

  private async testBattleCooldown() {
    if (!this.token1 || !this.character1) {
      throw new Error("쿨다운 테스트를 위한 정보가 부족합니다");
    }
    
    // 첫 번째 배틀 시도 (성공해야 함)
    const npcId = `npc_1`;
    const response1 = await fetch(`${API_BASE_URL}/battles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token1}`
      },
      body: JSON.stringify({
        attackerId: this.character1.id,
        defenderId: npcId
      })
    });
    
    if (!response1.ok) throw new Error("첫 번째 배틀 실패");
    
    // 즉시 두 번째 배틀 시도 (쿨다운으로 실패해야 함)
    const response2 = await fetch(`${API_BASE_URL}/battles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token1}`
      },
      body: JSON.stringify({
        attackerId: this.character1.id,
        defenderId: npcId
      })
    });
    
    if (response2.ok) {
      throw new Error("쿨다운이 작동하지 않습니다");
    }
    
    const error = await response2.json();
    if (!error.error.includes("wait")) {
      throw new Error("쿨다운 메시지가 올바르지 않습니다");
    }
    
    console.log(`   - 쿨다운 메시지: ${error.error}`);
  }

  private async testBattleStats() {
    if (!this.token1) throw new Error("통계 조회를 위한 토큰이 없습니다");
    
    const response = await fetch(`${API_BASE_URL}/battles/stats`, {
      headers: { 'Authorization': `Bearer ${this.token1}` }
    });
    
    if (!response.ok) throw new Error("통계 조회 실패");
    
    const stats = await response.json();
    console.log(`   - 총 배틀: ${stats.totalBattles}`);
    console.log(`   - 승리: ${stats.wins}`);
    console.log(`   - 패배: ${stats.losses}`);
    console.log(`   - 승률: ${stats.winRate}%`);
    console.log(`   - 레이팅: ${stats.rating}`);
  }

  private async testAdminLogin() {
    // 관리자 로그인 엔드포인트가 구현되면 테스트
    console.log("   - 관리자 기능은 다음 단계에서 구현됩니다");
  }

  private printResults() {
    console.log("\n" + "═".repeat(60));
    console.log("📊 테스트 결과 요약\n");
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`총 테스트: ${total}`);
    console.log(`성공: ${passed}`);
    console.log(`실패: ${failed}`);
    console.log(`성공률: ${passRate}%`);
    
    if (failed > 0) {
      console.log("\n실패한 테스트:");
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.name}: ${r.message}`);
      });
    }
    
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`\n총 실행 시간: ${(totalDuration / 1000).toFixed(2)}초`);
    
    console.log("\n" + "═".repeat(60));
  }
}

// 서버 대기 함수
async function waitForServer() {
  console.log("🔄 서버 연결 대기 중...");
  
  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch('http://localhost:3010');
      if (response.ok || response.status === 404) {
        console.log("✅ 서버 연결 성공!\n");
        return true;
      }
    } catch (error) {
      // 연결 실패 시 계속 시도
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error("서버 연결 실패");
}

// 메인 실행
async function main() {
  try {
    await waitForServer();
    
    const tester = new SystemTester();
    await tester.runAllTests();
    
    console.log("\n✨ 전체 시스템 테스트 완료!");
  } catch (error) {
    console.error("❌ 테스트 실행 중 오류:", error);
    process.exit(1);
  }
}

main();