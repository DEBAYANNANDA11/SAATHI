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
  ReferenceLine
} from 'recharts';
import { Clock, ArrowLeft, Heart, Sparkles, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';

interface HistoryPoint {
  id: string;
  chartPoint: string;
  date: string;
  time: string;
  fullDateTime: string;
  score: number;
  tier: 'low' | 'moderate' | 'high';
  tierName: string;
  explanation: string;
}

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const [chartData, setChartData] = useState<HistoryPoint[]>([]);
  const [mounted, setMounted] = useState(false);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [highestScore, setHighestScore] = useState<number>(0);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch scores data
  useEffect(() => {
    const loadScores = async () => {
      let scores: DistressScore[] = [];
      if (user) {
        scores = await db.getDistressScores(user.id);
      }

      // For new users with 0 recorded scores, display a clean 0 baseline
      if (scores.length === 0) {
        scores = [{
          id: 'initial-zero',
          user_id: user?.id || 'guest',
          score: 0,
          tier: 'low',
          explanation: 'Initial baseline established: 0% distress. Optimal calm.',
          computed_at: new Date().toISOString()
        }];
      }

      // Sort strictly chronologically
      scores.sort((a, b) => new Date(a.computed_at).getTime() - new Date(b.computed_at).getTime());

      // Map to chart coordinates with unique point keys to guarantee accurate tooltips per point
      const formatted: HistoryPoint[] = scores.map((s, idx) => {
        const d = new Date(s.computed_at);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const fullDateTime = `${dateStr}, ${timeStr}`;

        let tierName = 'Low Stress';
        if (s.score >= 75) tierName = 'High Distress';
        else if (s.score >= 40) tierName = 'Moderate Stress';
        else if (s.score === 0) tierName = 'Zero Stress';

        return {
          id: s.id || `score-${idx}`,
          chartPoint: `${dateStr} #${idx + 1} (${timeStr})`,
          date: dateStr,
          time: timeStr,
          fullDateTime,
          score: Math.round(s.score),
          tier: s.tier,
          tierName,
          explanation: s.explanation || 'Wellness biometric check-in'
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

    const handleDistressUpdate = () => {
      loadScores();
    };
    window.addEventListener('saathi-distress-updated', handleDistressUpdate);
    return () => {
      window.removeEventListener('saathi-distress-updated', handleDistressUpdate);
    };
  }, [user]);

  // Dynamic floating tooltip accurately displaying the specific hovered data point
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: HistoryPoint = payload[0].payload;
      const scoreVal = typeof data.score === 'number' ? data.score : payload[0].value;
      
      let tierText = 'Optimal (Low)';
      let tierBadgeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700';
      
      if (scoreVal >= 75) {
        tierText = 'High Distress';
        tierBadgeStyle = 'bg-red-50 border-red-200 text-red-700';
      } else if (scoreVal >= 40) {
        tierText = 'Moderate Stress';
        tierBadgeStyle = 'bg-amber-50 border-amber-200 text-amber-700';
      } else if (scoreVal === 0) {
        tierText = 'Zero Stress (Calm)';
        tierBadgeStyle = 'bg-teal-50 border-teal-200 text-teal-700';
      }

      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 border border-gray-200 rounded-2xl shadow-xl text-xs flex flex-col gap-2 min-w-[210px] max-w-xs z-50 animate-fadeIn pointer-events-none">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 gap-2">
            <span className="text-[11px] font-bold text-gray-500">
              {data.fullDateTime || data.date}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierBadgeStyle}`}>
              {data.tierName || tierText}
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="text-gray-500 font-medium">Distress Score:</span>
            <span className="font-poppins font-black text-xl text-gray-900">
              {scoreVal}
              <span className="text-xs text-gray-400 font-normal"> / 100</span>
            </span>
          </div>

          {data.explanation && (
            <p className="text-[10.5px] text-gray-600 bg-[#F2F8F5] p-2 rounded-xl border border-[#8FCBB0]/30 leading-snug font-medium">
              {data.explanation}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 bg-white hover:bg-gray-100 rounded-xl text-gray-500 hover:text-[#142E27] transition-colors shadow-sm border border-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27] flex items-center gap-2.5 flex-wrap">
            <span>Wellness & Distress History</span>
            <span className="text-xs px-2.5 py-1 bg-white/80 text-[#142E27] rounded-full font-semibold shadow-xs flex items-center gap-1 border border-gray-100">
              <Activity className="w-3.5 h-3.5 text-[#3E5FE0]" /> Longitudinal Analytics
            </span>
          </h1>
          <p className="text-[#1E4339] text-xs sm:text-sm mt-1 font-medium">
            Review your rolling stress level and baseline index metrics over time. Hover over any point to inspect exact scores and check-in logs.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Card 1: Rolling Avg */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3E5FE0] flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Rolling Average Index</span>
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
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Recorded Check-ins</span>
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
                  dataKey="chartPoint" 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={(val: string, index: number) => {
                    return chartData[index]?.date || val;
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                
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
                  activeDot={{ r: 7, stroke: '#3E5FE0', strokeWidth: 2, fill: '#fff' }}
                  dot={{ stroke: '#3E5FE0', strokeWidth: 2, r: 4, fill: '#fff' }}
                  isAnimationActive={true}
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
