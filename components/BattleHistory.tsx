'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BattleHistoryResponse, 
  BattleHistoryEntry, 
  BattleStats,
  BattleInsight 
} from '@/types/battle-history';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BattleHistoryProps {
  characterId: string;
  characterName: string;
  onClose: () => void;
}

export default function BattleHistory({ characterId, characterName, onClose }: BattleHistoryProps) {
  const [history, setHistory] = useState<BattleHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'stats' | 'timeline'>('history');
  const [page, setPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const fetchHistory = async (offset: number = 0, forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // 강제 새로고침인 경우 캐시 무효화를 위해 timestamp 추가
      const url = forceRefresh 
        ? `/api/battles/history?characterId=${characterId}&limit=20&offset=${offset}&includeStats=true&includeTimeline=true&_t=${Date.now()}`
        : `/api/battles/history?characterId=${characterId}&limit=20&offset=${offset}&includeStats=true&includeTimeline=true`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 강제 새로고침인 경우 캐시 무시
          ...(forceRefresh && { 'Cache-Control': 'no-cache' })
        }
      });

      if (!response.ok) {
        throw new Error('히스토리를 불러올 수 없습니다');
      }

      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
        setError(null);
      } else {
        throw new Error(data.error || '오류가 발생했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page * 20);
  }, [page]);

  // 새로고침 함수
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    setPage(0); // 첫 페이지로 리셋
    try {
      await fetchHistory(0, true); // 강제 새로고침
      setRefreshSuccess(true);
      // 3초 후 성공 표시 제거
      setTimeout(() => setRefreshSuccess(false), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderBattleEntry = (entry: BattleHistoryEntry) => (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        entry.isWin 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{entry.opponentAnimal.emoji}</span>
            <span className="font-bold">{entry.opponentName}</span>
            <span className="text-sm text-gray-500">
              ({entry.opponentAnimal.koreanName})
            </span>
            {entry.battleType === 'active' && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                공격
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className={`font-bold ${entry.isWin ? 'text-green-600' : 'text-red-600'}`}>
              {entry.isWin ? '승리' : '패배'}
            </span>
            <span>
              점수: {entry.scoreChange > 0 ? '+' : ''}{entry.scoreChange}
            </span>
            <span>
              ELO: {entry.eloChange > 0 ? '+' : ''}{entry.eloChange}
            </span>
          </div>

          {entry.aiJudgment && (
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-semibold">AI 판정:</p>
              <p className="italic">{entry.aiJudgment}</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(entry.createdAt), { 
            addSuffix: true, 
            locale: ko 
          })}
        </div>
      </div>
    </motion.div>
  );

  const renderStats = (stats: BattleStats) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-bold text-gray-700 mb-2">전적</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>총 배틀:</span>
            <span className="font-bold">{stats.totalBattles}</span>
          </div>
          <div className="flex justify-between">
            <span>승리:</span>
            <span className="font-bold text-green-600">{stats.wins}</span>
          </div>
          <div className="flex justify-between">
            <span>패배:</span>
            <span className="font-bold text-red-600">{stats.losses}</span>
          </div>
          <div className="flex justify-between">
            <span>승률:</span>
            <span className="font-bold">{stats.winRate}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-bold text-gray-700 mb-2">연승/연패</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>현재:</span>
            <span className={`font-bold ${
              stats.currentStreak > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(stats.currentStreak)}
              {stats.currentStreak > 0 ? '연승' : stats.currentStreak < 0 ? '연패' : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>최고 연승:</span>
            <span className="font-bold">{stats.bestStreak}</span>
          </div>
          <div className="flex justify-between">
            <span>평균 점수 변화:</span>
            <span className="font-bold">
              {stats.averageScoreChange > 0 ? '+' : ''}{stats.averageScoreChange}
            </span>
          </div>
        </div>
      </div>

      {stats.favoriteOpponent && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-bold text-gray-700 mb-2">라이벌</h4>
          <p className="font-semibold">{stats.favoriteOpponent.characterName}</p>
          <p className="text-sm text-gray-600">
            {stats.favoriteOpponent.battleCount}번 대결
          </p>
        </div>
      )}

      {stats.nemesis && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-bold text-gray-700 mb-2">천적</h4>
          <p className="font-semibold">{stats.nemesis.characterName}</p>
          <p className="text-sm text-gray-600">
            {stats.nemesis.lossCount}번 패배
          </p>
        </div>
      )}
    </div>
  );

  const renderInsights = (insights: BattleInsight[]) => (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            insight.type === 'achievement' 
              ? 'bg-yellow-50 border-yellow-200'
              : insight.type === 'trend'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-purple-50 border-purple-200'
          }`}
        >
          <span className="text-2xl">{insight.icon}</span>
          <p className="text-sm font-medium">{insight.message}</p>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {characterName}의 배틀 히스토리
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isRefreshing || loading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : refreshSuccess
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                }`}
                title="방금 완료한 배틀을 포함한 최신 데이터로 새로고침"
              >
                <span className={`text-lg transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`}>
                  {refreshSuccess ? '✅' : '🔄'}
                </span>
                <span className="text-sm">
                  {isRefreshing ? '새로고침 중...' : refreshSuccess ? '업데이트 완료!' : '새로고침'}
                </span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              배틀 기록
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              통계
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              타임라인
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              <p>{error}</p>
            </div>
          ) : history ? (
            <>
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {history.insights && history.insights.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-bold text-lg mb-3">인사이트</h3>
                      {renderInsights(history.insights)}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {history.history.map(renderBattleEntry)}
                  </div>

                  {history.pagination.hasMore && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        더 보기
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stats' && history.stats && (
                renderStats(history.stats)
              )}

              {activeTab === 'timeline' && history.timeline && (
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">점수 변화 추이</h3>
                  <div className="text-center text-gray-500">
                    타임라인 차트는 추후 구현 예정입니다
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}