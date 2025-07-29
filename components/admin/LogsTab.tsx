'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Log {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export default function LogsTab() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [logType, setLogType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [logType, autoRefresh]);

  const fetchLogs = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/logs?type=${logType}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'admin_login': return 'text-blue-600';
      case 'battle_created': return 'text-green-600';
      case 'user_login': return 'text-purple-600';
      case 'character_created': return 'text-orange-600';
      case 'warning_issued': return 'text-red-600';
      case 'user_suspended': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'admin_login': return '🔐';
      case 'battle_created': return '⚔️';
      case 'user_login': return '👤';
      case 'character_created': return '🦁';
      case 'warning_issued': return '⚠️';
      case 'user_suspended': return '🚫';
      default: return '📝';
    }
  };

  return (
    <div>
      {/* 필터 및 설정 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📜 시스템 로그</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span>자동 새로고침 (5초)</span>
            </label>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
            >
              🔄 새로고침
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setLogType('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              logType === 'all' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setLogType('admin')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              logType === 'admin' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            관리자
          </button>
          <button
            onClick={() => setLogType('user')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              logType === 'user' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            사용자
          </button>
          <button
            onClick={() => setLogType('battle')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              logType === 'battle' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            배틀
          </button>
          <button
            onClick={() => setLogType('warning')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              logType === 'warning' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            경고/정지
          </button>
        </div>
      </motion.div>

      {/* 로그 목록 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8"
      >
        <h3 className="text-xl font-bold mb-6">최근 로그 (최대 500개)</h3>
        {isLoading ? (
          <div className="text-center py-8">로딩중...</div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log, index) => {
              let details;
              try {
                details = JSON.parse(log.details || '{}');
              } catch {
                details = {};
              }

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.01 }}
                  className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="text-2xl">
                    {getActionTypeIcon(log.action_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getActionTypeColor(log.action_type)}`}>
                        {log.action_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {log.user_name || log.user_email || log.admin_id}
                      {details.username && ` (${details.username})`}
                      {details.attackerId && ` - 공격자: ${details.attackerId}`}
                      {details.defenderId && ` vs 방어자: ${details.defenderId}`}
                      {details.winner && ` → 승자: ${details.winner}`}
                      {details.characterName && ` - 캐릭터: ${details.characterName}`}
                    </div>
                    {log.target_id && (
                      <div className="text-xs text-gray-400">
                        대상 ID: {log.target_id}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 로그 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 text-center"
        >
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold">
            {logs.filter(log => log.action_type === 'battle_created').length}
          </div>
          <div className="text-gray-600">오늘의 배틀</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6 text-center"
        >
          <div className="text-3xl mb-2">👤</div>
          <div className="text-2xl font-bold">
            {logs.filter(log => log.action_type === 'user_login').length}
          </div>
          <div className="text-gray-600">로그인 횟수</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-6 text-center"
        >
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-2xl font-bold text-red-600">
            {logs.filter(log => log.action_type === 'warning_issued' || log.action_type === 'user_suspended').length}
          </div>
          <div className="text-gray-600">경고/정지</div>
        </motion.div>
      </div>
    </div>
  );
}