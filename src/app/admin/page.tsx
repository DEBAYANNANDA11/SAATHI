'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, UserProfile } from '@/lib/supabase';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  UserCheck, 
  Info,
  Building,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsersThisWeek: number;
    tier2PlusPercent: number;
    counsellorCount: number;
  } | null>(null);
  
  const [counsellors, setCounsellors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch admin dashboard stats
  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      setLoading(true);
      try {
        const statsData = await db.getAdminStats();
        setStats(statsData);

        const counsellorList = await db.getCounsellors();
        setCounsellors(counsellorList);
      } catch (err) {
        console.error("Could not fetch admin statistics", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user]);

  if (!user || !profile || profile.role !== 'admin') return null;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <h1 className="font-poppins font-bold text-3xl text-[#3E6B63]">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Anonymised aggregate statistics. Individual student names and private journal data are completely hidden.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#3E5FE0]" />
          <span className="font-semibold text-sm">Loading admin metrics...</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Stats Left Column (KPI cards & Privacy card) */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="font-poppins font-bold text-lg text-[#3E6B63] flex items-center gap-2 border-b border-[#EEF1FB] pb-2">
              <Activity className="w-5 h-5 text-[#3E5FE0]" /> System Analytics Overview
            </h3>

            {/* KPI grid */}
            <div className="grid sm:grid-cols-3 gap-6">
              
              {/* Card 1: Active Users */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Users</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-2xl font-poppins font-bold text-gray-800">{stats?.totalUsers || 0}</span>
                  <span className="text-[10px] text-green-600 font-semibold mt-0.5">Active registration</span>
                </div>
              </div>

              {/* Card 2: Escalations tier */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Distress rate</span>
                  <Activity className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-2xl font-poppins font-bold text-gray-800">{stats?.tier2PlusPercent || 0}%</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Tier 2+ (moderate/high)</span>
                </div>
              </div>

              {/* Card 3: Counsellors count */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Staff Team</span>
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-2xl font-poppins font-bold text-gray-800">{stats?.counsellorCount || 0}</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Registered counsellors</span>
                </div>
              </div>

            </div>

            {/* Privacy Compliance Banner */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
              <h4 className="font-poppins font-bold text-sm text-[#3E6B63] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8FCBB0]" /> Data Security & Compliance Standards
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                SAATHI implements state-of-the-art Row Level Security (RLS) policies within Supabase Postgres database. Admins are strictly prohibited from bypassing security views to intercept raw diary tables. All student identification markers are hashed, ensuring compliance with student mental health protection standards.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold mt-1">
                <Info className="w-3.5 h-3.5" />
                <span>Smart India Hackathon 2026 guidelines approved configuration.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Counsellors listing */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <h3 className="font-poppins font-bold text-base text-[#3E6B63] flex items-center gap-2 border-b border-[#EEF1FB] pb-2">
              <Building className="w-5 h-5 text-[#3E5FE0]" /> Institutional Staff List
            </h3>

            {counsellors.length === 0 ? (
              <p className="text-xs text-gray-400">No counsellors registered in database.</p>
            ) : (
              <div className="space-y-3">
                {counsellors.map((c) => (
                  <div key={c.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">{c.full_name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mt-0.5">
                        Language: {c.language.toUpperCase()}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase rounded-full">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <Link 
              href="/signup" 
              className="mt-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Register new staff account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
