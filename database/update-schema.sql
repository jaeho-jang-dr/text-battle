-- Kid Text Battle 데이터베이스 스키마 업데이트
-- 부모 인증, 계정 정지, 채팅 기능 추가

-- 1. users 테이블에 경고 및 계정 정지 관련 필드 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS warnings_count INTEGER DEFAULT 0 CHECK (warnings_count >= 0),
ADD COLUMN IF NOT EXISTS account_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS parent_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_login_token VARCHAR(255) UNIQUE;

-- 2. 경고 기록 테이블
CREATE TABLE IF NOT EXISTS user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  warning_type VARCHAR(50) NOT NULL, -- 'profanity', 'ten_commandments', 'inappropriate'
  warning_message TEXT NOT NULL,
  content TEXT NOT NULL, -- 위반한 내용
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  issued_by UUID REFERENCES users(id) -- 관리자가 발행한 경우
);

-- 3. 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 200),
  is_filtered BOOLEAN DEFAULT false, -- 필터링된 메시지인지
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 콘텐츠 필터링 테이블
CREATE TABLE IF NOT EXISTS content_filters (
  id SERIAL PRIMARY KEY,
  filter_type VARCHAR(50) NOT NULL, -- 'profanity', 'ten_commandments', 'inappropriate'
  word_pattern VARCHAR(255) NOT NULL, -- 정규식 패턴
  severity INTEGER DEFAULT 1 CHECK (severity >= 1 AND severity <= 3), -- 1: 경고, 2: 심각, 3: 즉시 정지
  replacement VARCHAR(50) DEFAULT '***', -- 대체 텍스트
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 계정당 캐릭터 제한을 위한 트리거 함수
CREATE OR REPLACE FUNCTION check_character_limit() 
RETURNS TRIGGER AS $$
BEGIN
  -- 사용자가 이미 3개의 캐릭터를 가지고 있는지 확인
  IF (SELECT COUNT(*) FROM user_animals WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION '한 계정당 최대 3개의 캐릭터만 만들 수 있어요! 🦁🐧🦄';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER enforce_character_limit
BEFORE INSERT ON user_animals
FOR EACH ROW
EXECUTE FUNCTION check_character_limit();

-- 6. 채팅 메시지 자동 삭제를 위한 함수 (24시간 이상 된 메시지 삭제)
CREATE OR REPLACE FUNCTION delete_old_chat_messages() 
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 7. 기본 필터 데이터 삽입
INSERT INTO content_filters (filter_type, word_pattern, severity, replacement) VALUES
-- 욕설 필터 (아동 친화적)
('profanity', '(바보|멍청이|똥|찌질이)', 1, '***'),
('profanity', '(시발|씨발|개새끼|미친|죽어)', 2, '***'),

-- 10계명 관련 필터
('ten_commandments', '(하나님|하느님|예수|그리스도).*?(욕|나쁜|싫|증오)', 2, '***'),
('ten_commandments', '(부모|엄마|아빠).*?(싫|미워|나빠|죽)', 2, '***'),
('ten_commandments', '(죽이|살인|해치)', 2, '***'),
('ten_commandments', '(훔치|도둑질|빼앗)', 1, '***'),
('ten_commandments', '(거짓말|속이|사기)', 1, '***'),

-- 부적절한 내용
('inappropriate', '(담배|술|마약|도박)', 2, '***'),
('inappropriate', '(폭력|때리|패|공격)', 2, '***'),
('inappropriate', '(성적|섹스|야한)', 3, '***')
ON CONFLICT DO NOTHING;

-- 8. 관리자 뷰 - 정지된 계정 목록
CREATE OR REPLACE VIEW suspended_accounts AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.parent_email,
  u.warnings_count,
  u.suspended_at,
  u.suspension_reason,
  COUNT(DISTINCT ua.id) as character_count,
  COUNT(DISTINCT b.id) as battle_count
FROM users u
LEFT JOIN user_animals ua ON u.id = ua.user_id
LEFT JOIN battles b ON u.id IN (b.player1_id, b.player2_id)
WHERE u.account_suspended = true
GROUP BY u.id, u.username, u.email, u.parent_email, u.warnings_count, u.suspended_at, u.suspension_reason
ORDER BY u.suspended_at DESC;

-- 9. 인덱스 추가
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_user_warnings_user ON user_warnings(user_id);
CREATE INDEX idx_users_auto_login ON users(auto_login_token);
CREATE INDEX idx_users_suspended ON users(account_suspended);

-- 10. RLS 정책 추가
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_filters ENABLE ROW LEVEL SECURITY;

-- 채팅 메시지는 모두 볼 수 있지만 자신의 것만 삭제 가능
CREATE POLICY "Anyone can view chat messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can create own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- 경고는 관리자만 생성, 사용자는 자신의 것만 조회
CREATE POLICY "Users can view own warnings" ON user_warnings
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can create warnings" ON user_warnings
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- 필터는 관리자만 관리
CREATE POLICY "Only admins can manage filters" ON content_filters
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- 모든 사용자는 필터 조회 가능 (필터링 적용을 위해)
CREATE POLICY "Anyone can view filters" ON content_filters
  FOR SELECT USING (true);