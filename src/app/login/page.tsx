'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { isMockMode } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Google sign-in failed');
    }
  };

  // Helper to log in immediately with seed users
  const handleQuickLogin = async (roleEmail: string) => {
    setError(null);
    setLoading(true);
    setEmail(roleEmail);
    setPassword('password123');
    const res = await login(roleEmail, 'password123');
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-6 bg-gradient-to-b from-[#EEF1FB]/40 to-[#EEF1FB]">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-poppins font-bold text-2xl text-[#3E6B63]">Welcome to SAATHI</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to check on your mental wellness</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-200 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl mt-2 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:bg-gray-300"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#EEF1FB]"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase">Or continue with</span>
          <div className="flex-grow border-t border-[#EEF1FB]"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-sm disabled:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <p className="text-sm text-gray-500 text-center">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#3E5FE0] hover:underline font-semibold">
            Create an account
          </Link>
        </p>

        {/* Quick login helpers for hackathon testing */}
        <div className="border-t border-[#EEF1FB] pt-6 mt-2">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
            Developer / SIH Sandbox Login
          </span>
          {isMockMode && (
            <div className="bg-[#EEF1FB]/30 p-3 rounded-xl border border-[#EEF1FB] flex flex-col gap-2">
              <p className="text-[10px] text-gray-500 text-center mb-1">
                The database is running in <b>Mock Mode</b>. Click any badge to login instantly:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickLogin('user@saathi.org')}
                  className="px-2 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 flex flex-col items-center gap-1 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Rahul (User)</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('counsellor@saathi.org')}
                  className="px-2 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 flex flex-col items-center gap-1 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Counsellor</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('admin@saathi.org')}
                  className="px-2 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold text-purple-700 flex flex-col items-center gap-1 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Admin Staff</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
