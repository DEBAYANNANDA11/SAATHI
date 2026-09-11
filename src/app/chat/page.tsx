'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/supabase';
import { 
  Send, 
  Square, 
  Sparkles, 
  Heart, 
  ArrowLeft, 
  Copy, 
  Check, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  PhoneCall, 
  Shield, 
  Wind, 
  Brain, 
  Compass, 
  MessageSquare, 
  Trash2, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen, 
  X 
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'saathi';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  modality: ModalityMode;
  messages: Array<{
    id: string;
    sender: 'user' | 'saathi';
    text: string;
    timestamp: string | Date;
    isStreaming?: boolean;
  }>;
}

type ModalityMode = 'compassion' | 'cbt' | 'somatic' | 'socratic';

const MODALITIES: { id: ModalityMode; label: string; icon: any; description: string }[] = [
  { 
    id: 'compassion', 
    label: 'Compassionate Space', 
    icon: Heart, 
    description: 'Carl Rogers person-centered unconditional positive regard' 
  },
  { 
    id: 'cbt', 
    label: 'CBT Reframing', 
    icon: Brain, 
    description: 'Identify thinking traps & examine evidence' 
  },
  { 
    id: 'somatic', 
    label: 'Somatic & Breath', 
    icon: Wind, 
    description: 'Nervous system regulation & sensory grounding' 
  },
  { 
    id: 'socratic', 
    label: 'Socratic Inquiry', 
    icon: Compass, 
    description: 'Gentle, guided self-discovery questions' 
  },
];

const PROMPT_STARTERS = [
  {
    icon: '🌬️',
    title: 'Nervous system reset',
    prompt: 'Can you guide me through a 2-minute 4-7-8 calming breath exercise? My chest feels tight.',
    mode: 'somatic' as ModalityMode
  },
  {
    icon: '🌀',
    title: 'Work overwhelm & spiral',
    prompt: "I'm completely overwhelmed with responsibilities and I feel like I'm spiraling out of control.",
    mode: 'compassion' as ModalityMode
  },
  {
    icon: '💭',
    title: 'Challenging inner critic',
    prompt: "I made a mistake today and my brain won't stop telling me that I'm a failure and not good enough.",
    mode: 'cbt' as ModalityMode
  },
  {
    icon: '🛑',
    title: '5-4-3-2-1 Grounding',
    prompt: 'Ground me right now using the 5-4-3-2-1 sensory method. My mind is racing.',
    mode: 'somatic' as ModalityMode
  },
  {
    icon: '🌙',
    title: 'Racing thoughts at night',
    prompt: "I can't fall asleep because my mind is replaying everything that happened today.",
    mode: 'compassion' as ModalityMode
  },
  {
    icon: '💡',
    title: 'Life direction dilemma',
    prompt: "I feel stuck at a crossroads in life and I'm scared of making the wrong decision.",
    mode: 'socratic' as ModalityMode
  }
];

// Helper Markdown formatter for therapist responses
function FormattedMessage({ text, isStreaming }: { text: string; isStreaming?: boolean }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading 3: ### Title
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="font-semibold text-base text-[#142E27] pt-1 pb-0.5 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3E5FE0] shrink-0" />
              <span>{renderInline(trimmed.replace('### ', ''))}</span>
            </h3>
          );
        }

        // Heading 2: ## Title
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="font-bold text-lg text-[#142E27] pt-1 pb-0.5 tracking-tight">
              {renderInline(trimmed.replace('## ', ''))}
            </h2>
          );
        }

        // Blockquote: > Quote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-[#8FCBB0] pl-3 py-1 bg-emerald-50/50 rounded-r-lg text-[#1E4339] italic font-medium my-2">
              {renderInline(trimmed.replace('> ', ''))}
            </blockquote>
          );
        }

        // Unordered list: - item or * item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#3E5FE0] font-bold text-xs mt-1.5 shrink-0">•</span>
              <span className="text-gray-800">{renderInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Numbered list: 1. item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1.5 my-1">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3E5FE0] border border-indigo-100 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span className="text-gray-800">{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Normal text paragraph
        return (
          <p key={idx} className="text-gray-800 leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Inline bold formatter helper
function renderInline(str: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let keyIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`b-${keyIndex++}`} className="font-semibold text-gray-950">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return <>{parts}</>;
}

export default function ChatPage() {
  const { user, profile } = useAuth();
  
  // Multi-Session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Chat UI states
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [currentTier, setCurrentTier] = useState<'low' | 'moderate' | 'high' | null>(null);
  const [selectedModality, setSelectedModality] = useState<ModalityMode>('compassion');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [stutterAlert, setStutterAlert] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Storage key helpers
  const getStorageKey = (uid: string) => `saathi_chat_sessions_v3_${uid}`;
  const getActiveIdKey = (uid: string) => `saathi_active_session_id_${uid}`;

  // Initial welcome message factory
  const createWelcomeMsg = (name: string): Message => ({
    id: 'welcome-' + Date.now(),
    sender: 'saathi',
    text: `### Welcome to your safe space, ${name}.

I am **Dr. Saathi**, your clinical emotional companion. Whether you are holding heavy anxiety, navigating demanding challenges, or simply need a grounded space to breathe, I am right here with you.

Take a slow breath. You can choose a therapeutic focus above, tap a prompt starter below, or simply share whatever is on your mind today.`,
    timestamp: new Date()
  });

  // Mute audio synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Voice Speech Synthesis
  const speakText = (text: string, msgId?: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      if (msgId && activeSpeechMsgId === msgId) {
        setActiveSpeechMsgId(null);
        return;
      }

      const cleanText = text
        .replace(/###/g, '')
        .replace(/##/g, '')
        .replace(/\*\*/g, '')
        .replace(/>/g, '')
        .replace(/[-*]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const warmVoice = voices.find(v => 
        (v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female')) ||
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('samantha') ||
        v.lang === 'en-US'
      );
      if (warmVoice) utterance.voice = warmVoice;

      utterance.onstart = () => {
        if (msgId) setActiveSpeechMsgId(msgId);
      };
      utterance.onend = () => {
        setActiveSpeechMsgId(null);
      };
      utterance.onerror = () => {
        setActiveSpeechMsgId(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setActiveSpeechMsgId(null);
    }
  };

  // Voice Recognition (Speech-to-Text with Stutter Attunement)
  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech-to-text is supported in Chrome, Edge, and Safari.");
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // Analyze spoken transcript for stutter or word repetition
        const words = transcript.trim().split(/\s+/);
        let hasStutter = false;
        for (let j = 0; j < words.length - 1; j++) {
          const current = words[j].toLowerCase().replace(/[^a-z]/g, '');
          const next = words[j + 1].toLowerCase().replace(/[^a-z]/g, '');
          if (current && current.length > 0 && current === next) {
            hasStutter = true;
            break;
          }
        }
        if (transcript.match(/\b([a-zA-Z]{1,3})[-—](\1[a-zA-Z]*)\b/i) || transcript.match(/\b(u+h+|u+m+|m+m+|m+h*m+|e+r+r*|a+h+|h+m+m*)\b/i)) {
          hasStutter = true;
        }

        if (hasStutter) {
          setStutterAlert(true);
        }

        // Live Spoken Voice Stress & Sentiment Tracking
        const lowerVoice = transcript.toLowerCase();
        const sadVoiceKeywords = ['sad', 'depressed', 'tired', 'exhausted', 'stress', 'stressed', 'anxious', 'scared', 'crying', 'heavy', 'hurt', 'pain', 'lonely', 'hopeless', 'overwhelmed', 'pressure', 'dark', 'burnout'];
        const crisisVoiceWords = ['kill myself', 'end it', 'die', 'harm myself', 'suicide'];
        
        let sadSpokenCues = 0;
        sadVoiceKeywords.forEach(w => { if (lowerVoice.includes(w)) sadSpokenCues++; });

        if (crisisVoiceWords.some(w => lowerVoice.includes(w))) {
          setCurrentScore(92);
          setCurrentTier('high');
          setShowCrisisBanner(true);
        } else if (sadSpokenCues > 0 || hasStutter) {
          // Incrementally increase stress on negative/tiring/sad or stuttered voice
          const base = currentScore ?? 0;
          const increase = Math.max(5, (sadSpokenCues * 5) + (hasStutter ? 8 : 0));
          const updatedScore = Math.min(96, base + increase);
          setCurrentScore(updatedScore);
          const computedTier: 'low' | 'moderate' | 'high' = updatedScore >= 70 ? 'high' : updatedScore >= 40 ? 'moderate' : 'low';
          setCurrentTier(computedTier);
          if (user) {
            db.createDistressScore(user.id, updatedScore, computedTier, 'Voice cues: Speech disfluency and emotional strain recorded.').catch(() => {});
          }
        } else if (['happy', 'great', 'awesome', 'good', 'joy', 'excited', 'calm', 'peaceful'].some(w => lowerVoice.includes(w))) {
          const base = currentScore ?? 0;
          const updatedScore = Math.max(0, base - 5);
          setCurrentScore(updatedScore);
          setCurrentTier(updatedScore >= 70 ? 'high' : updatedScore >= 40 ? 'moderate' : 'low');
        }

        setInputText(prev => prev ? prev + ' ' + transcript : transcript);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (err) {
      setListening(false);
    }
  };

  const toggleSpeech = () => {
    const nextState = !speechEnabled;
    setSpeechEnabled(nextState);
    if (!nextState) {
      stopSpeaking();
    }
  };

  // Copy message to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // ========================================================
  // PERSISTENCE & SESSION MANAGEMENT
  // ========================================================
  useEffect(() => {
    if (!user) return;

    const loadSessions = () => {
      const welcomeName = profile?.full_name?.split(' ')[0] || 'friend';
      const stored = localStorage.getItem(getStorageKey(user.id));
      const activeId = localStorage.getItem(getActiveIdKey(user.id));

      if (stored) {
        try {
          const parsed: ChatSession[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);
            
            // Find active or first session
            const current = parsed.find(s => s.id === activeId) || parsed[0];
            setActiveSessionId(current.id);
            setSelectedModality(current.modality || 'compassion');
            
            // Restore messages with proper Date instances
            const restored = current.messages.map(m => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }));
            setMessages(restored);
            return;
          }
        } catch (e) {
          console.error('Failed to parse chat sessions from storage:', e);
        }
      }

      // Default first session if none exists
      const initialSessionId = crypto.randomUUID();
      const initialWelcome = createWelcomeMsg(welcomeName);
      const newSession: ChatSession = {
        id: initialSessionId,
        title: 'New Consultation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modality: 'compassion',
        messages: [initialWelcome]
      };

      setSessions([newSession]);
      setActiveSessionId(initialSessionId);
      setMessages([initialWelcome]);
      saveSessionsToDisk([newSession], initialSessionId);
    };

    loadSessions();

    // Fetch distress score baseline: 0 for new users, last updated value for old users
    const fetchScores = async () => {
      try {
        const scores = await db.getDistressScores(user.id);
        if (scores.length > 0) {
          const lastScore = scores[scores.length - 1];
          setCurrentScore(lastScore.score);
          setCurrentTier(lastScore.tier);
          if (lastScore.tier === 'high') {
            setShowCrisisBanner(true);
          }
        } else {
          // Strictly 0 for new users
          setCurrentScore(0);
          setCurrentTier('low');
        }
      } catch (e) {
        setCurrentScore(0);
        setCurrentTier('low');
      }
    };

    fetchScores();

    // Listen to real-time distress index update events across application
    const handleDistressUpdate = (e: any) => {
      if (e?.detail && typeof e.detail.score === 'number') {
        setCurrentScore(e.detail.score);
        if (e.detail.tier) setCurrentTier(e.detail.tier);
      }
    };
    window.addEventListener('saathi-distress-updated', handleDistressUpdate);
    return () => {
      window.removeEventListener('saathi-distress-updated', handleDistressUpdate);
    };
  }, [user, profile]);

  // Save sessions to localStorage
  const saveSessionsToDisk = (updatedSessions: ChatSession[], currentActiveId: string) => {
    if (!user) return;
    try {
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(updatedSessions));
      localStorage.setItem(getActiveIdKey(user.id), currentActiveId);
    } catch (err) {
      console.error('Error saving chat sessions to localStorage:', err);
    }
  };

  // Start a brand new session (+ New Chat)
  const handleNewChat = () => {
    if (!user) return;
    if (sending) handleStopGeneration();
    stopSpeaking();

    const welcomeName = profile?.full_name?.split(' ')[0] || 'friend';
    const newId = crypto.randomUUID();
    const initialMsg = createWelcomeMsg(welcomeName);

    const newSession: ChatSession = {
      id: newId,
      title: 'New Consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modality: selectedModality,
      messages: [initialMsg]
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newId);
    setMessages([initialMsg]);
    saveSessionsToDisk(updated, newId);
    setMobileDrawerOpen(false);
  };

  // Switch to an existing session
  const handleSelectSession = (sessionId: string) => {
    if (sessionId === activeSessionId) {
      setMobileDrawerOpen(false);
      return;
    }
    if (sending) handleStopGeneration();
    stopSpeaking();

    const target = sessions.find(s => s.id === sessionId);
    if (!target) return;

    setActiveSessionId(target.id);
    setSelectedModality(target.modality || 'compassion');
    setMessages(target.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    })));

    saveSessionsToDisk(sessions, target.id);
    setMobileDrawerOpen(false);
  };

  // Delete an old chat session (hover action)
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const remaining = sessions.filter(s => s.id !== sessionId);

    if (remaining.length === 0) {
      // If deleting the last session, create a fresh empty one
      const welcomeName = profile?.full_name?.split(' ')[0] || 'friend';
      const newId = crypto.randomUUID();
      const initialMsg = createWelcomeMsg(welcomeName);

      const fresh: ChatSession = {
        id: newId,
        title: 'New Consultation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modality: 'compassion',
        messages: [initialMsg]
      };

      setSessions([fresh]);
      setActiveSessionId(newId);
      setMessages([initialMsg]);
      saveSessionsToDisk([fresh], newId);
    } else {
      setSessions(remaining);
      // If deleted session was active, switch to first available session
      if (sessionId === activeSessionId) {
        const nextActive = remaining[0];
        setActiveSessionId(nextActive.id);
        setSelectedModality(nextActive.modality || 'compassion');
        setMessages(nextActive.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
        saveSessionsToDisk(remaining, nextActive.id);
      } else {
        saveSessionsToDisk(remaining, activeSessionId || remaining[0].id);
      }
    }
  };

  // Autoscroll chat on messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Sentiment lexicon for local distress tracking
  const positiveLexicon = ['good', 'happy', 'fine', 'better', 'great', 'awesome', 'peaceful', 'calm', 'relax', 'glad', 'wonderful', 'joy', 'smile', 'love', 'excited', 'relieved'];
  const negativeLexicon = ['sad', 'stressed', 'hopeless', 'hurt', 'angry', 'hate', 'lonely', 'alone', 'worried', 'anxious', 'scared', 'fear', 'heavy', 'dark', 'pain', 'cry', 'tired', 'exhausted', 'overwhelmed', 'pressure', 'bad', 'burnout'];
  const warningLexicon = ['kill myself', 'end it', 'die', 'harm myself', 'no reason to live', 'suicide', 'give up', 'self harm'];

  const analyzeSentiment = (text: string): number => {
    const lower = text.toLowerCase();
    for (const w of warningLexicon) {
      if (lower.includes(w)) return -0.95;
    }

    let posCount = 0;
    let negCount = 0;

    positiveLexicon.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lower.match(regex);
      if (matches) posCount += matches.length;
    });

    negativeLexicon.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lower.match(regex);
      if (matches) negCount += matches.length;
    });

    const total = posCount + negCount;
    if (total === 0) return 0.0;
    return (posCount - negCount) / total;
  };

  // Stop current streaming generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSending(false);
    setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
  };

  // Dispatch message with streaming and session update
  const executeSendMessage = async (textToSend: string, forcedModality?: ModalityMode) => {
    if (!textToSend.trim() || sending) return;
    if (!user || !profile) return;

    const trimmed = textToSend.trim();
    setInputText('');
    setSending(true);

    const activeModality = forcedModality || selectedModality;

    // 1. Create message objects
    const userMsgId = crypto.randomUUID();
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };

    const assistantMsgId = crypto.randomUUID();
    const newAssistantMsg: Message = {
      id: assistantMsgId,
      sender: 'saathi',
      text: '',
      timestamp: new Date(),
      isStreaming: true
    };

    const updatedMessages = [...messages, newUserMsg, newAssistantMsg];
    setMessages(updatedMessages);

    // Update active session title if default
    let sessionTitle = '';
    const updatedSessions = sessions.map(sess => {
      if (sess.id === activeSessionId) {
        sessionTitle = (sess.title === 'New Consultation' || !sess.title)
          ? trimmed.slice(0, 36) + (trimmed.length > 36 ? '...' : '')
          : sess.title;
        return {
          ...sess,
          title: sessionTitle,
          updatedAt: new Date().toISOString(),
          messages: updatedMessages
        };
      }
      return sess;
    });

    setSessions(updatedSessions);
    saveSessionsToDisk(updatedSessions, activeSessionId || '');

    // 2. Local distress index update (computed synchronously so UI is instantaneous)
    // 2. Local distress index update based on accurate calibration rules
    const lowerTrimmed = trimmed.toLowerCase();
    const sentiment = analyzeSentiment(trimmed);
    const hasDarkCircles = lowerTrimmed.includes('dark circle') || lowerTrimmed.includes('dark circles');
    const negativeMatches = negativeLexicon.filter(w => lowerTrimmed.includes(w)).length;
    const isTiredOrNegative = sentiment < -0.15 || negativeMatches > 0 || lowerTrimmed.includes('tired') || lowerTrimmed.includes('exhausted') || lowerTrimmed.includes('sad');

    let scoreVal = currentScore ?? 0;
    let tier: 'low' | 'moderate' | 'high' = 'low';

    if (warningLexicon.some(w => lowerTrimmed.includes(w))) {
      tier = 'high';
      scoreVal = 92;
      setShowCrisisBanner(true);
    } else if (isTiredOrNegative) {
      // User Rule: When user says negative, tiring, or sad things to the bot, increase little the stress index value
      const delta = Math.max(5, Math.min(15, 6 + (negativeMatches * 2)));
      scoreVal = Math.min(96, (currentScore ?? 0) + delta);
      
      // If dark circles mentioned, ensure at least randomized 50-60 floor
      if (hasDarkCircles) {
        const darkCircleFloor = 50 + Math.floor(Math.random() * 11);
        scoreVal = Math.max(scoreVal, darkCircleFloor);
      }
      tier = scoreVal >= 70 ? 'high' : scoreVal >= 40 ? 'moderate' : 'low';
    } else if (hasDarkCircles) {
      // User Rule: If user has dark circles, randomize value between 50-60 (never always 50)
      const darkCircleFloor = 50 + Math.floor(Math.random() * 11);
      scoreVal = Math.max(darkCircleFloor, currentScore ?? 0);
      tier = 'moderate';
    } else if (sentiment > 0.2) {
      scoreVal = Math.max(0, (currentScore ?? 0) - 5);
      tier = scoreVal >= 70 ? 'high' : scoreVal >= 40 ? 'moderate' : 'low';
    }

    const explanation = tier === 'high' 
      ? 'Elevated distress indicators detected. Gentle care and safety support prioritized.'
      : tier === 'moderate'
        ? 'Mild emotional tension observed. Restorative reflection and grounding recommended.'
        : 'Emotionally stable baseline maintained.';

    setCurrentScore(scoreVal);
    setCurrentTier(tier);

    // Non-blocking database logging (never blocks chat streaming or causes hangs)
    Promise.all([
      db.createEntry(user.id, 'chat', trimmed, sentiment),
      db.createDistressScore(user.id, scoreVal, tier, explanation)
    ]).catch(dbErr => {
      console.warn('[Saathi Client] Non-blocking DB log note:', dbErr?.message || dbErr);
    });

    // 3. Stream from /api/chat with safety timeout and full error handling
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Safety timeout: abort after 25s to prevent infinite spinner
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        console.warn('[Saathi Client] Safety timeout reached (25s). Aborting stream...');
        abortControllerRef.current.abort();
      }
    }, 25000);

    try {
      console.log('[Saathi Client] Sending message to /api/chat at', new Date().toISOString(), 'Payload size:', trimmed.length);

      const historyPayload = messages
        .filter(m => !m.id.startsWith('welcome'))
        .slice(-10)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text
        }));

      historyPayload.push({
        role: 'user',
        content: trimmed
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          distressScore: scoreVal,
          userName: profile.full_name,
          modality: activeModality
        }),
        signal: abortController.signal
      });

      console.log('[Saathi Client] /api/chat returned response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status} from chat server`);
      }

      if (!response.body) {
        throw new Error('No response stream received from chat server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages(prev => prev.map(msg => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              text: accumulatedText,
              isStreaming: true
            };
          }
          return msg;
        }));
      }

      console.log('[Saathi Client] Stream completed. Total characters received:', accumulatedText.length);

      // Mark complete and persist in session
      const finalMessages = updatedMessages.map(msg => {
        if (msg.id === assistantMsgId) {
          return {
            ...msg,
            text: accumulatedText,
            isStreaming: false
          };
        }
        return msg;
      });

      setMessages(finalMessages);

      // Persist final response into session storage
      const finalSessions = sessions.map(sess => {
        if (sess.id === activeSessionId) {
          return {
            ...sess,
            updatedAt: new Date().toISOString(),
            messages: finalMessages
          };
        }
        return sess;
      });
      setSessions(finalSessions);
      saveSessionsToDisk(finalSessions, activeSessionId || '');

      // Read aloud if global voice is turned on
      if (speechEnabled) {
        speakText(accumulatedText, assistantMsgId);
      }

    } catch (err: any) {
      console.error('[Saathi Client] Error during chat dispatch:', err);
      const isTimeout = err?.name === 'AbortError';
      const fallbackText = isTimeout
        ? `I am right here with you, ${profile?.full_name || 'friend'}. The connection took a bit longer than expected to formulate a response. Take a slow, grounding breath. Could you try sharing your thought once more?`
        : `I hear you, ${profile?.full_name || 'friend'}, and I am holding space with you. A momentary connection issue occurred (${err.message || 'Network delay'}). Take a gentle breath. Could you share that with me once more?`;
      
      const fallbackMessages = updatedMessages.map(msg => {
        if (msg.id === assistantMsgId) {
          return {
            ...msg,
            text: fallbackText,
            isStreaming: false
          };
        }
        return msg;
      });

      setMessages(fallbackMessages);
      const finalSessions = sessions.map(sess => {
        if (sess.id === activeSessionId) {
          return {
            ...sess,
            messages: fallbackMessages
          };
        }
        return sess;
      });
      setSessions(finalSessions);
      saveSessionsToDisk(finalSessions, activeSessionId || '');
    } finally {
      clearTimeout(timeoutId);
      setSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeSendMessage(inputText);
    }
  };

  const handleStarterClick = (prompt: string, mode: ModalityMode) => {
    setSelectedModality(mode);
    executeSendMessage(prompt, mode);
  };

  const formatSessionTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return '';
    }
  };

  if (!user || !profile) return null;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4.3rem)] max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3 gap-3">
      
      {/* ======================================================== */}
      {/* CHAT SESSIONS SIDEBAR (Desktop: Collapsible, Mobile: Drawer) */}
      {/* ======================================================== */}
      <div 
        className={`hidden md:flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/90 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? 'w-72 p-3.5 shrink-0' : 'w-0 p-0 border-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          disabled={sending}
          className="w-full py-2.5 px-3.5 bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Consultation</span>
        </button>

        {/* Sessions History Header */}
        <div className="flex items-center justify-between px-1 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>Past Consultations</span>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{sessions.length}</span>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => handleSelectSession(sess.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#8FCBB0]/25 text-[#142E27] font-semibold border border-[#8FCBB0]/60 shadow-2xs'
                    : 'hover:bg-gray-100/80 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-6">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#3E6B63]' : 'text-gray-400'}`} />
                  <div className="truncate text-xs">
                    <div className="truncate font-medium">{sess.title || 'New Consultation'}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{formatSessionTime(sess.updatedAt)}</div>
                  </div>
                </div>

                {/* Delete button (Visible on hover or active) */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(sess.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all shrink-0"
                  title="Delete consultation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex md:hidden animate-fadeIn">
          <div className="bg-white w-4/5 max-w-xs h-full p-4 flex flex-col shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-base text-[#3E6B63]">Consultation History</h3>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleNewChat}
              disabled={sending}
              className="w-full py-2.5 px-3.5 bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs mb-3 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Consultation</span>
            </button>

            <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#8FCBB0]/25 text-[#142E27] font-semibold border border-[#8FCBB0]/60'
                        : 'hover:bg-gray-100/80 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-4">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3E6B63]' : 'text-gray-400'}`} />
                      <div className="truncate text-xs">
                        <div className="truncate font-medium">{sess.title || 'New Consultation'}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{formatSessionTime(sess.updatedAt)}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-lg shrink-0"
                      title="Delete consultation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN CHAT INTERFACE                                      */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* TOP HEADER & CONTROLS */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xs border border-gray-200/80 flex flex-col gap-2.5 mb-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            
            {/* Left: Sidebar Toggle, Avatar & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* History Toggle Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-colors"
                title={sidebarOpen ? "Collapse history sidebar" : "Expand history sidebar"}
              >
                {sidebarOpen ? <PanelLeftClose className="w-4.5 h-4.5" /> : <PanelLeftOpen className="w-4.5 h-4.5" />}
              </button>

              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="flex md:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-colors"
                title="Open past consultations"
              >
                <MessageSquare className="w-4.5 h-4.5" />
              </button>

              <Link 
                href="/dashboard" 
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-colors"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </Link>
              
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3E5FE0] to-[#8FCBB0] flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-50 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-poppins font-bold text-sm sm:text-base text-gray-900 tracking-tight truncate">
                      Dr. Saathi
                    </h2>
                    <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Master Therapist
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 hidden sm:block truncate">
                    Attuned Clinical Guidance • CBT • Somatic Vagal Grounding • DBT
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Voice playback toggle */}
              <button
                onClick={toggleSpeech}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  speechEnabled
                    ? 'bg-blue-50 border-blue-200 text-[#3E5FE0]'
                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700'
                }`}
                title={speechEnabled ? "Mute automatic vocal delivery" : "Enable vocal delivery"}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden lg:inline">{speechEnabled ? "Voice On" : "Voice Off"}</span>
              </button>

              {/* Header + New Chat Button */}
              <button
                onClick={handleNewChat}
                disabled={sending}
                className="px-3 py-1.5 rounded-xl bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Start a new therapeutic consultation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>

              {/* Distress Index Badge */}
              {currentScore !== null && currentTier && (
                <div className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-xs ${
                  currentTier === 'high'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : currentTier === 'moderate'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Distress:</span>
                  <span>{currentScore}/100</span>
                </div>
              )}
            </div>
          </div>

          {/* Modality Focus Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none">
            <span className="text-[11px] font-semibold text-gray-400 mr-1 shrink-0">Therapeutic Focus:</span>
            {MODALITIES.map(mode => {
              const Icon = mode.icon;
              const isSelected = selectedModality === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedModality(mode.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-[#3E5FE0] text-white border-[#3E5FE0] shadow-xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={mode.description}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CRISIS BANNER */}
        {showCrisisBanner && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-2 flex items-center justify-between gap-3 text-red-900 text-xs animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Immediate Support Available:</strong> You are not alone. 24/7 free clinical helplines:
              </span>
              <a href="tel:14416" className="font-bold underline text-red-700 hover:text-red-900">
                Tele-MANAS (14416)
              </a>
              <span className="hidden sm:inline">•</span>
              <a href="tel:+919820466726" className="font-bold underline text-red-700 hover:text-red-900 hidden sm:inline">
                AASRA (+91-9820466726)
              </a>
            </div>
            {profile.emergency_contact_phone && (
              <a
                href={`tel:${profile.emergency_contact_phone}`}
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-1 shrink-0"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call Contact</span>
              </a>
            )}
          </div>
        )}

        {/* MESSAGE CANVAS & STREAM */}
        <div 
          id="chat-middle-box"
          data-chat-box="true"
          className="chat-middle-box flex-1 bg-white/85 backdrop-blur-xs border border-gray-200/80 rounded-2xl overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col shadow-xs"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                  isUser 
                    ? 'bg-[#3E5FE0] text-white' 
                    : 'bg-gradient-to-tr from-[#3E6B63] to-[#8FCBB0] text-white'
                }`}>
                  {isUser ? profile.full_name[0].toUpperCase() : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble Container */}
                <div className="flex flex-col gap-1.5 max-w-full">
                  <div className={`rounded-2xl p-4 sm:p-5 shadow-xs relative leading-relaxed ${
                    isUser
                      ? 'bg-[#3E5FE0] text-white rounded-tr-xs'
                      : 'bg-white text-gray-800 border border-gray-200/90 rounded-tl-xs shadow-2xs'
                  }`}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    ) : (
                      <>
                        <FormattedMessage text={msg.text} isStreaming={msg.isStreaming} />
                        {msg.isStreaming && (
                          <div className="flex items-center gap-1.5 mt-3 text-xs text-indigo-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                            <span>Dr. Saathi is formulating clinical strategy...</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Action Footer */}
                  {!isUser && !msg.isStreaming && (
                    <div className="flex items-center gap-3 px-1 text-gray-400 text-xs">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
                        title="Copy text"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] text-emerald-600 font-medium">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Speech playback */}
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`p-1 rounded-md transition-colors flex items-center gap-1 ${
                          activeSpeechMsgId === msg.id 
                            ? 'text-[#3E5FE0] bg-blue-50 font-medium' 
                            : 'hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {activeSpeechMsgId === msg.id && (
                          <span className="text-[10px]">Playing...</span>
                        )}
                      </button>

                      {/* Timestamp */}
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {isUser && (
                    <span className="text-[10px] text-gray-400 text-right pr-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Stop Generating Button */}
          {sending && (
            <div className="flex justify-center sticky bottom-2">
              <button
                onClick={handleStopGeneration}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl px-4 py-1.5 shadow-md text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102"
              >
                <Square className="w-3.5 h-3.5 fill-current text-red-500" />
                <span>Stop Generating</span>
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* PROMPT STARTERS CHIPS (Shown when fresh or idle) */}
        {!sending && messages.length <= 2 && (
          <div className="pt-2 pb-1 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PROMPT_STARTERS.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterClick(item.prompt, item.mode)}
                  className="bg-white hover:bg-indigo-50/70 border border-gray-200/90 hover:border-indigo-200 rounded-xl px-3 py-2 text-left transition-all shrink-0 shadow-2xs group flex items-center gap-2 max-w-[280px]"
                >
                  <span className="text-base">{item.icon}</span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-gray-800 group-hover:text-[#3E5FE0] truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {item.prompt}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MULTILINE CHATGPT/CLAUDE INPUT DOCK */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-2.5 sm:p-3 mt-2 shrink-0">
          {stutterAlert && (
            <div className="mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-base">💚</span>
                <span>
                  <b>Dr. Saathi is attuned to your voice:</b> Micro-hesitations or speech repetitions detected. Take all the time you need; there is no rush here.
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setStutterAlert(false)} 
                className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-xs"
              >
                ✕
              </button>
            </div>
          )}
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
            
            <div className="flex items-end gap-2">
              {/* Mic button */}
              <button
                type="button"
                onClick={startListening}
                disabled={sending}
                className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                  listening
                    ? 'bg-red-500 border-red-600 text-white animate-pulse shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-[#3E5FE0] hover:bg-gray-100'
                }`}
                title={listening ? "Listening to voice... Click to pause" : "Voice dictation with stutter detection"}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  placeholder={
                    listening 
                      ? "Listening to your voice... speak freely" 
                      : `Speak with Dr. Saathi (${MODALITIES.find(m => m.id === selectedModality)?.label})... Shift+Enter for newline`
                  }
                  className="w-full bg-transparent resize-none px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none max-h-40 leading-relaxed"
                />
              </div>

              {/* Send or Stop */}
              {sending ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-sm shrink-0"
                  title="Stop response"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-2.5 bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white rounded-xl transition-all shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bottom helper footnote */}
            <div className="flex items-center justify-between px-1 text-[11px] text-gray-400 border-t border-gray-100 pt-1.5">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Private & confidential session • Chats persisted automatically</span>
              </div>
              <span className="hidden sm:inline">Press <b>Enter</b> to send, <b>Shift+Enter</b> for new line</span>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
