'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, DistressScore } from '@/lib/supabase';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ResponsiveContainerProps
} from 'recharts';
import { Clock, ArrowLeft, Heart, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const [chartData, setChartData] = useState<{ date: string; score: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [highestScore, setHighestScore] = useState<number>(0);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch scores data
  useEffect(() => {
    if (!user) return;
    const loadScores = async () => {
      const scores = await db.getDistressScores(user.id);
      
      // Map to chart coordinates
      const formatted = scores.map(s => {
        const d = new Date(s.computed_at);
        return {
          date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          score: s.score
        };
      });
      setChartData(formatted);

      // Compute summaries
      if (scores.length > 0) {
        const total = scores.reduce((acc, curr) => acc + curr.score, 0);
        setAvgScore(Math.round(total / scores.length));
        setHighestScore(Math.max(...scores.map(s => s.score)));
      }
    };
    loadScores();
  }, [user]);

  if (!user || !profile) return null;

  // Custom tooltips matching brand CSS
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      let tier = 'Low';
      let tierColor = 'text-green-600';
      if (val >= 75) {
        tier = 'High';
        tierColor = 'text-red-600';
      } else if (val >= 40) {
        tier = 'Moderate';
        tierColor = 'text-amber-600';
      }

      return (
        <div className="bg-white p-3 border border-gray-150 rounded-xl shadow-lg text-xs font-semibold">
          <p className="text-gray-400 mb-1">{payload[0].payload.date}</p>
          <p className="text-[#3E6B63] flex justify-between gap-4">
            <span>Distress Index:</span>
            <span className="font-bold text-gray-800">{val}</span>
          </p>
          <p className="flex justify-between gap-4 mt-0.5">
            <span>Safety Band:</span>
            <span className={`font-bold ${tierColor}`}>{tier}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-poppins font-bold text-3xl text-[#3E6B63]">Wellness & Distress History</h1>
          <p className="text-gray-500 text-sm mt-1">Review your rolling stress level and baseline index metrics over the last 30 days.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        
        {/* Card 1: Rolling Avg */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3E5FE0] flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">30-Day Average Index</span>
            <span className="text-2xl font-poppins font-bold text-gray-800 mt-0.5">{avgScore}</span>
          </div>
        </div>

        {/* Card 2: Highest Stress */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Peak Distress Level</span>
            <span className="text-2xl font-poppins font-bold text-gray-800 mt-0.5">{highestScore}</span>
          </div>
        </div>

        {/* Card 3: Overall Baseline */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8FCBB0]/20 text-[#3E6B63] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Check-ins</span>
            <span className="text-2xl font-poppins font-bold text-gray-800 mt-0.5">{chartData.length} logs</span>
          </div>
        </div>

      </div>

      {/* Main Chart Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#EEF1FB] pb-4">
          <h3 className="font-poppins font-bold text-lg text-[#3E6B63] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3E5FE0]" /> Distress Index Trend (0-100)
          </h3>
          
          {/* Shading zones helper guide */}
          <div className="flex gap-3 text-xs font-bold flex-wrap">
            <span className="flex items-center gap-1.5 text-green-700">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Low (0-39)
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Moderate (40-74)
            </span>
            <span className="flex items-center gap-1.5 text-red-700">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> High (75-100)
            </span>
          </div>
        </div>

        {/* Render Chart (Only on Client Side) */}
        <div className="w-full h-80 min-h-[300px] text-xs">
          {mounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1FB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Horizontal reference bands for moderate/high triggers */}
                <ReferenceLine 
                  y={40} 
                  stroke="#F59E0B" 
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <ReferenceLine 
                  y={75} 
                  stroke="#EF4444" 
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3E5FE0"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ stroke: '#3E5FE0', strokeWidth: 2, r: 3, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : mounted ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2">
              <Clock className="w-8 h-8 text-gray-300 animate-pulse" />
              <p className="text-gray-500 font-semibold text-sm">Waiting for check-in data...</p>
              <p className="text-xs text-gray-400 max-w-xs">Once you chat or log journals, your emotional curves will graph here.</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Loading analytics...
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
