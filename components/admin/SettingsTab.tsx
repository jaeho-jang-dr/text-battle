'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value })
      });
      const data = await response.json();
      if (data.success) {
        fetchSettings();
        setEditingKey(null);
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const getSettingLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      'profanity_filter_enabled': '욕설 필터 활성화',
      'ten_commandments_filter_enabled': '십계명 필터 활성화',
      'max_warnings_before_suspension': '정지 전 최대 경고 횟수',
      'daily_active_battle_limit': '일일 배틀 제한',
      'min_elo_difference_for_match': '매칭 최소 ELO 차이',
      'base_score_change': '기본 점수 변화량',
      'elo_k_factor': 'ELO K-Factor',
      'max_characters_per_user': '사용자당 최대 캐릭터 수',
      'bot_battle_enabled': '봇 배틀 활성화',
      'maintenance_mode': '점검 모드'
    };
    return labels[key] || key;
  };

  const getSettingDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      'profanity_filter_enabled': '부적절한 언어를 자동으로 필터링합니다',
      'ten_commandments_filter_enabled': '종교적 내용을 필터링합니다',
      'max_warnings_before_suspension': '이 횟수만큼 경고를 받으면 자동 정지됩니다',
      'daily_active_battle_limit': '하루에 할 수 있는 최대 배틀 수입니다',
      'min_elo_difference_for_match': '매칭 시 ELO 점수 차이 제한입니다',
      'base_score_change': '배틀 승패 시 기본 점수 변화량입니다',
      'elo_k_factor': 'ELO 점수 계산에 사용되는 K 값입니다',
      'max_characters_per_user': '한 사용자가 만들 수 있는 최대 캐릭터 수입니다',
      'bot_battle_enabled': '봇과의 배틀을 허용합니다',
      'maintenance_mode': '점검 모드 시 일반 사용자 접속을 제한합니다'
    };
    return descriptions[key] || '';
  };

  return (
    <div>
      {/* 설정 헤더 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">⚙️ 시스템 설정</h2>
        <p className="text-gray-600">
          게임 시스템의 다양한 설정을 관리합니다. 변경사항은 즉시 적용됩니다.
        </p>
      </motion.div>

      {/* 설정 목록 */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-8">로딩중...</div>
        ) : (
          settings.map((setting, index) => (
            <motion.div
              key={setting.setting_key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">
                    {getSettingLabel(setting.setting_key)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {getSettingDescription(setting.setting_key)}
                  </p>
                  
                  {editingKey === setting.setting_key ? (
                    <div className="flex gap-2">
                      {setting.setting_key.includes('enabled') || setting.setting_key.includes('mode') ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg"
                        >
                          <option value="true">활성화</option>
                          <option value="false">비활성화</option>
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg"
                        />
                      )}
                      <button
                        onClick={() => updateSetting(setting.setting_key, editValue)}
                        className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="px-4 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold text-sm"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-purple-600">
                        {setting.setting_key.includes('enabled') || setting.setting_key.includes('mode')
                          ? (setting.setting_value === 'true' ? '활성화' : '비활성화')
                          : setting.setting_value}
                      </span>
                      <button
                        onClick={() => {
                          setEditingKey(setting.setting_key);
                          setEditValue(setting.setting_value);
                        }}
                        className="px-4 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold text-sm"
                      >
                        수정
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 추가 관리 기능 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-8 mt-8"
      >
        <h3 className="text-xl font-bold mb-6">🛠️ 관리 도구</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-700">데이터베이스 관리</h4>
            <button className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors">
              📊 데이터베이스 백업
            </button>
            <button className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-colors">
              🔄 캐시 초기화
            </button>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-gray-700">시스템 관리</h4>
            <button className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors">
              📈 성능 모니터링
            </button>
            <button className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors">
              🚨 긴급 점검 모드
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}