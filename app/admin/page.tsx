"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FiUsers, FiAward, FiActivity, FiSettings, FiHome, FiHelpCircle } from 'react-icons/fi';
import { GiAnimalSkull, GiSwordsPower } from 'react-icons/gi';
import { MdPets, MdAdminPanelSettings } from 'react-icons/md';
import HelpButton from '@/components/HelpButton';

interface AdminStats {
  totalUsers: number;
  totalBattles: number;
  totalAnimals: number;
  activeToday: number;
  customAnimals: number;
  pendingApprovals: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBattles: 0,
    totalAnimals: 0,
    activeToday: 0,
    customAnimals: 0,
    pendingApprovals: 0,
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAdminAccess();
    fetchAdminStats();
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

    setCurrentUser(user);
  };

  const fetchAdminStats = async () => {
    try {
      // 총 사용자 수
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 총 배틀 수
      const { count: battleCount } = await supabase
        .from('battles')
        .select('*', { count: 'exact', head: true });

      // 총 동물 수
      const { count: animalCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true });

      // 오늘 활동한 사용자
      const today = new Date().toISOString().split('T')[0];
      const { count: activeCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', today);

      // 커스텀 동물 수
      const { count: customCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'custom');

      // 대기 중인 승인
      const { count: pendingCount } = await supabase
        .from('parent_approvals')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      setStats({
        totalUsers: userCount || 0,
        totalBattles: battleCount || 0,
        totalAnimals: animalCount || 0,
        activeToday: activeCount || 0,
        customAnimals: customCount || 0,
        pendingApprovals: pendingCount || 0,
      });
    } catch (error) {
      console.error('통계 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminMenuItems = [
    {
      title: '사용자 관리',
      icon: <FiUsers className="text-4xl" />,
      description: '모든 친구들의 계정을 관리해요',
      link: '/admin/users',
      color: 'bg-blue-500',
      emoji: '👥'
    },
    {
      title: '동물 관리',
      icon: <MdPets className="text-4xl" />,
      description: '동물 친구들을 추가하고 관리해요',
      link: '/admin/animals',
      color: 'bg-green-500',
      emoji: '🦁'
    },
    {
      title: '배틀 기록',
      icon: <GiSwordsPower className="text-4xl" />,
      description: '모든 배틀 기록을 확인해요',
      link: '/admin/battles',
      color: 'bg-red-500',
      emoji: '⚔️'
    },
    {
      title: '업적 관리',
      icon: <FiAward className="text-4xl" />,
      description: '업적과 보상을 설정해요',
      link: '/admin/achievements',
      color: 'bg-yellow-500',
      emoji: '🏆'
    },
    {
      title: '부모 승인',
      icon: <MdAdminPanelSettings className="text-4xl" />,
      description: '부모님 승인 요청을 처리해요',
      link: '/admin/approvals',
      color: 'bg-purple-500',
      emoji: '✅'
    },
    {
      title: '시스템 설정',
      icon: <FiSettings className="text-4xl" />,
      description: '게임 설정을 관리해요',
      link: '/admin/settings',
      color: 'bg-gray-500',
      emoji: '⚙️'
    }
  ];

  const statCards = [
    { title: '전체 사용자', value: stats.totalUsers, emoji: '👥', color: 'bg-blue-500' },
    { title: '전체 배틀', value: stats.totalBattles, emoji: '⚔️', color: 'bg-red-500' },
    { title: '등록된 동물', value: stats.totalAnimals, emoji: '🦁', color: 'bg-green-500' },
    { title: '오늘 활동', value: stats.activeToday, emoji: '🌟', color: 'bg-yellow-500' },
    { title: '커스텀 동물', value: stats.customAnimals, emoji: '🎨', color: 'bg-purple-500' },
    { title: '대기 중 승인', value: stats.pendingApprovals, emoji: '⏳', color: 'bg-orange-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ⚙️
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      {/* 도움말 버튼 */}
      <HelpButton page="admin" position="top-right" />

      {/* 홈 버튼 */}
      <Link href="/dashboard" className="fixed top-4 left-4">
        <button className="bg-gray-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
          <FiHome className="text-2xl" />
        </button>
      </Link>

      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4">
            👑 관리자 센터
          </h1>
          <p className="text-xl text-gray-700">
            {currentUser?.username}님, 오늘도 즐거운 관리하세요!
          </p>
        </motion.div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.color} p-6 rounded-2xl shadow-lg text-white text-center`}
            >
              <div className="text-4xl mb-2">{stat.emoji}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.title}</div>
            </motion.div>
          ))}
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.link}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105">
                  <div className={`${item.color} w-20 h-20 rounded-full flex items-center justify-center mb-4 text-white`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.emoji} {item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 빠른 작업 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-4">⚡ 빠른 작업</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
              새 공지사항 작성
            </button>
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">
              새 동물 추가
            </button>
            <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition">
              업적 추가
            </button>
            <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition">
              서버 상태 확인
            </button>
          </div>
        </motion.div>

        {/* 최근 활동 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-4">📊 최근 활동</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>🆕 새로운 사용자 가입</span>
              <span className="text-gray-500">5분 전</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>⚔️ 배틀 완료</span>
              <span className="text-gray-500">10분 전</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>🎨 커스텀 동물 생성</span>
              <span className="text-gray-500">15분 전</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>🏆 업적 달성</span>
              <span className="text-gray-500">20분 전</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}