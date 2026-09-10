'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, Entry } from '@/lib/supabase';
import { 
  BookOpen, 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Smile, 
  Heart, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import Link from 'next/link';

export default function JournalPage() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load journal entries
  useEffect(() => {
    if (!user) return;
    const fetchEntries = async () => {
      const journalEntries = await db.getEntries(user.id, 'journal');
      setEntries(journalEntries);
    };
    fetchEntries();
  }, [user]);

  if (!user || !profile) return null;

  // Simple sentiment keyword-matching helper
  const calculateSentiment = (text: string): number => {
    const lower = text.toLowerCase();
    const pos = ['happy', 'peaceful', 'grateful', 'good', 'glad', 'great', 'awesome', 'energized', 'calm', 'relax', 'joy'];
    const neg = ['sad', 'stressed', 'tired', 'down', 'heavy', 'bad', 'hurt', 'lonely', 'anxious', 'worried', 'hopeless', 'angry', 'fear'];
    
    let posCount = 0;
    let negCount = 0;

    pos.forEach(w => { if (lower.includes(w)) posCount++; });
    neg.forEach(w => { if (lower.includes(w)) negCount++; });

    if (selectedMood === 'Grateful' || selectedMood === 'Peaceful' || selectedMood === 'Energized') posCount++;
    if (selectedMood === 'Sad' || selectedMood === 'Stressed' || selectedMood === 'Tired') negCount++;

    const total = posCount + negCount;
    if (total === 0) return 0.0;
    return (posCount - negCount) / total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const score = calculateSentiment(journalText);
      const taggedContent = `${journalText} [Tag: ${selectedMood}]`;
      
      const newEntry = await db.createEntry(user.id, 'journal', taggedContent, score);
      
      // Update state
      setEntries(prev => [newEntry, ...prev]);
      
      // Re-trigger distress score mapping
      const updatedEntries = await db.getEntries(user.id);
      const recentSentiment = updatedEntries.slice(0, 5).reduce((acc, curr) => acc + Number(curr.sentiment_score), 0) / Math.min(updatedEntries.length, 5);
      
      let newScoreVal = Math.round(50 - (recentSentiment * 40));
      newScoreVal = Math.max(0, Math.min(100, newScoreVal));

      let newTier: 'low' | 'moderate' | 'high' = 'low';
      if (newScoreVal >= 75) newTier = 'high';
      else if (newScoreVal >= 40) newTier = 'moderate';

      const explanation = newTier === 'high' 
        ? 'Distress score index elevated based on journal content sentiment.' 
        : newTier === 'moderate' 
          ? 'Mild stress levels noted. Rest and self-care resources are recommended.'
          : 'Emotional baseline is optimal.';

      await db.createDistressScore(user.id, newScoreVal, newTier, explanation);

      setJournalText('');
      setSelectedMood('Neutral');
    } catch (err) {
      setError('Could not save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to get sentiment UI indicator
  const getSentimentIndicator = (score: number) => {
    const num = Number(score);
    if (num > 0.2) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50',
        text: 'Positive Sentiment'
      };
    } else if (num < -0.2) {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bg: 'bg-red-50',
        text: 'Stress Indicators Detected'
      };
    } else {
      return {
        icon: Minus,
        color: 'text-gray-500',
        bg: 'bg-gray-100',
        text: 'Neutral Baseline'
      };
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-poppins font-bold text-3xl text-[#142E27]">Private Journal</h1>
          <p className="text-[#1E4339] text-sm mt-1 font-medium">A quiet, personal space to vent or reflect. Completely secure.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Column: Create entry form */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 lg:col-span-2 flex flex-col gap-5">
          <h3 className="font-poppins font-bold text-lg text-[#3E6B63] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#3E5FE0]" /> Write Today's Entry
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Mood tag picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">How do you feel?</label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0] bg-white cursor-pointer"
              >
                {['Neutral', 'Peaceful', 'Grateful', 'Energized', 'Tired', 'Sad', 'Stressed'].map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </div>

            {/* Entry Content */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diary Log</label>
              <textarea
                placeholder="Start writing... venting helps release emotional pressure. Only you can view these raw logs."
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                required
                className="w-full min-h-[220px] p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0] resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !journalText.trim()}
              className="w-full py-3.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none"
            >
              {saving ? 'Saving...' : 'Save Entry'}
              <BookOpen className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Logs history */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">Journal History</h3>
          
          {entries.length === 0 ? (
            <div className="bg-white/80 p-12 text-center border border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-3">
              <BookOpen className="w-8 h-8 text-gray-350" />
              <p className="text-gray-500 font-semibold text-sm">Your diary is empty.</p>
              <p className="text-xs text-gray-400 max-w-xs">Write your first entry to track emotional scores and trends over time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const sentiment = getSentimentIndicator(entry.sentiment_score);
                const IndicatorIcon = sentiment.icon;
                
                // Extract clean text (removing the [Tag: X] suffix if present)
                const textParts = entry.content.split(' [Tag: ');
                const cleanText = textParts[0];
                const tag = textParts[1] ? textParts[1].replace(']', '') : 'Neutral';

                return (
                  <div key={entry.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150/50 flex flex-col gap-3.5 hover:shadow-md transition-shadow">
                    
                    {/* Timestamp & Indicator bar */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(entry.created_at).toLocaleDateString(undefined, { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      <div className="flex gap-2">
                        {/* Mood Tag Badge */}
                        <span className="px-2.5 py-0.5 border border-[#8FCBB0]/30 bg-[#8FCBB0]/10 text-xs font-bold text-[#3E6B63] rounded-full">
                          {tag}
                        </span>
                        
                        {/* Sentiment Index Indicator */}
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1 ${sentiment.bg} ${sentiment.color} border-current/15`}>
                          <IndicatorIcon className="w-3 h-3" />
                          {sentiment.text}
                        </span>
                      </div>
                    </div>

                    {/* Content text */}
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{cleanText}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
