-- 샘플 데이터 생성 스크립트
-- 5개의 샘플 계정과 캐릭터를 생성하여 리더보드에 배치

-- 샘플 사용자 생성
INSERT INTO users (email, is_guest, display_name) VALUES
('sample1@kidtextbattle.com', FALSE, '용감한사자'),
('sample2@kidtextbattle.com', FALSE, '날쌘독수리'),
('sample3@kidtextbattle.com', FALSE, '지혜로운부엉이'),
('sample4@kidtextbattle.com', FALSE, '강력한곰'),
('sample5@kidtextbattle.com', FALSE, '빠른치타');

-- 샘플 캐릭터 생성 (각 사용자당 1개씩)
-- 사용자 ID를 가져와서 캐릭터 생성
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
  user4_id UUID;
  user5_id UUID;
BEGIN
  -- 사용자 ID 가져오기
  SELECT id INTO user1_id FROM users WHERE email = 'sample1@kidtextbattle.com';
  SELECT id INTO user2_id FROM users WHERE email = 'sample2@kidtextbattle.com';
  SELECT id INTO user3_id FROM users WHERE email = 'sample3@kidtextbattle.com';
  SELECT id INTO user4_id FROM users WHERE email = 'sample4@kidtextbattle.com';
  SELECT id INTO user5_id FROM users WHERE email = 'sample5@kidtextbattle.com';

  -- 캐릭터 생성
  INSERT INTO characters (user_id, animal_id, character_name, battle_text, base_score, elo_score, wins, losses) VALUES
  -- 사자 캐릭터 (1위)
  (user1_id, 1, '황금갈기', '나는 정글의 왕! 용감하고 강력한 사자다. 모든 동물들이 나를 존경한다. 내 포효 소리는 온 초원을 울린다!', 2850, 1820, 45, 5),
  
  -- 유니콘 캐릭터 (2위)
  (user2_id, 6, '무지개뿔', '마법의 숲에서 온 신비로운 유니콘! 내 뿔은 무지개빛으로 빛나고 치유의 힘을 가지고 있어. 순수한 마음만이 나를 볼 수 있지!', 2600, 1750, 38, 7),
  
  -- 티라노사우루스 캐릭터 (3위)
  (user3_id, 11, '다이노킹', '백악기 최강의 포식자! 거대한 이빨과 강력한 턱으로 모든 것을 부순다. 나는 공룡의 왕이다! 라오오오어!', 2400, 1680, 32, 8),
  
  -- 드래곤 캐릭터 (4위)
  (user4_id, 7, '불꽃날개', '하늘을 지배하는 전설의 드래곤! 내 입에서 나오는 불꽃은 모든 것을 태운다. 보물을 지키는 수호자이자 하늘의 제왕!', 2200, 1620, 28, 12),
  
  -- 돌고래 캐릭터 (5위)
  (user5_id, 4, '파도타기', '바다의 친구 돌고래! 똑똑하고 재빠르게 파도를 가르며 헤엄친다. 내 클릭 소리로 모든 것을 알 수 있어! 바다의 수호자!', 2000, 1580, 25, 15);

  -- 배틀 기록 생성 (최근 배틀 몇 개)
  -- 황금갈기 vs 무지개뿔
  INSERT INTO battles (attacker_id, defender_id, battle_type, winner_id, attacker_score_change, defender_score_change, attacker_elo_change, defender_elo_change, ai_judgment, created_at)
  SELECT 
    c1.id, c2.id, 'active', c1.id, 50, -50, 25, -25,
    '황금갈기의 용감함과 리더십이 무지개뿔의 마법을 압도했다. 정글의 왕다운 카리스마로 승리!',
    NOW() - INTERVAL '2 hours'
  FROM characters c1, characters c2
  WHERE c1.character_name = '황금갈기' AND c2.character_name = '무지개뿔';

  -- 다이노킹 vs 불꽃날개
  INSERT INTO battles (attacker_id, defender_id, battle_type, winner_id, attacker_score_change, defender_score_change, attacker_elo_change, defender_elo_change, ai_judgment, created_at)
  SELECT 
    c1.id, c2.id, 'active', c1.id, 50, -50, 28, -28,
    '다이노킹의 압도적인 힘이 불꽃날개의 화염을 뚫고 승리했다. 공룡의 제왕답게 강력한 모습!',
    NOW() - INTERVAL '4 hours'
  FROM characters c1, characters c2
  WHERE c1.character_name = '다이노킹' AND c2.character_name = '불꽃날개';

  -- 파도타기 vs 황금갈기 (역전)
  INSERT INTO battles (attacker_id, defender_id, battle_type, winner_id, attacker_score_change, defender_score_change, attacker_elo_change, defender_elo_change, ai_judgment, created_at)
  SELECT 
    c1.id, c2.id, 'passive', c1.id, 80, -50, 40, -20,
    '파도타기의 지능과 민첩함이 황금갈기를 놀라게 했다! 바다의 지혜로 육지의 왕을 이겼다!',
    NOW() - INTERVAL '6 hours'
  FROM characters c1, characters c2
  WHERE c1.character_name = '파도타기' AND c2.character_name = '황금갈기';

END $$;

-- 일일 배틀 카운터 리셋 (테스트를 위해)
UPDATE characters SET 
  active_battles_today = FLOOR(RANDOM() * 5),
  passive_battles_today = FLOOR(RANDOM() * 3),
  total_active_battles = wins + losses,
  total_passive_battles = FLOOR(RANDOM() * 20)
WHERE character_name IN ('황금갈기', '무지개뿔', '다이노킹', '불꽃날개', '파도타기');