'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, Entry } from '@/lib/supabase';
import { 
  BookOpen, 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Mic,
  MicOff,
  Sparkles,
  Trash2,
  Search,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface MoodOption {
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { label: 'Grateful', emoji: '🌟', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { label: 'Peaceful', emoji: '🕊️', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { label: 'Energized', emoji: '⚡', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { label: 'Neutral', emoji: '🌱', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
  { label: 'Tired', emoji: '🥱', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { label: 'Sad', emoji: '🌧️', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  { label: 'Stressed', emoji: '⛈️', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
];

const PROMPT_IDEAS = [
  "What is one heavy thought you want to leave on this page today?",
  "Name one small moment today that gave you even 10 seconds of peace.",
  "Write down what you can control vs. what you need to let go of.",
  "How does your body feel right this second, from head to toe?"
];

export default function JournalPage() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<string>('All');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceStressDetected, setVoiceStressDetected] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // Storage key for dual-layer offline persistence
  const getStorageKey = (uid: string) => `saathi_journal_cache_${uid}`;

  // Load journal entries (Supabase + localStorage merge)
  useEffect(() => {
    if (!user) return;
    
    const loadEntries = async () => {
      // 1. Check local cache first for instant rendering
      const cached = localStorage.getItem(getStorageKey(user.id));
      let localData: Entry[] = [];
      if (cached) {
        try {
          localData = JSON.parse(cached);
          if (Array.isArray(localData)) {
            setEntries(localData);
          }
        } catch (e) {
          console.error('Error loading journal cache:', e);
        }
      }

      // 2. Fetch fresh entries from database
      try {
        const remoteEntries = await db.getEntries(user.id, 'journal');
        if (Array.isArray(remoteEntries) && remoteEntries.length > 0) {
          // Merge remote with local (deduplicate by id)
          const mergedMap = new Map<string, Entry>();
          localData.forEach(e => mergedMap.set(e.id, e));
          remoteEntries.forEach(e => mergedMap.set(e.id, e));
          
          const sorted = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setEntries(sorted);
          localStorage.setItem(getStorageKey(user.id), JSON.stringify(sorted));
        }
      } catch (err) {
        console.warn('Database fetch delayed, using cached journal entries:', err);
      }
    };

    loadEntries();
  }, [user]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  if (!user || !profile) return null;

  // Sentiment scoring helper
  const calculateSentiment = (text: string): number => {
    const lower = text.toLowerCase();
    const pos = ['happy', 'peaceful', 'grateful', 'good', 'glad', 'great', 'awesome', 'energized', 'calm', 'relax', 'joy', 'blessed', 'smile', 'love', 'hope'];
    const neg = ['sad', 'stressed', 'tired', 'down', 'heavy', 'bad', 'hurt', 'lonely', 'anxious', 'worried', 'hopeless', 'angry', 'fear', 'crying', 'pressure', 'exhausted', 'overwhelmed'];
    
    let posCount = 0;
    let negCount = 0;

    pos.forEach(w => { if (lower.includes(w)) posCount++; });
    neg.forEach(w => { if (lower.includes(w)) negCount++; });

    if (selectedMood === 'Grateful' || selectedMood === 'Peaceful' || selectedMood === 'Energized') posCount += 2;
    if (selectedMood === 'Sad' || selectedMood === 'Stressed' || selectedMood === 'Tired') negCount += 2;

    const total = posCount + negCount;
    if (total === 0) return 0.0;
    return (posCount - negCount) / total;
  };

  // Live Speech-to-Text Dictation
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice speech dictation is supported in modern Chrome, Edge, and Safari.");
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStressDetected(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }

        if (finalTranscript.trim()) {
          const lowerSpoken = finalTranscript.toLowerCase();
          
          // Voice Stress & Hesitation Analysis
          const sadKeywords = ['sad', 'depressed', 'tired', 'exhausted', 'stress', 'stressed', 'anxious', 'scared', 'crying', 'heavy', 'hurt', 'pain', 'lonely', 'hopeless', 'overwhelmed'];
          let hasStress = false;
          for (const word of sadKeywords) {
            if (lowerSpoken.includes(word)) {
              hasStress = true;
              break;
            }
          }
          if (lowerSpoken.match(/\b(u+h+|u+m+|m+m+|m+h*m+|e+r+r*|a+h+|h+m+m*)\b/i)) {
            hasStress = true;
          }

          if (hasStress) {
            setVoiceStressDetected(true);
            if (lowerSpoken.includes('tired') || lowerSpoken.includes('exhausted')) setSelectedMood('Tired');
            else if (lowerSpoken.includes('stress') || lowerSpoken.includes('pressure')) setSelectedMood('Stressed');
            else if (lowerSpoken.includes('sad') || lowerSpoken.includes('lonely') || lowerSpoken.includes('crying')) setSelectedMood('Sad');
            else setSelectedMood('Stressed');
          }

          setJournalText(prev => prev ? prev.trim() + ' ' + finalTranscript.trim() : finalTranscript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Save new entry
  const handleSaveEntry = async () => {
    if (!user || !journalText.trim()) return;

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const score = calculateSentiment(journalText);
      const taggedContent = `${journalText.trim()} [Tag: ${selectedMood}]`;
      
      let createdEntry: Entry;
      try {
        createdEntry = await db.createEntry(user.id, 'journal', taggedContent, score);
      } catch (dbErr) {
        // Fallback offline object if DB call fails
        createdEntry = {
          id: crypto.randomUUID(),
          user_id: user.id,
          type: 'journal',
          content: taggedContent,
          sentiment_score: score,
          created_at: new Date().toISOString()
        };
      }
      
      // Update local state and sync storage
      const updatedList = [createdEntry, ...entries.filter(x => x.id !== createdEntry.id)];
      setEntries(updatedList);
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(updatedList));

      // Fetch latest distress baseline (0 for new users, last updated value for old users)
      const existingScores = await db.getDistressScores(user.id);
      const currentBaseline = existingScores.length > 0 ? existingScores[existingScores.length - 1].score : 0;

      const lowerContent = journalText.toLowerCase();
      const isNegativeMood = ['Tired', 'Sad', 'Stressed'].includes(selectedMood);
      const negativeWords = ['sad', 'depressed', 'tired', 'exhausted', 'stress', 'stressed', 'anxious', 'scared', 'crying', 'cry', 'tears', 'heavy', 'hurt', 'hurting', 'lonely', 'alone', 'overwhelmed', 'fatigue', 'insomnia', 'burnout', 'pressure', 'hopeless', 'dark circle', 'dark circles', 'cant sleep', "can't sleep"];
      const negativeCount = negativeWords.filter(w => lowerContent.includes(w)).length;
      const isNegativeTiringOrSad = score < -0.1 || isNegativeMood || negativeCount > 0;

      let newScoreVal = currentBaseline;
      if (isNegativeTiringOrSad) {
        // User Rule: when user says negative tiring or sad things in journal update, increase little the stress index value
        const delta = Math.max(5, Math.min(15, 6 + (negativeCount * 2) + (isNegativeMood ? 3 : 0)));
        newScoreVal = Math.min(95, currentBaseline + delta);

        // If dark circles mentioned, ensure at least randomized 50-60 floor
        if (lowerContent.includes('dark circle') || lowerContent.includes('dark circles')) {
          const darkCircleFloor = 50 + Math.floor(Math.random() * 11);
          newScoreVal = Math.max(newScoreVal, darkCircleFloor);
        }
      } else if (['Grateful', 'Peaceful', 'Energized'].includes(selectedMood) || score > 0.2) {
        newScoreVal = Math.max(0, currentBaseline - 4);
      }

      let newTier: 'low' | 'moderate' | 'high' = 'low';
      if (newScoreVal >= 70) newTier = 'high';
      else if (newScoreVal >= 40) newTier = 'moderate';

      const explanation = newTier === 'high' 
        ? 'Distress index elevated based on emotional journaling cues.' 
        : newTier === 'moderate' 
          ? 'Mild emotional tension noted in journal. Compassionate rest suggested.'
          : newScoreVal === 0
            ? 'Optimal calm baseline (Zero distress).'
            : 'Emotional equilibrium steady.';

      await db.createDistressScore(user.id, newScoreVal, newTier, explanation);

      setJournalText('');
      setSelectedMood('Neutral');
      setSuccessMsg('Entry securely recorded into your private history! ✨');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Could not save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    if (isListening && speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (err) {}
      setIsListening(false);
    }

    await handleSaveEntry();
  };

  // Delete a journal entry
  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem(getStorageKey(user.id), JSON.stringify(updated));
  };

  // Helper to get sentiment UI indicator
  const getSentimentIndicator = (score: number) => {
    const num = Number(score);
    if (num > 0.15) {
      return {
        icon: TrendingUp,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'Positive Sentiment'
      };
    } else if (num < -0.15) {
      return {
        icon: TrendingDown,
        color: 'text-rose-700',
        bg: 'bg-rose-50 border-rose-200',
        text: 'Stress Detected'
      };
    } else {
      return {
        icon: Minus,
        color: 'text-gray-600',
        bg: 'bg-gray-100 border-gray-200',
        text: 'Neutral Reflection'
      };
    }
  };

  // Filtered entries based on search & mood
  const filteredEntries = entries.filter(entry => {
    const textParts = entry.content.split(' [Tag: ');
    const cleanText = textParts[0];
    const tag = textParts[1] ? textParts[1].replace(']', '') : 'Neutral';

    const matchesQuery = cleanText.toLowerCase().includes(searchQuery.toLowerCase()) || tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = filterMood === 'All' || tag.toLowerCase() === filterMood.toLowerCase();

    return matchesQuery && matchesMood;
  });

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-700 transition-colors shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">Private Journal</h1>
            <p className="text-[#1E4339] text-sm mt-0.5 font-medium">Your personal, quiet sanctuary. Speak or write freely—everything stays secure.</p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <BookOpen className="w-4 h-4 text-[#8FCBB0]" />
          <span className="text-xs font-semibold text-gray-600">
            <strong className="text-[#142E27] text-sm">{entries.length}</strong> {entries.length === 1 ? 'Entry' : 'Entries'} Saved
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Column: Create entry form */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-lg text-[#142E27] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#8FCBB0]" /> Write Today's Entry
            </h3>
            
            {/* Live Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? "Stop Voice Dictation" : "Dictate with Voice"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-200' 
                  : 'bg-[#F2F8F5] text-[#1E4339] hover:bg-[#8FCBB0]/20 border border-[#8FCBB0]/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#3E6B63]" />
                  <span>Voice Input</span>
                </>
              )}
            </button>
          </div>

          {/* Voice stress feedback notification */}
          {voiceStressDetected && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-2xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Attuned to your voice: We noticed tension or sadness. We've adjusted your mood tag accordingly.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-2xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Interactive Mood Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">How is your heart feeling?</label>
              <div className="flex flex-wrap gap-1.5">
                {MOOD_OPTIONS.map(mood => {
                  const isSelected = selectedMood === mood.label;
                  return (
                    <button
                      key={mood.label}
                      type="button"
                      onClick={() => setSelectedMood(mood.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? `${mood.bg} ${mood.color} ring-2 ring-[#8FCBB0] scale-105 shadow-sm font-bold`
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Prompt Ideas */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-gray-400">Need inspiration? Click a prompt:</span>
              <div className="flex flex-col gap-1.5">
                {PROMPT_IDEAS.slice(0, 2).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setJournalText(prev => prev ? `${prev}\n\n${prompt}` : prompt)}
                    className="text-left text-xs text-[#3E6B63] bg-[#F2F8F5] hover:bg-[#8FCBB0]/20 p-2 rounded-xl transition-colors border border-[#8FCBB0]/20 leading-snug"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry Content Textarea */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diary Log</label>
                <span className="text-[11px] text-gray-400 font-medium">{journalText.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea
                placeholder="Start typing or click 'Voice Input' above to speak your thoughts... Venting releases emotional burden. Only you have access to these logs."
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                required
                rows={7}
                className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8FCBB0] resize-none leading-relaxed shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !journalText.trim()}
              className="w-full py-3.5 bg-[#8FCBB0] hover:bg-[#72ad94] text-[#142E27] font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none cursor-pointer"
            >
              {saving ? 'Saving to Sanctuary...' : 'Save Entry to History'}
              <BookOpen className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Interactive Logs History */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-poppins font-bold text-xl text-[#142E27]">Journal History</h3>
              <p className="text-xs text-gray-500">Review your journey and emotional reflections over time.</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reflections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FCBB0]"
              />
            </div>
          </div>

          {/* Mood Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Grateful', 'Peaceful', 'Energized', 'Neutral', 'Tired', 'Sad', 'Stressed'].map(m => (
              <button
                key={m}
                onClick={() => setFilterMood(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterMood === m
                    ? 'bg-[#142E27] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          
          {filteredEntries.length === 0 ? (
            <div className="bg-white/90 p-12 text-center border border-dashed border-gray-200 rounded-3xl flex flex-col items-center gap-3">
              <BookOpen className="w-10 h-10 text-gray-300" />
              <p className="text-gray-600 font-semibold text-sm">
                {entries.length === 0 ? "Your diary is clean and ready." : "No entries match your search."}
              </p>
              <p className="text-xs text-gray-400 max-w-xs">
                {entries.length === 0 ? "Write or speak your first entry above to record your feelings." : "Try clearing your search query or selecting 'All' moods."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const sentiment = getSentimentIndicator(entry.sentiment_score);
                const IndicatorIcon = sentiment.icon;
                
                // Extract clean text (removing the [Tag: X] suffix if present)
                const textParts = entry.content.split(' [Tag: ');
                const cleanText = textParts[0];
                const tag = textParts[1] ? textParts[1].replace(']', '') : 'Neutral';
                const moodData = MOOD_OPTIONS.find(m => m.label.toLowerCase() === tag.toLowerCase()) || MOOD_OPTIONS[3];

                return (
                  <div 
                    key={entry.id} 
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3.5 hover:shadow-md transition-all group"
                  >
                    {/* Timestamp, Mood & Sentiment */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#8FCBB0]" />
                        {new Date(entry.created_at).toLocaleDateString(undefined, { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {/* Mood Badge */}
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1 ${moodData.bg} ${moodData.color}`}>
                          <span>{moodData.emoji}</span>
                          <span>{tag}</span>
                        </span>
                        
                        {/* Sentiment Badge */}
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1 ${sentiment.bg} ${sentiment.color}`}>
                          <IndicatorIcon className="w-3 h-3" />
                          <span>{sentiment.text}</span>
                        </span>

                        {/* Delete button (on hover) */}
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          title="Delete entry"
                          className="text-gray-300 hover:text-rose-500 p-1 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content text */}
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{cleanText}</p>
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
