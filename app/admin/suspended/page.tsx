"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FiHome, FiUnlock, FiAlertCircle } from 'react-icons/fi';
import HelpButton from '@/components/HelpButton';

interface SuspendedAccount {
  id: string;
  username: string;
  email?: string;
  parent_email?: string;
  warnings_count: number;
  suspended_at: string;
  suspension_reason: string;
  character_count: number;
  battle_count: number;
}

export default function SuspendedAccountsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<SuspendedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
    fetchSuspendedAccounts();
  }, []);

  const checkAdminAccess = async () => {
    const userData = localStorage.getItem('kid-battle-user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      alert('관리자만 접근할 수 있어요! 🚫');
      router.push('/dashboard');
      return;
    }
  };

  const fetchSuspendedAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('suspended_accounts')
        .select('*')
        .order('suspended_at', { ascending: false });

      if (error) {
        console.error('정지 계정 조회 오류:', error);
        return;
      }

      setAccounts(data || []);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async (accountId: string) => {
    if (!confirm('정말로 이 계정의 정지를 해제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          account_suspended: false,
          suspended_at: null,
          suspension_reason: null,
          warnings_count: 0
        })
        .eq('id', accountId);

      if (error) {
        alert('계정 정지 해제에 실패했습니다.');
        return;
      }

      // 경고 기록도 삭제
      await supabase
        .from('user_warnings')
        .delete()
        .eq('user_id', accountId);

      alert('계정 정지가 해제되었습니다.');
      fetchSuspendedAccounts();
    } catch (error) {
      console.error('정지 해제 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🚫
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <HelpButton 
        page="admin-suspended" 
        customHelp={[
          {
            id: '1',
            title: '🚫 정지 계정 관리',
            content: '부적절한 언어 사용으로 정지된 계정들을 관리합니다.\n3회 경고시 자동 정지됩니다.',
            emoji: '⚠️'
          }
        ]}
      />

      {/* 홈 버튼 */}
      <Link href="/admin" className="fixed top-4 left-4">
        <button className="bg-gray-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
          <FiHome className="text-2xl" />
        </button>
      </Link>

      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            🚫 정지된 계정 관리
          </h1>
          <p className="text-xl text-gray-700">
            총 {accounts.length}개의 정지된 계정이 있습니다.
          </p>
        </motion.div>

        {/* 정지 계정 목록 */}
        {accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-8 rounded-2xl shadow-lg text-center"
          >
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl text-gray-600">
              정지된 계정이 없습니다!
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{account.username}</h3>
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                        경고 {account.warnings_count}회
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">이메일:</span> {account.email || '없음'}
                      </div>
                      <div>
                        <span className="font-semibold">부모 이메일:</span> {account.parent_email || '없음'}
                      </div>
                      <div>
                        <span className="font-semibold">캐릭터:</span> {account.character_count}개
                      </div>
                      <div>
                        <span className="font-semibold">배틀:</span> {account.battle_count}회
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm">
                        <span className="font-semibold">정지 일시:</span> {formatDate(account.suspended_at)}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">정지 사유:</span> {account.suspension_reason}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUnsuspend(account.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                    >
                      <FiUnlock />
                      정지 해제
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 안내 메시지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-yellow-100 p-6 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-2xl text-yellow-600 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">계정 정지 시스템 안내</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 부적절한 언어 사용시 자동으로 경고가 부여됩니다</li>
                <li>• 3회 경고시 계정이 자동으로 정지됩니다</li>
                <li>• 정지 해제시 경고 횟수가 초기화됩니다</li>
                <li>• 정지된 사용자는 게임에 접속할 수 없습니다</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}