// Test script for the new battle scoring system
import { memoryStore } from "../lib/db/memory-store";

async function testBattleScoring() {
  console.log("Testing new battle scoring system...\n");
  
  try {
    // Create test characters with different battle chats
    const testCharacters = [
      {
        id: "test_creative",
        userId: "test_user_1",
        name: "창의전사",
        battleChat: "마치 번개처럼 ⚡️ 빠르게! 불꽃처럼 🔥 뜨겁게! 운명의 검으로 너를 심판하겠다! ★",
        eloScore: 1000,
        wins: 0,
        losses: 0,
        isNPC: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "test_impact",
        userId: "test_user_2",
        name: "임팩트파이터",
        battleChat: "절대적인 힘! 영원한 승리! 무한한 파워로 네 운명을 끝장내겠다!!!",
        eloScore: 1000,
        wins: 0,
        losses: 0,
        isNPC: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "test_strategic",
        userId: "test_user_3",
        name: "전략가",
        battleChat: "먼저 방어를 굳히고, 약점을 파악한 후, 정확한 일격으로 공격하겠다. 준비되었나?",
        eloScore: 1000,
        wins: 0,
        losses: 0,
        isNPC: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "test_short",
        userId: "test_user_4",
        name: "짧은말",
        battleChat: "이긴다!",
        eloScore: 1000,
        wins: 0,
        losses: 0,
        isNPC: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Add test characters to memory store
    testCharacters.forEach(char => {
      memoryStore.characters.set(char.id, char);
    });
    
    console.log("Test characters created. Testing battles...\n");
    
    // Test battles between different character types
    const testBattles = [
      { attacker: "test_creative", defender: "test_short", description: "Creative vs Short" },
      { attacker: "test_impact", defender: "test_strategic", description: "Impact vs Strategic" },
      { attacker: "test_creative", defender: "test_strategic", description: "Creative vs Strategic" }
    ];
    
    for (const test of testBattles) {
      console.log(`\n=== ${test.description} ===`);
      
      // Make the API call
      const response = await fetch("http://localhost:3009/api/battles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attackerId: test.attacker,
          defenderId: test.defender
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const battle = result.data;
        
        console.log(`Winner: ${battle.winnerId === test.attacker ? 
          testCharacters.find(c => c.id === test.attacker)?.name : 
          testCharacters.find(c => c.id === test.defender)?.name}`);
        console.log(`Score: ${battle.attackerScore} vs ${battle.defenderScore}`);
        
        if (battle.attackerAnalysis && battle.defenderAnalysis) {
          console.log("\nAttacker Analysis:");
          console.log(`- 창의성: ${battle.attackerAnalysis.creativity}/10`);
          console.log(`- 임팩트: ${battle.attackerAnalysis.impact}/10`);
          console.log(`- 집중력: ${battle.attackerAnalysis.focus}/10`);
          console.log(`- 언어적 파워: ${battle.attackerAnalysis.linguisticPower}/10`);
          console.log(`- 전략성: ${battle.attackerAnalysis.strategy}/10`);
          console.log(`- 감정과 기세: ${battle.attackerAnalysis.emotionMomentum}/10`);
          console.log(`- 챗의 길이: ${battle.attackerAnalysis.lengthScore}/10`);
          console.log(`- 종합 점수: ${battle.attackerAnalysis.totalScore}/10`);
          
          console.log("\nDefender Analysis:");
          console.log(`- 창의성: ${battle.defenderAnalysis.creativity}/10`);
          console.log(`- 임팩트: ${battle.defenderAnalysis.impact}/10`);
          console.log(`- 집중력: ${battle.defenderAnalysis.focus}/10`);
          console.log(`- 언어적 파워: ${battle.defenderAnalysis.linguisticPower}/10`);
          console.log(`- 전략성: ${battle.defenderAnalysis.strategy}/10`);
          console.log(`- 감정과 기세: ${battle.defenderAnalysis.emotionMomentum}/10`);
          console.log(`- 챗의 길이: ${battle.defenderAnalysis.lengthScore}/10`);
          console.log(`- 종합 점수: ${battle.defenderAnalysis.totalScore}/10`);
        }
        
        if (battle.explanation) {
          console.log(`\n설명: ${battle.explanation}`);
        }
        
        if (battle.tip) {
          console.log(`팁: ${battle.tip}`);
        }
      } else {
        console.error("Battle failed:", await response.text());
      }
    }
    
    // Clean up test characters
    testCharacters.forEach(char => {
      memoryStore.characters.delete(char.id);
    });
    
    console.log("\n\nTest completed!");
    
  } catch (error) {
    console.error("Test error:", error);
  }
}

// Run the test
testBattleScoring();