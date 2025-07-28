'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAllAPIs();
  }, []);

  const checkAllAPIs = async () => {
    const results: any = {};

    // 1. Leaderboard API
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      results.leaderboard = {
        status: res.status,
        success: data.success,
        entriesCount: data.data?.leaderboard?.length || 0,
        error: data.error
      };
    } catch (e) {
      results.leaderboard = { error: e.message };
    }

    // 2. Admin Login API (test)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'test' })
      });
      const data = await res.json();
      results.adminLogin = {
        status: res.status,
        success: data.success,
        error: data.error
      };
    } catch (e) {
      results.adminLogin = { error: e.message };
    }

    // 3. Auth Verify API
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/verify', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      results.authVerify = {
        status: res.status,
        success: data.success,
        hasToken: !!token,
        error: data.error
      };
    } catch (e) {
      results.authVerify = { error: e.message };
    }

    // 4. Check localStorage
    results.localStorage = {
      token: !!localStorage.getItem('token'),
      adminToken: !!localStorage.getItem('adminToken'),
      adminUser: !!localStorage.getItem('adminUser')
    };

    setApiStatus(results);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">🔧 Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">API Status</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(apiStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                localStorage.clear();
                alert('LocalStorage cleared!');
                window.location.reload();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear All LocalStorage
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
            >
              Go to Home
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/leaderboard';
              }}
              className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            >
              Go to Leaderboard
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/admin';
              }}
              className="bg-purple-500 text-white px-4 py-2 rounded ml-2"
            >
              Go to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}