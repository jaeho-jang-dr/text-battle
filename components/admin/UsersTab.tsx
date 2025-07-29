'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  email: string;
  display_name: string;
  is_guest: number;
  is_suspended: number;
  warning_count: number;
  character_count: number;
  highest_score: number;
  total_wins: number;
  total_losses: number;
  created_at: string;
  last_login: string;
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users/search?limit=100', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      fetchTopUsers();
      return;
    }

    setIsLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.data);
        setShowUserDetail(true);
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  return (
    <div>
      {/* 검색 바 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">👥 사용자 관리</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="이메일, 이름, ID로 검색..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={searchUsers}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-colors"
          >
            🔍 검색
          </button>
          <button
            onClick={fetchTopUsers}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
          >
            🔄 초기화
          </button>
        </div>
      </motion.div>

      {/* 사용자 목록 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8"
      >
        <h3 className="text-xl font-bold mb-6">상위 100명 사용자</h3>
        {isLoading ? (
          <div className="text-center py-8">로딩중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                <tr>
                  <th className="px-4 py-3 text-left">순위</th>
                  <th className="px-4 py-3 text-left">사용자</th>
                  <th className="px-4 py-3 text-center">유형</th>
                  <th className="px-4 py-3 text-center">캐릭터</th>
                  <th className="px-4 py-3 text-center">최고점수</th>
                  <th className="px-4 py-3 text-center">승률</th>
                  <th className="px-4 py-3 text-center">상태</th>
                  <th className="px-4 py-3 text-center">가입일</th>
                  <th className="px-4 py-3 text-center">마지막 접속</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b hover:bg-purple-50 cursor-pointer"
                    onClick={() => fetchUserDetail(user.id)}
                  >
                    <td className="px-4 py-3">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-bold">{user.display_name || '이름없음'}</div>
                        <div className="text-sm text-gray-500">{user.email || '게스트'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.is_guest ? 'bg-gray-200' : 'bg-blue-200'
                      }`}>
                        {user.is_guest ? '게스트' : '일반'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{user.character_count}</td>
                    <td className="px-4 py-3 text-center font-bold">{user.highest_score || 0}</td>
                    <td className="px-4 py-3 text-center">
                      {user.total_wins + user.total_losses > 0
                        ? `${Math.round((user.total_wins / (user.total_wins + user.total_losses)) * 100)}%`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.is_suspended ? (
                        <span className="text-red-600 font-bold">정지</span>
                      ) : user.warning_count > 0 ? (
                        <span className="text-orange-600">경고 {user.warning_count}</span>
                      ) : (
                        <span className="text-green-600">정상</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {new Date(user.last_login).toLocaleDateString('ko-KR')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* 사용자 상세 모달 */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">사용자 상세 정보</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-3xl hover:text-red-500"
              >
                ×
              </button>
            </div>

            {/* 기본 정보 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">기본 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">ID:</span> {selectedUser.user.id}
                </div>
                <div>
                  <span className="text-gray-600">이메일:</span> {selectedUser.user.email || '게스트'}
                </div>
                <div>
                  <span className="text-gray-600">표시명:</span> {selectedUser.user.display_name || '없음'}
                </div>
                <div>
                  <span className="text-gray-600">상태:</span> 
                  {selectedUser.user.is_suspended ? (
                    <span className="text-red-600 font-bold"> 정지</span>
                  ) : (
                    <span className="text-green-600"> 정상</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">경고 횟수:</span> {selectedUser.user.warning_count}
                </div>
                <div>
                  <span className="text-gray-600">가입일:</span> {new Date(selectedUser.user.created_at).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>

            {/* 캐릭터 목록 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">캐릭터 목록</h3>
              <div className="grid gap-4">
                {selectedUser.characters.map((char: any) => (
                  <div key={char.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{char.emoji}</span>
                        <div>
                          <div className="font-bold">{char.character_name}</div>
                          <div className="text-sm text-gray-600">{char.korean_name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">점수: {char.base_score}</div>
                        <div className="text-sm">ELO: {char.elo_score}</div>
                        <div className="text-sm">승률: {char.win_rate}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 배틀 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">최근 배틀 기록</h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left">시간</th>
                      <th className="px-2 py-1 text-left">역할</th>
                      <th className="px-2 py-1 text-left">상대</th>
                      <th className="px-2 py-1 text-center">결과</th>
                      <th className="px-2 py-1 text-center">점수변화</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.recentBattles.map((battle: any) => (
                      <tr key={battle.id} className="border-b">
                        <td className="px-2 py-1">{new Date(battle.created_at).toLocaleString('ko-KR')}</td>
                        <td className="px-2 py-1">{battle.user_role === 'attacker' ? '공격' : '방어'}</td>
                        <td className="px-2 py-1">
                          {battle.user_role === 'attacker' ? battle.defender_name : battle.attacker_name}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {(battle.user_role === 'attacker' && battle.winner_id === battle.attacker_id) ||
                           (battle.user_role === 'defender' && battle.winner_id === battle.defender_id) ? (
                            <span className="text-green-600 font-bold">승</span>
                          ) : (
                            <span className="text-red-600 font-bold">패</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {battle.user_role === 'attacker' 
                            ? battle.attacker_score_change
                            : battle.defender_score_change}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}