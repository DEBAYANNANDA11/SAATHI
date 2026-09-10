'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db, DistressScore } from '@/lib/supabase';
import { 
  Heart, 
  MessageSquare, 
  BookOpen, 
  Clock, 
  LifeBuoy, 
  AlertCircle, 
  ArrowRight,
  Smile,
  Meh,
  Frown,
  Activity,
  PhoneCall,
  RefreshCw,
  Gamepad2
} from 'lucide-react';
import { CopingSession } from '@/components/CopingSession';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [latestScore, setLatestScore] = useState<DistressScore | null>(null);
  const [quickCheckinText, setQuickCheckinText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Companion Active Check-in States
  const [showHelpPrompt, setShowHelpPrompt] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showCopingModal, setShowCopingModal] = useState(false);
  const [cuesFound, setCuesFound] = useState<string[]>([]);

  // Load latest distress score
  useEffect(() => {
    if (!user) return;
    const fetchScores = async () => {
      const scores = await db.getDistressScores(user.id);
      if (scores.length > 0) {
        // Get the latest computed score (sorted chronologically, so take the last one)
        setLatestScore(scores[scores.length - 1]);
      } else {
        // Fallback default low distress score
        setLatestScore({
          id: 'default',
          user_id: user.id,
          score: 28,
          tier: 'low',
          explanation: 'No recent distress logs. Emotion baseline is optimal.',
          computed_at: new Date().toISOString()
        });
      }
    };
    fetchScores();
  }, [user]);

  if (!user || !profile) return null;

  const currentScore = latestScore ? latestScore.score : 0;
  const currentTier = latestScore ? latestScore.tier : 'low';
  const currentExplanation = latestScore ? latestScore.explanation : 'Analyzing wellness...';

  // SVG Gauge variables
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  // Determine gauge color scheme
  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'high':
        return {
          stroke: 'stroke-red-500',
          text: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Elevated Distress (High)',
          colorHex: '#EF4444'
        };
      case 'moderate':
        return {
          stroke: 'stroke-amber-500',
          text: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          label: 'Moderate Stress Indicators',
          colorHex: '#F59E0B'
        };
      default:
        return {
          stroke: 'stroke-[#8FCBB0]',
          text: 'text-[#3E6B63]',
          bg: 'bg-emerald-50/50',
          border: 'border-emerald-100',
          label: 'Optimal Well-being (Low)',
          colorHex: '#8FCBB0'
        };
    }
  };

  const colors = getTierColors(currentTier);

  // Submit quick check-in
  const handleQuickCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCheckinText.trim() && !selectedMood) return;

    setSavingCheckin(true);
    setErrorAndSuccess(null);

    try {
      // Calculate a quick sentiment score
      let sentiment = 0.0;
      const lower = quickCheckinText.toLowerCase();

      // Quick keyword lexicons
      const positiveKeywords = ['happy', 'good', 'glad', 'great', 'awesome', 'fine', 'better', 'thankful', 'peaceful'];
      const negativeKeywords = ['sad', 'anxious', 'heavy', 'stressed', 'tired', 'bad', 'hurt', 'lonely', 'worried', 'hopeless', 'depressed'];

      let posCount = 0;
      let negCount = 0;

      positiveKeywords.forEach(k => { if (lower.includes(k)) posCount++; });
      negativeKeywords.forEach(k => { if (lower.includes(k)) negCount++; });

      if (selectedMood === 'happy') sentiment += 0.5;
      if (selectedMood === 'sad') sentiment -= 0.5;
      if (selectedMood === 'anxious') sentiment -= 0.6;
      if (selectedMood === 'tired') sentiment -= 0.3;

      if (posCount > negCount) sentiment += 0.3;
      else if (negCount > posCount) sentiment -= 0.4;

      // Clamp sentiment
      sentiment = Math.max(-1.0, Math.min(1.0, sentiment));

      // Save journal entry
      const checkinContent = quickCheckinText.trim() 
        ? `${quickCheckinText} [Mood: ${selectedMood || 'neutral'}]` 
        : `Logged quick mood: ${selectedMood}`;

      await db.createEntry(user.id, 'journal', checkinContent, sentiment);

      // Recalculate Distress Score
      const scores = await db.getDistressScores(user.id);
      const entries = await db.getEntries(user.id);
      
      const recentSentiment = entries.slice(0, 5).reduce((acc, curr) => acc + Number(curr.sentiment_score), 0) / Math.min(entries.length, 5);
      
      // Calculate score
      let newScoreVal = Math.round(50 - (recentSentiment * 40));
      newScoreVal = Math.max(0, Math.min(100, newScoreVal));

      let newTier: 'low' | 'moderate' | 'high' = 'low';
      if (newScoreVal >= 75) newTier = 'high';
      else if (newScoreVal >= 40) newTier = 'moderate';

      const explanation = newTier === 'high' 
        ? 'Distress index elevated due to expressive words and reported mood state.' 
        : newTier === 'moderate' 
          ? 'Stress indicators mildly elevated; rest and self-care suggested.'
          : 'Emotional indicators remain balanced and optimal.';

      const newScore = await db.createDistressScore(user.id, newScoreVal, newTier, explanation);
      setLatestScore(newScore);

      setQuickCheckinText('');
      setSelectedMood(null);
      setMessage({ text: 'Check-in saved successfully! Today\'s index updated.', type: 'success' });
    } catch (e) {
      setMessage({ text: 'Could not log check-in. Try again.', type: 'error' });
    } finally {
      setSavingCheckin(false);
    }
  };

  const setErrorAndSuccess = (msg: typeof message) => {
    setMessage(msg);
  };

  const handleDeepScan = async () => {
    setScanning(true);
    
    // Simulate deep scanning logs for 2.5s
    setTimeout(async () => {
      try {
        const entries = await db.getEntries(user!.id);
        const lowerText = entries.map(e => e.content.toLowerCase()).join(' ');

        const stressKeywords = [
          'sad', 'anxious', 'heavy', 'stressed', 'tired', 'bad', 'hurt', 'lonely', 
          'worried', 'hopeless', 'depressed', 'exhausted', 'overwhelmed', 'pressure'
        ];
        
        const found = stressKeywords.filter(k => lowerText.includes(k));
        
        setCuesFound(found.length > 0 ? found.slice(0, 3) : ['stressed', 'tired']);
        setShowCopingModal(true);
      } catch (err) {
        setCuesFound(['stressed', 'tired']);
        setShowCopingModal(true);
      } finally {
        setScanning(false);
      }
    }, 2500);
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-poppins font-bold text-3xl text-[#142E27]">Hello, {profile.full_name}</h1>
          <p className="text-[#1E4339] text-sm mt-1 font-medium">Here is your daily check-in summary.</p>
        </div>
        
        {/* Support quick link for high distress */}
        {currentTier === 'high' && (
          <div className="animate-bounce bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-200 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>Support services alerted. Keep breathing.</span>
            {profile.emergency_contact_phone && (
              <a 
                href={`tel:${profile.emergency_contact_phone}`} 
                className="ml-2 flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Emergency
              </a>
            )}
          </div>
        )}
      </div>

      {/* SAATHI Companion Prompt Card */}
      {showHelpPrompt && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#8FCBB0]/30 bg-gradient-to-r from-[#EEF1FB]/30 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8FCBB0]/20 text-[#3E6B63] rounded-xl flex items-center justify-center animate-pulse">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-poppins font-bold text-sm text-[#3E6B63]">SAATHI Active Companion</h4>
              <p className="text-xs text-gray-500 mt-0.5">I noticed you might be carrying some tension. Can I help you?</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleDeepScan}
              disabled={scanning}
              className="px-4 py-2 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Yes, please'
              )}
            </button>
            <button
              onClick={() => setShowHelpPrompt(false)}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
            >
              No, thanks
            </button>
          </div>
        </div>
      )}

      {/* Scanning Modal Popup */}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4 border border-slate-100 shadow-2xl animate-fadeIn">
            <RefreshCw className="w-8 h-8 text-[#3E5FE0] animate-spin" />
            <h4 className="font-poppins font-bold text-base text-[#3E6B63]">SAATHI Deep Wellness Check</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Evaluating your private check-in records and sentiment history to calculate distress indicators...
            </p>
          </div>
        </div>
      )}

      {/* Coping Session Modal */}
      {showCopingModal && (
        <CopingSession
          userId={user.id}
          initialScore={currentScore}
          detectedCues={cuesFound}
          onClose={() => setShowCopingModal(false)}
          onComplete={(newScore) => {
            if (latestScore) {
              setLatestScore({
                ...latestScore,
                score: newScore,
                tier: newScore >= 75 ? 'high' : newScore >= 40 ? 'moderate' : 'low'
              });
            }
            setShowCopingModal(false);
          }}
        />
      )}

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: DISTRESS GAUGE */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center gap-6 justify-center">
          <h3 className="font-poppins font-bold text-lg text-[#3E6B63] text-center">Your Distress Index</h3>
          
          {/* SVG Circular Ring Gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-gray-100"
                strokeWidth="10"
                fill="none"
              />
              {/* Foreground Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`transition-all duration-1000 ease-out ${colors.stroke}`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            
            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-poppins font-bold text-4xl text-gray-800">{currentScore}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Index</span>
            </div>
          </div>

          <div className={`w-full p-4 rounded-xl text-center border ${colors.bg} ${colors.border}`}>
            <span className={`block font-bold text-sm ${colors.text}`}>{colors.label}</span>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{currentExplanation}</p>
          </div>
        </div>

        {/* MIDDLE COLUMN: CHECK-IN INPUT */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 md:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">How are you holding up?</h3>
            <p className="text-xs text-gray-400">
              Noticed you've gone quiet today — want to talk, or just breathe together? Let us know.
            </p>
          </div>

          {message && (
            <div className={`p-3.5 rounded-xl border text-sm flex gap-2 items-center ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleQuickCheckin} className="flex flex-col gap-4">
            {/* Mood selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Current Mood</span>
              <div className="flex gap-2">
                {[
                  { id: 'happy', icon: Smile, label: 'Happy', color: 'text-green-600 border-green-100 bg-green-50/50' },
                  { id: 'neutral', icon: Meh, label: 'Neutral', color: 'text-gray-600 border-gray-200 bg-gray-50' },
                  { id: 'sad', icon: Frown, label: 'Low', color: 'text-blue-600 border-blue-100 bg-blue-50/50' },
                  { id: 'anxious', icon: Activity, label: 'Anxious', color: 'text-amber-600 border-amber-100 bg-amber-50/50' },
                ].map((mood) => {
                  const Icon = mood.icon;
                  const selected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedMood(mood.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold transition-all ${
                        selected 
                          ? 'border-[#3E5FE0] bg-[#3E5FE0]/10 text-[#3E5FE0] ring-1 ring-[#3E5FE0]' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check-in Text */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Check-in Log</span>
              <textarea
                placeholder="What's on your mind? Spill your thoughts or write how you feel..."
                value={quickCheckinText}
                onChange={(e) => setQuickCheckinText(e.target.value)}
                className="w-full min-h-[100px] border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0] focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingCheckin || (!quickCheckinText.trim() && !selectedMood)}
              className="px-6 py-3 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl self-end transition-all flex items-center gap-2 shadow-sm disabled:bg-gray-200 disabled:shadow-none"
            >
              {savingCheckin ? 'Saving Log...' : 'Quick Check-in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* QUICK LINKS SECTION */}
      <div className="flex flex-col gap-4">
        <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">SAATHI Ecosystem Gateways</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Talk to SAATHI */}
          <Link
            href="/chat"
            className="p-6 bg-white hover:bg-[#EEF1FB]/30 border border-gray-100 hover:border-[#3E5FE0]/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-10 h-10 bg-[#3E5FE0]/10 text-[#3E5FE0] rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-poppins font-bold text-base text-[#3E6B63] group-hover:text-[#3E5FE0] transition-colors">
                Talk to SAATHI
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Start a supportive dialogue check-in. Our companion analyzes stress indicators in messages.
              </p>
            </div>
            <span className="text-[#3E5FE0] text-xs font-semibold flex items-center gap-1 mt-auto">
              Start chat <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Journal */}
          <Link
            href="/journal"
            className="p-6 bg-white hover:bg-[#EEF1FB]/30 border border-gray-100 hover:border-[#8FCBB0]/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-10 h-10 bg-[#8FCBB0]/20 text-[#3E6B63] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-poppins font-bold text-base text-[#3E6B63] group-hover:text-[#3E5FE0] transition-colors">
                Private Journal
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Log longer diaries, mood fluctuations, and reflect on thoughts in a quiet workspace.
              </p>
            </div>
            <span className="text-[#3E6B63] text-xs font-semibold flex items-center gap-1 mt-auto">
              Open journal <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          {/* History */}
          <Link
            href="/history"
            className="p-6 bg-white hover:bg-[#EEF1FB]/30 border border-gray-100 hover:border-[#3E5FE0]/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-10 h-10 bg-[#3E5FE0]/10 text-[#3E5FE0] rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-poppins font-bold text-base text-[#3E6B63] group-hover:text-[#3E5FE0] transition-colors">
                Distress History
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Inspect your 30-day distress level curve split across low, moderate, and high tiers.
              </p>
            </div>
            <span className="text-[#3E5FE0] text-xs font-semibold flex items-center gap-1 mt-auto">
              Inspect trends <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Resources */}
          <Link
            href="/resources"
            className="p-6 bg-white hover:bg-[#EEF1FB]/30 border border-gray-100 hover:border-[#8FCBB0]/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-10 h-10 bg-[#8FCBB0]/20 text-[#3E6B63] rounded-xl flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-poppins font-bold text-base text-[#3E6B63] group-hover:text-[#3E5FE0] transition-colors">
                Coping Resources
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Filter self-guided breathing, grounding practices, audio tags, and reading exercises.
              </p>
            </div>
            <span className="text-[#3E6B63] text-xs font-semibold flex items-center gap-1 mt-auto">
              Explore library <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Relief Arcade */}
          <Link
            href="/arcade"
            className="p-6 bg-gradient-to-br from-white to-emerald-50/40 hover:to-indigo-50/40 border border-emerald-200/80 hover:border-[#3E5FE0]/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xs">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-poppins font-bold text-base text-[#142E27] group-hover:text-[#3E5FE0] transition-colors flex items-center gap-1.5">
                Relief Arcade <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">New</span>
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Play interactive mini-games like Flappy Saathi, Bot vs User Pong, Whack-A-Stress, and 15 jokes.
              </p>
            </div>
            <span className="text-[#3E5FE0] text-xs font-semibold flex items-center gap-1 mt-auto">
              Play arcade <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

        </div>
      </div>

    </div>
  );
}
