'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  ShieldCheck, 
  MessageSquare, 
  LineChart, 
  ArrowRight,
  Brain,
  Users,
  Lock,
  Sparkles,
  Play,
  Pause,
  RefreshCw,
  Activity,
  Volume2,
  Camera,
  Gamepad2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Music,
  Eye,
  Shield,
  Smile,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  // --- Interactive Chat Simulation State ---
  const chatScenarios = [
    {
      id: 'exam',
      label: 'Exam Overload 📚',
      userMessage: 'I have three back-to-back finals tomorrow and I can’t breathe...',
      saathiReply: 'Take a long, slow breath with me right now. You do not have to conquer the whole semester tonight — just this next hour. What is one small concept we can tackle first?',
      distressScore: 42,
      tier: 'Moderate Stress',
      tierColor: 'text-amber-600 bg-amber-50 border-amber-200',
      vocalTone: 'Hurried / Shallow breathing detected',
    },
    {
      id: 'burnout',
      label: 'Late Night Burnout ☕',
      userMessage: 'Everything feels heavy and I just want to disappear under my blanket.',
      saathiReply: 'I hear that heaviness. It is completely okay to feel exhausted. You don’t have to prove anything right now. Would listening to soft acoustic rain help ease the pressure?',
      distressScore: 68,
      tier: 'Elevated Distress',
      tierColor: 'text-rose-600 bg-rose-50 border-rose-200',
      vocalTone: 'Fatigued cadence & low pitch velocity',
    },
    {
      id: 'calm',
      label: 'Quick Mindful Pause 🌿',
      userMessage: 'Just checking in during my lunch break. Feeling decent today!',
      saathiReply: 'That is wonderful to hear! Recognizing calm moments anchors resilience. Let’s celebrate today’s peaceful groove with a 2-minute gratitude journal entry.',
      distressScore: 16,
      tier: 'Serene Baseline',
      tierColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      vocalTone: 'Resonant & relaxed pace',
    }
  ];

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const currentScenario = chatScenarios[activeScenarioIdx];

  const handleSelectScenario = (index: number) => {
    if (index === activeScenarioIdx) return;
    setIsTyping(true);
    setTimeout(() => {
      setActiveScenarioIdx(index);
      setIsTyping(false);
    }, 400);
  };

  // --- Interactive Breathing Widget State ---
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev > 1) return prev - 1;
        setBreathPhase((current) => {
          if (current === 'Inhale') return 'Hold';
          if (current === 'Hold') return 'Exhale';
          return 'Inhale';
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  // --- Interactive Distress Tier Slider State ---
  const [simulatedScore, setSimulatedScore] = useState(48);

  const getActiveTierIndex = (score: number) => {
    if (score <= 30) return 0;
    if (score <= 65) return 1;
    return 2;
  };

  const activeTierIdx = getActiveTierIndex(simulatedScore);

  const protocolTiers = [
    {
      tierNum: 1,
      name: 'Serene Baseline',
      range: 'Score 0 – 30',
      color: 'emerald',
      borderClass: 'border-emerald-300 ring-2 ring-emerald-400/30',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      bgActive: 'bg-emerald-50/70',
      icon: Smile,
      coreResponse: 'Compassionate Maintenance',
      bullets: [
        'Daily reflective AI check-in conversations',
        'Private gratitude & mood logs with zero plaintext sharing',
        'Curated calming acoustic & ambient Spotify playlists',
        'Continuous gentle baseline tracking'
      ],
      alertStatus: 'No Clinical Alert Needed'
    },
    {
      tierNum: 2,
      name: 'Moderate Fatigue / Stress',
      range: 'Score 31 – 65',
      color: 'amber',
      borderClass: 'border-amber-300 ring-2 ring-amber-400/30',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      bgActive: 'bg-amber-50/70',
      icon: Activity,
      coreResponse: 'Active Relief & Distraction',
      bullets: [
        'Dark circle & voice pitch exhaustion alerts',
        'Relief Arcade distraction games (Flappy Bird, Bot vs User)',
        'Guided 4-7-8 somatic breathing reset exercises',
        'Prompted check-ins to prevent symptom escalation'
      ],
      alertStatus: 'Relief Arcade & Music Unlocked'
    },
    {
      tierNum: 3,
      name: 'Acute Distress / Urgent',
      range: 'Score 66 – 100',
      color: 'rose',
      borderClass: 'border-rose-400 ring-2 ring-rose-500/40',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      bgActive: 'bg-rose-50/80',
      icon: Shield,
      coreResponse: 'Urgent Safety Escalation',
      bullets: [
        'Gentle, warm empathetic crisis de-escalation protocol',
        'Confidential anonymized bridge to campus wellness officer queue',
        'Direct one-tap 24/7 Tele-MANAS (14416) emergency connection',
        'Optional encrypted emergency contact telephone dialer'
      ],
      alertStatus: 'Confidential Escalation Queue Active'
    }
  ];

  // --- Feature Tabs Filter State ---
  const [activeFeatureTab, setActiveFeatureTab] = useState<'all' | 'biometrics' | 'relief' | 'privacy'>('all');

  const featureCards = [
    {
      id: 'vision',
      category: 'biometrics',
      title: 'Facial & Dark Circle Vision',
      tag: '100% Local AI',
      tagColor: 'bg-emerald-100 text-emerald-800',
      icon: Camera,
      iconColor: 'text-[#3E5FE0] bg-[#3E5FE0]/10',
      description: 'Anonymous on-device computer vision detects sleep deprivation, dark circle pixel density, and eyelid fatigue without saving any frames to disk.',
      linkHref: '/detect',
      linkLabel: 'Test Biometric Vision'
    },
    {
      id: 'voice',
      category: 'biometrics',
      title: 'Acoustic Voice Stress Catcher',
      tag: 'Acoustic FFT',
      tagColor: 'bg-[#3E5FE0]/10 text-[#3E5FE0]',
      icon: Volume2,
      iconColor: 'text-rose-600 bg-rose-500/10',
      description: 'Evaluates vocal cadence, pitch jitter, and conversational hesitation to recognize signs of sadness, fatigue, or acute emotional strain.',
      linkHref: '/detect',
      linkLabel: 'Try Voice Catcher'
    },
    {
      id: 'arcade',
      category: 'relief',
      title: 'Relief Arcade Distraction',
      tag: '5+ Minigames',
      tagColor: 'bg-amber-100 text-amber-800',
      icon: Gamepad2,
      iconColor: 'text-amber-600 bg-amber-500/10',
      description: 'Break stressful rumination loops instantly with fun, engaging challenges like Flappy Bird, Bot vs User duels, and bubble pops.',
      linkHref: '/arcade',
      linkLabel: 'Play Relief Arcade'
    },
    {
      id: 'chat',
      category: 'relief',
      title: 'Distress Analysis Chat',
      tag: 'Ultra Fast AI',
      tagColor: 'bg-indigo-100 text-indigo-800',
      icon: MessageSquare,
      iconColor: 'text-[#3E5FE0] bg-[#3E5FE0]/10',
      description: 'Compassionate conversations that dynamically update distress level indices through subtle semantic flags and typing cadences.',
      linkHref: '/chat',
      linkLabel: 'Talk to Saathi'
    },
    {
      id: 'journals',
      category: 'privacy',
      title: 'Private Safe Journals',
      tag: 'End-to-End',
      tagColor: 'bg-emerald-100 text-emerald-800',
      icon: Heart,
      iconColor: 'text-emerald-700 bg-emerald-600/10',
      description: 'Uncensored personal sanctuary. Express your private thoughts freely with mood tracking, trigger tags, and guaranteed encryption.',
      linkHref: '/journal',
      linkLabel: 'Open Private Journal'
    },
    {
      id: 'telemetry',
      category: 'privacy',
      title: 'Trend Telemetry & Escalation',
      tag: '30-Day Curve',
      tagColor: 'bg-[#EEF1FB] text-[#3E6B63]',
      icon: LineChart,
      iconColor: 'text-[#3E6B63] bg-[#3E6B63]/15',
      description: 'Track your longitudinal mental wellness history with precise hover timestamps and safe multi-tier counselor bridge alerts.',
      linkHref: '/history',
      linkLabel: 'View History Curve'
    }
  ];

  const filteredFeatures = activeFeatureTab === 'all' 
    ? featureCards 
    : featureCards.filter(f => f.category === activeFeatureTab);

  // --- Interactive FAQ Accordion State ---
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does SAATHI record or save my webcam video and voice audio?',
      a: 'Never. All biometric face landmarking (dark circles, eye blink rates) and acoustic pitch extraction occur 100% locally in your browser memory using Web APIs. No raw video or audio files are ever transmitted to or stored on our servers.'
    },
    {
      q: 'How does SAATHI fulfill Smart India Hackathon 2026 Problem Statement 94?',
      a: 'PS 94 challenges us to build an unobtrusive, early distress detection system for higher education institutes. SAATHI combines passive multi-modal telemetry (typing cadence, acoustic jitter, facial strain) with a privacy-first 3-tier escalation engine.'
    },
    {
      q: 'How does the Relief Arcade help alleviate stress?',
      a: 'Cognitive distraction therapy is a clinically proven method to interrupt acute anxiety feedback loops. Our 5+ interactive mini-games (Flappy Bird, Bot vs User, Whack-A-Stress) redirect dopamine and reset physiological fight-or-flight states.'
    },
    {
      q: 'Can my teachers or parents read my private chat messages?',
      a: 'Absolutely not. All journal entries and chat sessions are end-to-end encrypted with zero-knowledge keys. In Tier-3 emergency escalations, institutional counselors only see aggregate distress indices and clinical triage recommendations — never your private words.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#8FCBB0] overflow-x-hidden selection:bg-[#3E5FE0] selection:text-white">
      {/* Ambient Floating Particle Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#3E5FE0]/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#142E27]/10 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-white/25 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      {/* ================= HERO SECTION (SLIDE-IN ANIMATIONS) ================= */}
      <section className="max-w-7xl mx-auto px-6 pt-12 sm:pt-16 pb-20 grid lg:grid-cols-12 gap-12 items-center relative">
        
        {/* Left Column: Sliding Headline & Controls */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left animate-slide-in-left">
          
          {/* Hackathon Pill with Slide-in Down */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 self-center lg:self-start bg-white/85 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold text-[#142E27] shadow-sm border border-white/60 transition-all hover:scale-105 animate-slide-in-down">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <Brain className="w-4 h-4 text-[#3E6B63]" />
            <span>Smart India Hackathon 2026 &bull; PS 94</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-[#3E5FE0]/10 text-[#3E5FE0] text-[11px] rounded-full font-bold">
              v2.0 Active
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl text-[#142E27] leading-[1.12] tracking-tight">
            Your silent companion for{' '}
            <span className="relative inline-block text-[#3E5FE0]">
              emotional well-being
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#3E5FE0]/30" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                <path d="M1 5.5C50 1.5 150 1.5 199 5.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-[#1E4339] text-base sm:text-lg leading-relaxed max-w-xl font-medium animate-fadeIn">
            SAATHI combines responsive conversational AI with subtle typing cadence, acoustic voice strain analysis, and non-intrusive facial fatigue vision to detect early distress — connecting you to support when it matters most.
          </p>

          {/* Quick Feature Badges in Card Format */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-semibold text-[#142E27] animate-slide-in-up">
            <div className="flex items-center gap-1.5 p-2.5 bg-white/70 rounded-xl backdrop-blur-xs border border-white/50 shadow-xs transition-transform hover:-translate-y-0.5">
              <Volume2 className="w-3.5 h-3.5 text-[#3E5FE0]" />
              <span>Voice Catcher</span>
            </div>
            <div className="flex items-center gap-1.5 p-2.5 bg-white/70 rounded-xl backdrop-blur-xs border border-white/50 shadow-xs transition-transform hover:-translate-y-0.5">
              <Camera className="w-3.5 h-3.5 text-[#3E6B63]" />
              <span>Fatigue Scan</span>
            </div>
            <div className="flex items-center gap-1.5 p-2.5 bg-white/70 rounded-xl backdrop-blur-xs border border-white/50 shadow-xs transition-transform hover:-translate-y-0.5">
              <Gamepad2 className="w-3.5 h-3.5 text-[#3E5FE0]" />
              <span>Relief Arcade</span>
            </div>
            <div className="flex items-center gap-1.5 p-2.5 bg-white/70 rounded-xl backdrop-blur-xs border border-white/50 shadow-xs transition-transform hover:-translate-y-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>100% Private</span>
            </div>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-2 animate-slide-in-up">
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#3E5FE0] hover:bg-[#324fbe] text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-base"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#3E5FE0] hover:bg-[#324fbe] text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-base"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-4 border border-[#3E6B63]/25 bg-white/80 hover:bg-white text-[#142E27] font-semibold rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  Log In
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('breathing-widget');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/40 hover:bg-white/75 text-[#142E27] font-semibold rounded-2xl transition-all border border-white/50 text-sm"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              Try 30-Sec Pause
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visual Mockup Card (Slide-In Right) */}
        <div className="lg:col-span-6 relative flex justify-center items-center animate-slide-in-right">
          <div className="absolute inset-0 bg-[#3E5FE0]/15 blur-3xl rounded-full transform scale-90 -z-10" />

          {/* Main Hero Visual Card Format */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/80 max-w-lg w-full relative overflow-hidden transition-all duration-500">
            
            {/* Top Bar of Mockup Card */}
            <div className="flex justify-between items-center pb-4 border-b border-[#EEF1FB] mb-5">
              <div className="flex items-center gap-2.5">
                <Logo size={32} showText />
                <span className="hidden sm:inline-block text-[11px] font-bold text-[#3E5FE0] bg-[#3E5FE0]/10 px-2.5 py-0.5 rounded-full">
                  Interactive Card Demo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  AI Active
                </span>
              </div>
            </div>

            {/* Interactive Scenario Card Switchers */}
            <div className="mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center justify-between">
                <span>Select scenario to test AI:</span>
                <span className="text-[#3E5FE0] flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" /> Live simulation
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {chatScenarios.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(idx)}
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeScenarioIdx === idx
                        ? 'bg-[#3E5FE0] text-white shadow-md scale-102'
                        : 'bg-[#EEF1FB] text-[#3E6B63] hover:bg-[#e2e7f9]'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3.5 min-h-[170px] flex flex-col justify-end">
              {/* User message */}
              <div className="flex gap-2.5 items-start justify-end animate-fadeIn">
                <div className="bg-[#3E5FE0] text-white p-3.5 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-sm leading-relaxed">
                  {currentScenario.userMessage}
                </div>
              </div>

              {/* Saathi AI reply with typing state */}
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-[#8FCBB0]/30 flex items-center justify-center text-xs font-bold text-[#3E6B63] shrink-0">
                  S
                </div>
                {isTyping ? (
                  <div className="bg-[#EEF1FB] p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3E5FE0] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#3E5FE0] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#3E5FE0] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <div className="bg-[#EEF1FB] p-3.5 rounded-2xl rounded-tl-none text-sm text-[#142E27] font-medium max-w-[85%] leading-relaxed border border-[#3E5FE0]/10 animate-fadeIn">
                    {currentScenario.saathiReply}
                  </div>
                )}
              </div>
            </div>

            {/* Live Distress Telemetry Footer Bar */}
            <div className="mt-5 pt-4 border-t border-[#EEF1FB] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#3E5FE0]" />
                  Calculated Distress:
                </span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${currentScenario.tierColor}`}>
                  Score {currentScenario.distressScore} &bull; {currentScenario.tier}
                </span>
              </div>

              {/* Dynamic Score Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${
                    currentScenario.distressScore < 30 ? 'bg-emerald-500' : currentScenario.distressScore < 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${currentScenario.distressScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-[#3E6B63]" />
                  {currentScenario.vocalTone}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Lock className="w-3 h-3" /> Zero Plaintext Logged
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 3-STEP "HOW SAATHI WORKS" JOURNEY CARDS FORMAT ================= */}
      <section className="max-w-6xl mx-auto px-6 py-8 w-full animate-slide-in-up">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full text-xs font-bold text-[#142E27] mb-2 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#3E5FE0]" />
            <span>Telemetry Architecture</span>
          </div>
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">
            How SAATHI Works in 3 Continuous Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Journey Card 01 */}
          <div className="bg-white/90 backdrop-blur-xs p-6 rounded-3xl border border-white shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-[#3E5FE0]/10 text-[#3E5FE0]">
                STEP 01
              </span>
              <Camera className="w-5 h-5 text-[#3E6B63]" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-[#142E27]">
              Unobtrusive Sensing
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Passive detection monitors typing rhythm, acoustic pitch variations, and dark circle fatigue directly in browser memory.
            </p>
          </div>

          {/* Journey Card 02 */}
          <div className="bg-white/90 backdrop-blur-xs p-6 rounded-3xl border border-white shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-[#3E5FE0]/10 text-[#3E5FE0]">
                STEP 02
              </span>
              <Brain className="w-5 h-5 text-[#3E5FE0]" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-[#142E27]">
              Zero-Knowledge Triage
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Our clinical scoring model calculates a real-time Distress Index (0 to 100) and categorizes into 3 safety action tiers.
            </p>
          </div>

          {/* Journey Card 03 */}
          <div className="bg-white/90 backdrop-blur-xs p-6 rounded-3xl border border-white shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-[#3E5FE0]/10 text-[#3E5FE0]">
                STEP 03
              </span>
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-[#142E27]">
              Tailored Intervention
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Instantly unlocks the Relief Arcade, guided breathing, or bridges high-distress students directly to campus counselors.
            </p>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE 30-SEC MINDFUL BREATH WIDGET CARD ================= */}
      <section id="breathing-widget" className="max-w-5xl mx-auto px-6 py-10 w-full animate-slide-in-up">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8FCBB0]/30 rounded-full text-xs font-bold text-[#142E27] mb-3">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Instant Somatic Reset</span>
            </div>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">
              Take a 30-Second Micro-Pause
            </h2>
            <p className="text-[#1E4339] text-sm sm:text-base mt-2 leading-relaxed">
              Feeling overwhelmed right now? Sync your breathing with SAATHI’s interactive rhythm to re-balance your autonomic nervous system.
            </p>
            <div className="mt-5 flex items-center justify-center md:justify-start gap-4">
              <button
                type="button"
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142E27] hover:bg-[#1f4238] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isBreathingActive ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Rhythm
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Start Breathing
                  </>
                )}
              </button>
              {isBreathingActive && (
                <span className="text-xs font-medium text-[#3E6B63] flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-[#3E5FE0]" />
                  Follow the expanding circle
                </span>
              )}
            </div>
          </div>

          {/* Visual Breathing Orb */}
          <div className="relative flex items-center justify-center w-48 h-48">
            <div 
              className={`absolute rounded-full transition-all duration-1000 ease-in-out ${
                isBreathingActive && breathPhase === 'Inhale' 
                  ? 'w-44 h-44 bg-[#3E5FE0]/25' 
                  : isBreathingActive && breathPhase === 'Hold'
                  ? 'w-44 h-44 bg-emerald-500/25'
                  : 'w-24 h-24 bg-[#8FCBB0]/40'
              }`}
            />
            <div 
              className={`relative z-10 w-32 h-32 rounded-full bg-gradient-to-tr from-[#3E6B63] to-[#3E5FE0] text-white flex flex-col items-center justify-center shadow-lg transition-all duration-1000 ${
                isBreathingActive && breathPhase === 'Inhale'
                  ? 'scale-110 shadow-[#3E5FE0]/30 shadow-2xl'
                  : isBreathingActive && breathPhase === 'Hold'
                  ? 'scale-110 ring-4 ring-emerald-300'
                  : 'scale-90'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                {isBreathingActive ? breathPhase : 'Ready?'}
              </span>
              <span className="text-3xl font-poppins font-black mt-0.5">
                {isBreathingActive ? breathCount : '4-4-4'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE 3-TIER ESCALATION CARDS FORMAT (PS 94) ================= */}
      <section className="max-w-6xl mx-auto px-6 py-14 w-full animate-slide-in-up">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 relative">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF1FB] text-[#3E5FE0] rounded-full text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Smart India Hackathon Core Architecture</span>
            </div>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">
              Dynamic 3-Tier Escalation Protocol
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Slide the distress scale or click directly on any card below to see how SAATHI adapts safety protocols.
            </p>
          </div>

          {/* Slider Control */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
              <span className="text-emerald-700">0 &bull; Serene Baseline</span>
              <span className="text-amber-700">50 &bull; Moderate Stress</span>
              <span className="text-rose-700">100 &bull; Urgent SOS</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simulatedScore}
              onChange={(e) => setSimulatedScore(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3E5FE0]"
            />
            <div className="flex justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setSimulatedScore(15)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTierIdx === 0 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Set Serene (15)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedScore(48)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTierIdx === 1 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Set Moderate (48)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedScore(85)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTierIdx === 2 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Set High Distress (85)
              </button>
            </div>
          </div>

          {/* 3-CARD PROTOCOL DECK FORMAT */}
          <div className="grid md:grid-cols-3 gap-6 pt-2">
            {protocolTiers.map((tier, idx) => {
              const isActive = activeTierIdx === idx;
              const IconComponent = tier.icon;
              return (
                <div
                  key={tier.tierNum}
                  onClick={() => {
                    if (idx === 0) setSimulatedScore(15);
                    if (idx === 1) setSimulatedScore(48);
                    if (idx === 2) setSimulatedScore(85);
                  }}
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? `${tier.bgActive} ${tier.borderClass} shadow-xl scale-102 -translate-y-1`
                      : 'bg-[#F2F8F5]/70 border-gray-200/70 hover:bg-white hover:border-gray-300 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tier.badgeClass}`}>
                        {tier.range}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#142E27] text-white animate-pulse">
                          Active Tier
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-white shadow-2xs">
                        <IconComponent className="w-5 h-5 text-[#3E6B63]" />
                      </div>
                      <div>
                        <h4 className="font-poppins font-bold text-base text-[#142E27]">
                          {tier.name}
                        </h4>
                        <span className="text-xs text-gray-500 font-medium">
                          {tier.coreResponse}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2 pt-2 text-xs text-gray-700">
                      {tier.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-200/60 text-center">
                    <span className="text-[11px] font-bold text-[#142E27]">
                      {tier.alertStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIZED FEATURE CARDS DECK FORMAT ================= */}
      <section className="bg-white border-t border-[#EEF1FB] py-20 px-6 animate-slide-in-up">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF1FB] text-[#3E5FE0] rounded-full text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Spectrum Telemetry</span>
            </div>
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#142E27]">
              A non-intrusive, supportive ecosystem
            </h2>
            <p className="text-gray-500 mt-3 text-base">
              SAATHI seamlessly weaves passive biometric indicators and fun therapeutic diversions into a privacy-first sanctuary.
            </p>
          </div>

          {/* Cards Category Filter Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 bg-[#EEF1FB]/70 rounded-2xl border border-[#EEF1FB] gap-1 max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveFeatureTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFeatureTab === 'all' 
                    ? 'bg-white text-[#142E27] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Capabilities
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('biometrics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFeatureTab === 'biometrics' 
                    ? 'bg-white text-[#142E27] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Biometric Vision & Voice 👁️
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('relief')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFeatureTab === 'relief' 
                    ? 'bg-white text-[#142E27] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Relief Arcade & Therapy 🎮
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('privacy')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFeatureTab === 'privacy' 
                    ? 'bg-white text-[#142E27] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Privacy & Care 🛡️
              </button>
            </div>
          </div>

          {/* Feature Cards Grid Format */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatures.map((f) => {
              const IconComp = f.icon;
              return (
                <div 
                  key={f.id}
                  className="p-7 bg-[#F2F8F5] border border-[#3E6B63]/15 rounded-3xl flex flex-col justify-between gap-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeIn"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-13 h-13 ${f.iconColor} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${f.tagColor}`}>
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="font-poppins font-bold text-lg text-[#142E27] group-hover:text-[#3E5FE0] transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {f.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#3E6B63]/10">
                    <Link
                      href={f.linkHref}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3E5FE0] hover:underline"
                    >
                      <span>{f.linkLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TRADITIONAL VS SAATHI COMPARISON CARDS ================= */}
      <section className="max-w-5xl mx-auto px-6 py-12 w-full animate-slide-in-up">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">
            Why SAATHI Outperforms Traditional Counseling Check-Ins
          </h2>
          <p className="text-[#1E4339] mt-2 text-sm sm:text-base">
            Eliminating stigma through frictionless, intelligent telemetry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Legacy Methods Card */}
          <div className="bg-white/80 backdrop-blur-xs p-7 rounded-3xl border border-rose-200 shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full self-start">
              Traditional Methods
            </span>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">&times;</span>
                Intrusive, 40-question questionnaires that students ignore.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">&times;</span>
                Stigma prevents students from walking into a counselor’s office.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">&times;</span>
                Interventions happen weeks after distress has already peaked.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">&times;</span>
                Zero interactive distraction tools during active anxiety attacks.
              </li>
            </ul>
          </div>

          {/* SAATHI Intelligent Approach Card */}
          <div className="bg-white p-7 rounded-3xl border-2 border-[#3E5FE0]/40 shadow-xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#3E5FE0] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              SAATHI Standard
            </div>
            <span className="text-xs font-bold text-[#3E5FE0] uppercase tracking-wider bg-[#EEF1FB] px-3 py-1 rounded-full self-start">
              Intelligent Multi-Modal Ecosystem
            </span>
            <ul className="space-y-3 text-sm text-[#142E27] font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Zero-friction passive signals (typing cadences, dark circle fatigue, pitch tone).
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                100% anonymous, safe space accessible 24/7 on your personal phone or laptop.
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Instant sub-second distress tier calculations with real-time escalation.
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Immediate Relief Arcade mini-games and Spotify tracks to break acute stress.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE FAQ ACCORDION CARDS ================= */}
      <section className="max-w-4xl mx-auto px-6 py-12 w-full animate-slide-in-up">
        <div className="text-center mb-10">
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">
            Frequently Asked Questions
          </h2>
          <p className="text-[#1E4339] text-sm mt-2">
            Everything you need to know about SAATHI’s security, privacy, and technology.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-white/80 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-poppins font-semibold text-[#142E27] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#3E5FE0] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= PRIVACY GUARANTEE BANNER ================= */}
      <section className="bg-gradient-to-r from-[#142E27] via-[#1E4339] to-[#142E27] text-white py-14 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-1">
            <ShieldCheck className="w-8 h-8 text-[#8FCBB0]" />
          </div>
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl">Privacy & Consent First</h2>
          <p className="text-[#EEF1FB] text-sm sm:text-base leading-relaxed max-w-2xl">
            We operate strictly under student consent. We never save raw chat text to counselor logs. Only anonymized telemetry metadata and distress index scores are processed to assure absolute data security.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-xs text-[#8FCBB0] font-semibold">
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Zero Plain-Text Logs</span>
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> No Raw Video Streaming</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> SIH 2026 PS 94 Compliant</span>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA CARD SECTION ================= */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center animate-slide-in-up">
        <div className="bg-white p-10 sm:p-14 rounded-3xl shadow-2xl border border-white/80 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF1FB] text-[#3E5FE0] rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free for Higher Education Students</span>
            </div>
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#142E27] leading-tight">
              Take the first step toward lighter days
            </h2>
            <p className="text-gray-600 text-base">
              Whether you need to vent in encrypted journals, challenge a bot in the Relief Arcade, or simply talk things through, SAATHI is right here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3E5FE0] hover:bg-[#324fbe] text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-base"
              >
                {user ? "Open Your Dashboard" : "Start Free Anonymous Check-In"}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/arcade"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#EEF1FB] hover:bg-[#e0e5f9] text-[#3E6B63] font-semibold rounded-2xl transition-all duration-300 text-base"
              >
                <Gamepad2 className="w-5 h-5 text-[#3E5FE0]" />
                Explore Relief Arcade
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
