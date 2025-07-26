"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FiSearch, FiEdit, FiTrash2, FiEye, FiHome, FiHelpCircle, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface User {
  id: string;
  username: string;
  email: string;
  age: number;
  avatar: string;
  role: string;
  is_active: boolean;
  play_time_limit: number;
  today_play_time: number;
  created_at: string;
  last_login: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

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

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      alert('사용자 목록을 불러오는데 실패했어요 😢');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      alert(currentStatus ? '계정이 비활성화되었어요 🔒' : '계정이 활성화되었어요 ✅');
      fetchUsers();
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경에 실패했어요 😢');
    }
  };

  const updatePlayTimeLimit = async (userId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ play_time_limit: newLimit })
        .eq('id', userId);

      if (error) throw error;

      alert('플레이 시간이 변경되었어요 ⏰');
      fetchUsers();
    } catch (error) {
      console.error('플레이 시간 변경 오류:', error);
      alert('플레이 시간 변경에 실패했어요 😢');
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`정말로 권한을 ${newRole}로 변경할까요? 🤔`)) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      alert('권한이 변경되었어요 👑');
      fetchUsers();
    } catch (error) {
      console.error('권한 변경 오류:', error);
      alert('권한 변경에 실패했어요 😢');
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">👑 관리자</span>;
      case 'parent':
        return <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">👨‍👩‍👧 부모님</span>;
      default:
        return <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">🎮 플레이어</span>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">✅ 활성</span>
      : <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">🔒 비활성</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          👥
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      {/* 도움말 버튼 */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="fixed top-4 right-4 bg-yellow-400 p-3 rounded-full shadow-lg hover:scale-110 transition z-50"
      >
        <FiHelpCircle className="text-2xl" />
      </button>

      {/* 도움말 풍선 */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 bg-white p-6 rounded-2xl shadow-xl max-w-sm z-50"
        >
          <h3 className="font-bold text-lg mb-2">👥 사용자 관리 도움말</h3>
          <ul className="space-y-2 text-sm">
            <li>🔍 <strong>검색</strong>: 이름이나 이메일로 찾아요</li>
            <li>👁️ <strong>상세보기</strong>: 자세한 정보를 확인해요</li>
            <li>✏️ <strong>수정</strong>: 정보를 바꿀 수 있어요</li>
            <li>🔒 <strong>활성/비활성</strong>: 계정을 켜고 끌 수 있어요</li>
            <li>⏰ <strong>플레이 시간</strong>: 하루 게임 시간을 정해요</li>
            <li>👑 <strong>권한</strong>: 역할을 바꿀 수 있어요</li>
          </ul>
        </motion.div>
      )}

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
          <h1 className="text-4xl font-bold mb-4">👥 사용자 관리</h1>
          <p className="text-xl text-gray-700">
            전체 {users.length}명의 친구들이 있어요!
          </p>
        </motion.div>

        {/* 검색 바 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="이름, 이메일, ID로 검색하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
        </motion.div>

        {/* 사용자 목록 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">사용자</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">나이</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">역할</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">플레이 시간</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">가입일</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">마지막 접속</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{user.avatar}</span>
                        <div>
                          <div className="font-semibold">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email || 'email없음'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.age}살</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(user.is_active)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>제한: {user.play_time_limit}분</div>
                        <div className="text-gray-500">오늘: {user.today_play_time}분</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {format(new Date(user.created_at), 'yyyy-MM-dd', { locale: ko })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.last_login 
                        ? format(new Date(user.last_login), 'yyyy-MM-dd HH:mm', { locale: ko })
                        : '접속 기록 없음'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="상세보기"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={`p-2 rounded-lg transition ${
                            user.is_active 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={user.is_active ? '비활성화' : '활성화'}
                        >
                          {user.is_active ? '🔒' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-xl">검색 결과가 없어요 😢</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 사용자 상세 모달 */}
      {showUserModal && selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowUserModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-5xl mr-4">{selectedUser.avatar}</span>
              {selectedUser.username}님의 정보
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">ID</label>
                  <p className="text-sm bg-gray-100 p-2 rounded">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">이메일</label>
                  <p className="bg-gray-100 p-2 rounded">{selectedUser.email || '없음'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">나이</label>
                  <p className="bg-gray-100 p-2 rounded">{selectedUser.age}살</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">역할</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => changeUserRole(selectedUser.id, e.target.value)}
                    className="w-full p-2 rounded border-2 border-gray-200"
                  >
                    <option value="player">플레이어</option>
                    <option value="parent">부모님</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">플레이 시간 제한 (분)</label>
                  <input
                    type="number"
                    value={selectedUser.play_time_limit}
                    onChange={(e) => updatePlayTimeLimit(selectedUser.id, parseInt(e.target.value))}
                    className="w-full p-2 rounded border-2 border-gray-200"
                    min="0"
                    max="480"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">오늘 플레이 시간</label>
                  <p className="bg-gray-100 p-2 rounded">{selectedUser.today_play_time}분</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">🎮 게임 통계</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">전체 배틀</div>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">승리</div>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <div className="text-sm text-gray-600">패배</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  닫기
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}