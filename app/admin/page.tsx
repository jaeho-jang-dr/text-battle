"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiUsers, 
  HiUserGroup, 
  HiChartBar, 
  HiCog, 
  HiDatabase,
  HiLogout,
  HiHome,
  HiShieldCheck,
  HiSparkles,
  HiLightningBolt
} from "react-icons/hi";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const tabs: TabItem[] = [
  { id: "users", label: "사용자 관리", icon: <HiUsers className="text-xl" />, color: "from-blue-500 to-blue-600" },
  { id: "characters", label: "캐릭터 관리", icon: <HiUserGroup className="text-xl" />, color: "from-purple-500 to-purple-600" },
  { id: "battles", label: "배틀 로그", icon: <HiLightningBolt className="text-xl" />, color: "from-red-500 to-red-600" },
  { id: "stats", label: "통계", icon: <HiChartBar className="text-xl" />, color: "from-green-500 to-green-600" },
  { id: "settings", label: "설정", icon: <HiCog className="text-xl" />, color: "from-gray-500 to-gray-600" },
];

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [showLoginEffect, setShowLoginEffect] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/verify");
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowLoginEffect(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 500);
      } else {
        const data = await response.json();
        setError(data.error || "Login failed");
        setShowLoginEffect(false);
      }
    } catch (error) {
      setError("Login failed");
      setShowLoginEffect(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
            <div className="flex items-center justify-center mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl"
              >
                🦄
              </motion.div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2 text-white">Admin Portal</h1>
            <p className="text-gray-400 text-center mb-8">관리자 인증이 필요합니다</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HiShieldCheck className="inline mr-2" />
                  관리자 ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="admin"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HiSparkles className="inline mr-2" />
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={showLoginEffect}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 disabled:opacity-50"
              >
                {showLoginEffect ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "로그인"
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-4xl"
              >
                🦄
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">Text Battle Game 관리자 패널</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
              >
                <HiHome />
                <span>게임으로</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                <HiLogout />
                <span>로그아웃</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-4 mb-8">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-6 py-3 rounded-xl font-medium transition-all duration-300
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r text-white shadow-lg' 
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }
              `}
              style={activeTab === tab.id ? {
                backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                '--tw-gradient-from': tab.color.split(' ')[1],
                '--tw-gradient-to': tab.color.split(' ')[3],
              } : {}}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
              
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-20"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    '--tw-gradient-from': tab.color.split(' ')[1],
                    '--tw-gradient-to': tab.color.split(' ')[3],
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
          >
            {activeTab === "users" && <UsersTabContent />}
            {activeTab === "characters" && <CharactersTabContent />}
            {activeTab === "battles" && <BattlesTabContent />}
            {activeTab === "stats" && <StatsTabContent />}
            {activeTab === "settings" && <SettingsTabContent />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Tab content components
function UsersTabContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">사용자 관리</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">이메일</th>
              <th className="text-left py-3 px-4">이름</th>
              <th className="text-left py-3 px-4">가입일</th>
              <th className="text-left py-3 px-4">액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-700/50 hover:bg-gray-700/20"
              >
                <td className="py-3 px-4">{user.id}</td>
                <td className="py-3 px-4">{user.email || 'N/A'}</td>
                <td className="py-3 px-4">{user.username || user.name || 'Anonymous'}</td>
                <td className="py-3 px-4">
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="py-3 px-4">
                  <button className="text-red-400 hover:text-red-300 transition-colors">
                    삭제
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CharactersTabContent() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/admin/characters");
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
      }
    } catch (error) {
      console.error("Failed to fetch characters:", error);
    } finally {
      setLoading(false);
    }
  };

  const initNPCs = async () => {
    try {
      const response = await fetch("/api/admin/npcs/init", { method: "POST" });
      if (response.ok) {
        alert("NPCs initialized successfully!");
        fetchCharacters();
      }
    } catch (error) {
      console.error("Failed to init NPCs:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">캐릭터 관리</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={initNPCs}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          NPC 초기화
        </motion.button>
      </div>
      
      <div className="grid gap-4">
        {characters.map((char, index) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-700/30 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">
                {char.name}
                {char.isNPC && (
                  <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded">NPC</span>
                )}
              </h3>
              <p className="text-gray-400 text-sm">
                ELO: {char.eloScore || char.elo || 1000} | 
                전적: {char.wins}승 {char.losses}패
              </p>
            </div>
            <button className="text-red-400 hover:text-red-300 transition-colors">
              삭제
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BattlesTabContent() {
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      const response = await fetch("/api/admin/battles");
      if (response.ok) {
        const data = await response.json();
        setBattles(data.battles || []);
      }
    } catch (error) {
      console.error("Failed to fetch battles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">배틀 로그</h2>
      <div className="space-y-4">
        {battles.map((battle, index) => (
          <motion.div
            key={battle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-700/30 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {battle.attackerName} vs {battle.defenderName}
                </p>
                <p className="text-sm text-gray-400">
                  승자: {battle.winnerName} | 
                  시간: {new Date(battle.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-sm ${
                battle.attackerDamage > battle.defenderDamage
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-red-600/20 text-red-400'
              }`}>
                {battle.attackerDamage} vs {battle.defenderDamage}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatsTabContent() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const statCards = [
    { label: "총 사용자", value: stats.totalUsers || 0, color: "from-blue-500 to-blue-600" },
    { label: "총 캐릭터", value: stats.totalCharacters || 0, color: "from-purple-500 to-purple-600" },
    { label: "총 배틀", value: stats.totalBattles || 0, color: "from-red-500 to-red-600" },
    { label: "오늘 배틀", value: stats.todayBattles || 0, color: "from-green-500 to-green-600" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">통계</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20`} />
            <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
              <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SettingsTabContent() {
  const [settings, setSettings] = useState({
    dailyBattleLimit: 20,
    maintenanceMode: false,
  });

  const updateSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        alert("Settings updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">설정</h2>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">일일 배틀 제한</label>
          <input
            type="number"
            value={settings.dailyBattleLimit}
            onChange={(e) => setSettings({...settings, dailyBattleLimit: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-purple-600 focus:ring-purple-500"
            />
            <span>점검 모드</span>
          </label>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={updateSettings}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all"
        >
          설정 저장
        </motion.button>
      </div>
    </div>
  );
}