'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, Entry } from '@/lib/supabase';
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
  Info
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'saathi';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
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
  // Split into paragraphs / lines
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
            <h3 key={idx} className="font-semibold text-base text-[#1E3A34] pt-1 pb-0.5 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3E5FE0] shrink-0" />
              <span>{renderInline(trimmed.replace('### ', ''))}</span>
            </h3>
          );
        }

        // Heading 2: ## Title
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="font-bold text-lg text-[#1E3A34] pt-1 pb-0.5 tracking-tight">
              {renderInline(trimmed.replace('## ', ''))}
            </h2>
          );
        }

        // Blockquote: > Quote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-[#3E5FE0] bg-indigo-50/60 pl-3.5 pr-3 py-2 rounded-r-xl italic text-gray-700 my-1">
              {renderInline(trimmed.replace('> ', ''))}
            </blockquote>
          );
        }

        // Numbered list: 1. , 2.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3E5FE0]/15 text-[#3E5FE0] text-xs font-bold flex items-center justify-center mt-0.5">
                {numMatch[1]}
              </span>
              <div className="flex-1 text-gray-700">
                {renderInline(numMatch[2])}
              </div>
            </div>
          );
        }

        // Bullet list: - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E5FE0] mt-2 shrink-0" />
              <div className="flex-1 text-gray-700">
                {renderInline(bulletText)}
              </div>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-gray-700">
            {renderInline(trimmed)}
          </p>
        );
      })}

      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-[#3E5FE0] ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
}

// Inline parser for bold and highlights
function renderInline(str: string): React.ReactNode {
  // Regex to split by **bold** or *italic*
  const parts: React.ReactNode[] = [];
  let remaining = str;
  let keyIndex = 0;

  // Process bold: **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`b-${keyIndex++}`} className="font-semibold text-gray-900">
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

      // Strip markdown symbols for clean vocal delivery
      const cleanText = text
        .replace(/###/g, '')
        .replace(/##/g, '')
        .replace(/\*\*/g, '')
        .replace(/>/g, '')
        .replace(/[-*]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.92; // Calm, deliberate cadence of a therapist
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

  // Voice Recognition (Speech-to-Text with Stutter / Disfluency Attunement)
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
        if (transcript.match(/\b([a-zA-Z]{1,3})[-—](\1[a-zA-Z]*)\b/i)) {
          hasStutter = true;
        }

        if (hasStutter) {
          setStutterAlert(true);
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

  // Load chat history & metrics on component mount
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // 1. Fetch entries from DB
      const entries = await db.getEntries(user.id, 'chat');
      const formatted: Message[] = [];

      // Initial welcome message
      const welcomeName = profile?.full_name?.split(' ')[0] || 'friend';
      formatted.push({
        id: 'welcome',
        sender: 'saathi',
        text: `### Welcome to your safe space, ${welcomeName}.

I am **Dr. Saathi**, your clinical emotional companion. Whether you are holding heavy anxiety, navigating a demanding crossroad, or simply need a grounded space to breathe, I am here with you.

Take a slow breath. You can choose a therapeutic focus above, tap a prompt starter below, or simply share whatever is on your mind today.`,
        timestamp: new Date()
      });

      // Map recent entries
      if (entries.length > 0) {
        const sortedEntries = [...entries].reverse();
        sortedEntries.forEach((entry) => {
          formatted.push({
            id: entry.id,
            sender: 'user',
            text: entry.content,
            timestamp: new Date(entry.created_at)
          });
        });
      }

      setMessages(formatted);

      // 2. Fetch current distress index
      const scores = await db.getDistressScores(user.id);
      if (scores.length > 0) {
        const lastScore = scores[scores.length - 1];
        setCurrentScore(lastScore.score);
        setCurrentTier(lastScore.tier);
        if (lastScore.tier === 'high') {
          setShowCrisisBanner(true);
        }
      } else {
        setCurrentScore(32);
        setCurrentTier('low');
      }
    };

    loadData();
  }, [user, profile]);

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

  // Clear / New Session
  const handleNewSession = () => {
    if (sending) handleStopGeneration();
    stopSpeaking();
    
    const welcomeName = profile?.full_name?.split(' ')[0] || 'friend';
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: 'saathi',
        text: `### Fresh Session Started

I am here with you, ${welcomeName}. What would you like to explore or reflect on in this session?`,
        timestamp: new Date()
      }
    ]);
  };

  // Dispatch message with streaming
  const executeSendMessage = async (textToSend: string, forcedModality?: ModalityMode) => {
    if (!textToSend.trim() || sending) return;
    if (!user || !profile) return;

    const trimmed = textToSend.trim();
    setInputText('');
    setSending(true);

    const activeModality = forcedModality || selectedModality;

    // 1. Append user message
    const userMsgId = crypto.randomUUID();
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };

    // 2. Prepare empty assistant message for streaming
    const assistantMsgId = crypto.randomUUID();
    const newAssistantMsg: Message = {
      id: assistantMsgId,
      sender: 'saathi',
      text: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, newUserMsg, newAssistantMsg]);

    // 3. Local distress index update
    const sentiment = analyzeSentiment(trimmed);
    await db.createEntry(user.id, 'chat', trimmed, sentiment);

    const entries = await db.getEntries(user.id);
    const rollingEntries = entries.slice(0, 6);
    const avgSentiment = rollingEntries.reduce((sum, entry) => sum + Number(entry.sentiment_score), 0) / (rollingEntries.length || 1);

    let scoreVal = Math.round(50 - (avgSentiment * 40));
    scoreVal = Math.max(0, Math.min(100, scoreVal));

    let tier: 'low' | 'moderate' | 'high' = 'low';
    if (scoreVal >= 75) tier = 'high';
    else if (scoreVal >= 40) tier = 'moderate';

    if (warningLexicon.some(w => trimmed.toLowerCase().includes(w))) {
      tier = 'high';
      scoreVal = Math.max(scoreVal, 88);
      setShowCrisisBanner(true);
    }

    let explanation = tier === 'high' 
      ? 'Elevated distress indicators detected. Gentle care and safety support prioritized.'
      : tier === 'moderate'
        ? 'Mild emotional tension observed. Restorative reflection and grounding recommended.'
        : 'Emotionally stable baseline maintained.';

    const dbScore = await db.createDistressScore(user.id, scoreVal, tier, explanation);
    setCurrentScore(dbScore.score);
    setCurrentTier(dbScore.tier);

    // 4. Stream from /api/chat
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build history for backend
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text
        }));

      // Add current turn
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

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body received.');
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

      // Mark complete
      setMessages(prev => prev.map(msg => {
        if (msg.id === assistantMsgId) {
          return {
            ...msg,
            text: accumulatedText,
            isStreaming: false
          };
        }
        return msg;
      }));

      // Read aloud if global voice is turned on
      if (speechEnabled) {
        speakText(accumulatedText, assistantMsgId);
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat error:', err);
        setMessages(prev => prev.map(msg => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              text: `I am right here with you, ${profile?.full_name || 'friend'}. Take a slow breath. Could you share that with me once more?`,
              isStreaming: false
            };
          }
          return msg;
        }));
      }
    } finally {
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

  if (!user || !profile) return null;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4.2rem)] max-w-5xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-4">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & THERAPIST TOOLBAR                       */}
      {/* ======================================================== */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xs border border-gray-200/80 flex flex-col gap-2.5 mb-2">
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Avatar & Title */}
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3E5FE0] to-[#8FCBB0] flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-50">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-poppins font-bold text-sm sm:text-base text-gray-900 tracking-tight">
                    Dr. Saathi
                  </h2>
                  <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Master Therapist
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 hidden sm:block">
                  Evidence-based clinical guidance • CBT • ACT • Somatic Grounding
                </p>
              </div>
            </div>
          </div>

          {/* Right: Controls & Distress Gauge */}
          <div className="flex items-center gap-2">
            
            {/* Audio Read-aloud toggle */}
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                speechEnabled
                  ? 'bg-blue-50 border-blue-200 text-[#3E5FE0]'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700'
              }`}
              title={speechEnabled ? "Mute automatic read-aloud" : "Enable automatic read-aloud"}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{speechEnabled ? "Voice Active" : "Muted"}</span>
            </button>

            {/* New Session Button */}
            <button
              onClick={handleNewSession}
              disabled={sending}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Start a new therapeutic session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Session</span>
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

        {/* Modality Mode Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-gray-400 mr-1 shrink-0">Focus:</span>
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

      {/* ======================================================== */}
      {/* 2. CRISIS INTERVENTION BANNER (If High Distress)          */}
      {/* ======================================================== */}
      {showCrisisBanner && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-2 flex items-center justify-between gap-3 text-red-900 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Immediate Support Available:</strong> You are not alone. 24/7 free clinical helplines:
            </span>
            <a 
              href="tel:14416" 
              className="font-bold underline text-red-700 hover:text-red-900"
            >
              Tele-MANAS (14416)
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="tel:+919820466726" 
              className="font-bold underline text-red-700 hover:text-red-900 hidden sm:inline"
            >
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

      {/* ======================================================== */}
      {/* 3. MESSAGE CANVAS & CHAT STREAM                           */}
      {/* ======================================================== */}
      <div className="flex-1 bg-white/80 backdrop-blur-xs border border-gray-200/80 rounded-2xl overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col shadow-xs">
        
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
                <div className={`p-4 rounded-2xl shadow-xs transition-all ${
                  isUser
                    ? 'bg-[#3E5FE0] text-white rounded-tr-xs font-normal'
                    : 'bg-[#F8FAFC] text-gray-800 rounded-tl-xs border border-gray-200/70'
                }`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                  ) : (
                    <FormattedMessage text={msg.text} isStreaming={msg.isStreaming} />
                  )}
                </div>

                {/* Message Actions Bar (for Assistant responses) */}
                {!isUser && msg.text && !msg.isStreaming && (
                  <div className="flex items-center gap-2 pl-1 text-gray-400 text-xs">
                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
                      title="Copy response"
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

                    {/* Speech audio playback */}
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

        {/* Floating Stop Generating Control */}
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

      {/* ======================================================== */}
      {/* 4. PROMPT STARTERS CHIPS (When starting or idle)         */}
      {/* ======================================================== */}
      {!sending && messages.length <= 3 && (
        <div className="pt-2 pb-1">
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

      {/* ======================================================== */}
      {/* 5. MULTILINE CHATGPT/CLAUDE INPUT DOCK                   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-2.5 sm:p-3 mt-2">
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
            {/* Microphone button */}
            <button
              type="button"
              onClick={startListening}
              disabled={sending}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                listening
                  ? 'bg-red-500 border-red-600 text-white animate-pulse shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-[#3E5FE0] hover:bg-gray-100'
              }`}
              title={listening ? "Listening... Click to pause" : "Voice dictation"}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Auto-growing Textarea */}
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

            {/* Send or Stop Button */}
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
                className="p-2.5 bg-[#3E5FE0] hover:bg-indigo-600 text-white rounded-xl transition-all shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none shrink-0"
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
              <span>Private & confidential session • Distress Index tracking active</span>
            </div>
            <span className="hidden sm:inline">Press <b>Enter</b> to send, <b>Shift+Enter</b> for new line</span>
          </div>

        </form>
      </div>

    </div>
  );
}
