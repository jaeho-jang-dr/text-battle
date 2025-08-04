'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleLog {
  id: string;
  created_at: string;
  attacker_name: string;
  defender_name: string;
  attacker_battle_text: string;
  defender_battle_text: string;
  winner_id: string;
  ai_judgment: string;
  attacker_user_name: string;
  defender_user_name: string;
  attacker_warnings: number;
  defender_warnings: number;
  attacker_suspended: boolean;
  defender_suspended: boolean;
  attacker_is_guest: boolean;
  defender_is_guest: boolean;
  attacker_emoji: string;
  defender_emoji: string;
}

interface ProblemUser {
  id: string;
  display_name: string;
  email: string;
  is_guest: boolean;
  warning_count: number;
  is_suspended: boolean;
  created_at: string;
  character_count: number;
  battle_count: number;
  last_battle: string;
}

interface Warning {
  id: string;
  user_id: string;
  warning_type: string;
  content: string;
  created_at: string;
  display_name: string;
  character_name?: string;
}

export default function LogsTab() {
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [problemUsers, setProblemUsers] = useState<ProblemUser[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'warnings' | 'suspended' | 'guest'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [oldGuestStats, setOldGuestStats] = useState<any>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    fetchBattleLogs();
  }, [filterType, searchTerm, dateFrom, dateTo, currentPage]);

  const fetchBattleLogs = async () => {
    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        filterType,
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await fetch(`/api/admin/battle-logs?${params}`, {
        headers: { 'X-Admin-Token': adminToken || '' }
      });

      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
        setProblemUsers(data.data.problemUsers);
        setTotalPages(data.data.pagination.totalPages);
        setOldGuestStats(data.data.oldGuestUsers);
      }
    } catch (error) {
      console.error('Failed to fetch battle logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserWarnings = async (userId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/warnings?userId=${userId}`, {
        headers: { 'X-Admin-Token': adminToken || '' }
      });

      const data = await response.json();
      if (data.success) {
        setWarnings(data.data.warnings);
        setSelectedUser(userId);
        setShowWarningModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch warnings:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 제거하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/battle-logs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken || ''
        },
        body: JSON.stringify({ action: 'remove-user', userId })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchBattleLogs();
      } else {
        alert('사용자 제거에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to remove user:', error);
      alert('사용자 제거 중 오류가 발생했습니다');
    }
  };

  const handleCleanupGuests = async () => {
    if (!confirm(`24시간 이상 된 게스트 계정 ${oldGuestStats?.count || 0}개를 정리하시겠습니까?`)) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/battle-logs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken || ''
        },
        body: JSON.stringify({ action: 'cleanup-guests' })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchBattleLogs();
      } else {
        alert('게스트 정리에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to cleanup guests:', error);
      alert('게스트 정리 중 오류가 발생했습니다');
    }
  };

  const getWarningTypeLabel = (type: string) => {
    switch (type) {
      case 'profanity': return '🤬 욕설';
      case 'commandment': return '⛪ 계명 위반';
      case 'inappropriate': return '⚠️ 부적절한 내용';
      default: return '❓ 기타';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">배틀 로그 검색 및 필터</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="warnings">경고 있음</option>
            <option value="suspended">정지된 사용자</option>
            <option value="guest">게스트 사용자</option>
          </select>

          <input
            type="text"
            placeholder="검색 (이름, 이메일, 배틀 텍스트)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 게스트 정리 버튼 */}
        {oldGuestStats && oldGuestStats.count > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 mb-2">
              🕐 24시간 이상 된 게스트 계정: {oldGuestStats.count}개
            </p>
            <button
              onClick={handleCleanupGuests}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              게스트 계정 일괄 정리
            </button>
          </div>
        )}
      </div>

      {/* 문제 사용자 목록 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">⚠️ 문제 사용자 목록</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">경고</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">캐릭터</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">배틀</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">마지막 활동</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {problemUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.display_name}</p>
                      <p className="text-xs text-gray-500">{user.email || 'Guest'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.is_guest ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.is_guest ? '게스트' : '가입'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-red-600 font-bold">{user.warning_count}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_suspended ? (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">정지됨</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">활성</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{user.character_count}</td>
                  <td className="px-4 py-3 text-center">{user.battle_count}</td>
                  <td className="px-4 py-3 text-xs">
                    {user.last_battle ? formatDate(user.last_battle) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchUserWarnings(user.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        제거
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 배틀 로그 목록 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">📋 배틀 로그</h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">{formatDate(log.created_at)}</div>
                    <div className="flex gap-2">
                      {(log.attacker_warnings > 0 || log.defender_warnings > 0) && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          ⚠️ 경고
                        </span>
                      )}
                      {(log.attacker_suspended || log.defender_suspended) && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          🚫 정지
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${
                      log.winner_id === log.id ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{log.attacker_emoji}</span>
                        <span className="font-medium">{log.attacker_name}</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {log.attacker_user_name} {log.attacker_is_guest && '(게스트)'}
                        {log.attacker_warnings > 0 && ` • 경고 ${log.attacker_warnings}회`}
                      </div>
                      <div className="text-sm italic text-gray-700">
                        "{log.attacker_battle_text?.substring(0, 50)}..."
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${
                      log.winner_id !== log.id ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{log.defender_emoji}</span>
                        <span className="font-medium">{log.defender_name}</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {log.defender_user_name} {log.defender_is_guest && '(게스트)'}
                        {log.defender_warnings > 0 && ` • 경고 ${log.defender_warnings}회`}
                      </div>
                      <div className="text-sm italic text-gray-700">
                        "{log.defender_battle_text?.substring(0, 50)}..."
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium">AI 판정:</p>
                    <p className="italic">{log.ai_judgment}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-4 py-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>

      {/* 경고 상세 모달 */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowWarningModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium mb-4">경고 상세 내역</h3>
              
              <div className="space-y-3">
                {warnings.map((warning) => (
                  <div key={warning.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{getWarningTypeLabel(warning.warning_type)}</span>
                      <span className="text-xs text-gray-500">{formatDate(warning.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      사용자: {warning.display_name}
                      {warning.character_name && ` (${warning.character_name})`}
                    </p>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-sm text-gray-600 italic">"{warning.content}"</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowWarningModal(false)}
                className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}