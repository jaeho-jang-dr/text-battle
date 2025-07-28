// 배틀 플로우 테스트 스크립트
// 실행: npx tsx test-battle-flow.ts

async function testBattleFlow() {
  const baseUrl = 'http://localhost:3008';
  
  console.log('🎮 Kid Text Battle - 배틀 플로우 테스트 시작\n');

  try {
    // 1. AI 판정 엔드포인트 테스트
    console.log('1️⃣ AI 판정 엔드포인트 테스트');
    const judgeResponse = await fetch(`${baseUrl}/api/battles/judge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer system-token'
      },
      body: JSON.stringify({
        attackerText: '나는 용감한 사자야! 정글의 왕이지. 큰 소리로 어흥~ 하고 울면 모든 동물들이 놀라서 도망가. 하지만 나는 착한 사자라서 친구들을 지켜주는 걸 좋아해!',
        defenderText: '나는 똑똑한 펭귄이야! 남극에서 왔어. 미끄러운 얼음 위에서도 넘어지지 않고 잘 걸을 수 있어. 추운 곳이 좋아!',
        attackerCharacter: {
          characterName: '용감한 레오',
          animal: {
            koreanName: '사자',
            emoji: '🦁',
            traits: ['용감한', '강한', '리더십']
          }
        },
        defenderCharacter: {
          characterName: '똑똑한 펭펭',
          animal: {
            koreanName: '펭귄',
            emoji: '🐧',
            traits: ['똑똑한', '귀여운', '수영']
          }
        }
      })
    });

    const judgeResult = await judgeResponse.json();
    console.log('✅ AI 판정 결과:', judgeResult.success ? '성공' : '실패');
    if (judgeResult.success) {
      console.log('   - 승자:', judgeResult.data.winner);
      console.log('   - 판정:', judgeResult.data.judgment);
      console.log('   - 이유:', judgeResult.data.reasoning);
      console.log('   - 격려:', judgeResult.data.encouragement);
    } else {
      console.log('   - 에러:', judgeResult.error);
    }

    // 2. 부적절한 내용 필터링 테스트
    console.log('\n2️⃣ 부적절한 내용 필터링 테스트');
    const filterResponse = await fetch(`${baseUrl}/api/battles/judge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer system-token'
      },
      body: JSON.stringify({
        attackerText: '나는 바보 펭귄을 싫어해!',
        defenderText: '착한 동물이야',
        attackerCharacter: {
          characterName: '나쁜 사자',
          animal: { koreanName: '사자', emoji: '🦁' }
        },
        defenderCharacter: {
          characterName: '착한 펭귄',
          animal: { koreanName: '펭귄', emoji: '🐧' }
        }
      })
    });

    const filterResult = await filterResponse.json();
    console.log('✅ 필터링 결과:', filterResult.success ? '통과' : '차단됨');
    if (!filterResult.success) {
      console.log('   - 이유:', filterResult.error);
      console.log('   - 상세:', filterResult.details?.attacker?.issues);
    }

    // 3. 점수 평가 시스템 테스트
    console.log('\n3️⃣ 점수 평가 시스템 테스트');
    const scoreTests = [
      {
        name: '창의적인 텍스트',
        text: '나는 마법의 무지개를 타고 하늘을 날아다니는 꿈꾸는 유니콘이야! 별들과 친구가 되어 우주를 모험하는 것을 좋아해. 상상의 세계에서는 뭐든지 가능해!',
        character: { characterName: '꿈꾸는 유니', animal: { koreanName: '유니콘', emoji: '🦄' } }
      },
      {
        name: '일반적인 텍스트',
        text: '나는 강아지야. 꼬리를 흔들어. 멍멍 짖어.',
        character: { characterName: '평범한 멍멍이', animal: { koreanName: '강아지', emoji: '🐕' } }
      }
    ];

    for (const test of scoreTests) {
      const response = await fetch(`${baseUrl}/api/battles/judge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer system-token'
        },
        body: JSON.stringify({
          attackerText: test.text,
          defenderText: '기본 텍스트입니다.',
          attackerCharacter: test.character,
          defenderCharacter: { characterName: '기본', animal: { koreanName: '동물', emoji: '🐾' } }
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log(`\n   [${test.name}]`);
        console.log(`   - 창의성: ${result.data.scores.attacker.breakdown.creativity}/30`);
        console.log(`   - 적절성: ${result.data.scores.attacker.breakdown.appropriateness}/30`);
        console.log(`   - 긍정성: ${result.data.scores.attacker.breakdown.positivity}/20`);
        console.log(`   - 관련성: ${result.data.scores.attacker.breakdown.relevance}/20`);
        console.log(`   - 총점: ${result.data.scores.attacker.total}/100`);
      }
    }

    console.log('\n✨ 모든 테스트 완료!');
    console.log('\n💡 다음 단계:');
    console.log('1. npm run dev로 서버 실행');
    console.log('2. /play 페이지에서 실제 배틀 테스트');
    console.log('3. 리더보드 확인 (/leaderboard)');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
testBattleFlow();