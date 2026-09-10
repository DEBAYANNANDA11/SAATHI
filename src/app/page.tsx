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
  Smile
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
    }, 450);
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
        // Phase transition
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
  const [simulatedScore, setSimulatedScore] = useState(38);

  const getTierDetails = (score: number) => {
    if (score <= 30) {
      return {
        label: 'Tier 1: Serene Baseline (Green)',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        barColor: 'bg-emerald-500',
        actionTitle: 'Empathetic Conversational Care',
        actionDesc: 'Daily positive check-ins, gratitude journaling, curated acoustic Spotify playlists, and habit reinforcement.',
        statusIcon: Smile,
      };
    } else if (score <= 65) {
      return {
        label: 'Tier 2: Moderate Fatigue / Stress (Yellow)',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        barColor: 'bg-amber-500',
        actionTitle: 'Active De-Stress Intervention',
        actionDesc: 'Facial dark circle fatigue alerts, Relief Arcade mini-games (Flappy Bird, Bot challenges), and guided 4-7-8 somatic breathing.',
        statusIcon: Activity,
      };
    } else {
      return {
        label: 'Tier 3: Acute Distress / High Priority (Red)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        barColor: 'bg-rose-500',
        actionTitle: 'Immediate Safety & Counselor Escalation',
        actionDesc: 'Warm crisis de-escalation protocol, instant confidential queue escalation to campus wellness officers, and 24/7 Tele-MANAS hotline button.',
        statusIcon: Shield,
      };
    }
  };

  const tierInfo = getTierDetails(simulatedScore);

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

      {/* ================= HERO SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 pt-12 sm:pt-16 pb-20 grid lg:grid-cols-12 gap-12 items-center relative">
        
        {/* Left Column: Headline & Pitch */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
          {/* Hackathon Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 self-center lg:self-start bg-white/85 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold text-[#142E27] shadow-sm border border-white/60 transition-all hover:scale-105">
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
          <p className="text-[#1E4339] text-base sm:text-lg leading-relaxed max-w-xl font-medium">
            SAATHI unites fast, empathetic AI conversations with passive multi-modal telemetry — sensing subtle typing rhythms, vocal fatigue, and facial strain to catch mental distress before it escalates.
          </p>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-semibold text-[#142E27]">
            <div className="flex items-center gap-1.5 p-2 bg-white/65 rounded-xl backdrop-blur-xs border border-white/40">
              <Volume2 className="w-3.5 h-3.5 text-[#3E5FE0]" />
              <span>Voice Catcher</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-white/65 rounded-xl backdrop-blur-xs border border-white/40">
              <Camera className="w-3.5 h-3.5 text-[#3E6B63]" />
              <span>Fatigue Scan</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-white/65 rounded-xl backdrop-blur-xs border border-white/40">
              <Gamepad2 className="w-3.5 h-3.5 text-[#3E5FE0]" />
              <span>Relief Arcade</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-white/65 rounded-xl backdrop-blur-xs border border-white/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>100% Private</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-3">
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
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/40 hover:bg-white/70 text-[#142E27] font-medium rounded-2xl transition-all border border-white/40 text-sm"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              Try 30-Sec Pause
            </button>
          </div>

          {/* Trust Guarantee */}
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-[#1E4339] font-medium">
            <div className="flex -space-x-2">
              <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#8FCBB0] bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">AN</span>
              <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#8FCBB0] bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">RK</span>
              <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#8FCBB0] bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">PS</span>
            </div>
            <span>Built for campus student privacy &bull; Zero data retention</span>
          </div>
        </div>

        {/* Right Column: Interactive Live Hero Mockup */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          {/* Subtle Backing Halo */}
          <div className="absolute inset-0 bg-[#3E5FE0]/15 blur-3xl rounded-full transform scale-90 -z-10" />

          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/70 max-w-lg w-full relative overflow-hidden transition-all duration-500 hover:shadow-3xl">
            
            {/* Top Bar of Mockup */}
            <div className="flex justify-between items-center pb-4 border-b border-[#EEF1FB] mb-5">
              <div className="flex items-center gap-2.5">
                <Logo size={32} showText />
                <span className="hidden sm:inline-block text-[11px] font-bold text-[#3E5FE0] bg-[#3E5FE0]/10 px-2 py-0.5 rounded-full">
                  Interactive Demo
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

            {/* Interactive Scenario Pills */}
            <div className="mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center justify-between">
                <span>Select a scenario to test AI:</span>
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
            <div className="space-y-3.5 min-h-[175px] flex flex-col justify-end">
              {/* User message */}
              <div className="flex gap-2.5 items-start justify-end">
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

            {/* Live Distress Telemetry Breakdown */}
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

              {/* Progress Bar */}
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

      {/* ================= INTERACTIVE 30-SEC MINDFUL BREATH WIDGET ================= */}
      <section id="breathing-widget" className="max-w-4xl mx-auto px-6 py-10 w-full">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/80 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8FCBB0]/30 rounded-full text-xs font-bold text-[#142E27] mb-3">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Instant Somatic Reset</span>
            </div>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">
              Take a 30-Second Micro-Pause
            </h2>
            <p className="text-[#1E4339] text-sm sm:text-base mt-2 leading-relaxed">
              Feeling overwhelmed right now? Sync your breathing with SAATHI’s interactive rhythm to balance your autonomic nervous system.
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

      {/* ================= INTERACTIVE 3-TIER DISTRESS SLIDER (PS 94) ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 relative">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF1FB] text-[#3E5FE0] rounded-full text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Smart India Hackathon Core Architecture</span>
            </div>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">
              Dynamic 3-Tier Escalation Protocol
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Slide the distress scale below to see how SAATHI dynamically transitions safety interventions.
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
                className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100"
              >
                Set Serene (15)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedScore(48)}
                className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100"
              >
                Set Moderate (48)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedScore(85)}
                className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100"
              >
                Set High Distress (85)
              </button>
            </div>
          </div>

          {/* Active Tier Dynamic Card */}
          <div className="bg-[#F2F8F5] p-6 sm:p-7 rounded-2xl border border-[#3E6B63]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tierInfo.badgeClass}`}>
                  {tierInfo.label}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  Calculated Index: <strong className="text-[#142E27]">{simulatedScore}/100</strong>
                </span>
              </div>
              <h3 className="font-poppins font-bold text-xl text-[#142E27]">
                {tierInfo.actionTitle}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">
                {tierInfo.actionDesc}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {simulatedScore <= 30 && (
                <div className="px-4 py-3 bg-emerald-100/70 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  No Counselor Alert Needed
                </div>
              )}
              {simulatedScore > 30 && simulatedScore <= 65 && (
                <div className="px-4 py-3 bg-amber-100/80 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-amber-700" />
                  Relief Arcade & Spotify Unlocked
                </div>
              )}
              {simulatedScore > 65 && (
                <div className="px-4 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
                  <Shield className="w-4 h-4" />
                  Confidential Escalation Active
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6-PILLAR FEATURE SUITE ================= */}
      <section className="bg-white border-t border-[#EEF1FB] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF1FB] text-[#3E5FE0] rounded-full text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Spectrum Telemetry</span>
            </div>
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#142E27]">
              A non-intrusive, supportive ecosystem
            </h2>
            <p className="text-gray-500 mt-3 text-base">
              SAATHI seamlessly weaves passive biometric indicators and fun therapeutic diversions into a privacy-first web sanctuary.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Biometric Face Vision */}
            <div className="p-7 bg-[#F2F8F5] border border-[#3E6B63]/15 rounded-3xl flex flex-col gap-4 transition-all duration-300 hover:shadow-xl group">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 bg-[#3E5FE0]/10 text-[#3E5FE0] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  100% Local AI
                </span>
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#142E27]">
                Facial & Dark Circle Vision
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Anonymous on-device computer vision detects sleep deprivation, dark circle pixel density, and eyelid fatigue without saving any frames to disk.
              </p>
            </div>

            {/* Feature 2: Acoustic Voice Stress */}
            <div className="p-7 bg-[#F2F8F5] border border-[#3E6B63]/15 rounded-3xl flex flex-col gap-4 transition-all duration-300 hover:shadow-xl group">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <Volume2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#3E5FE0]/10 text-[#3E5FE0]">
                  Acoustic FFT
                </span>
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#142E27]">
                Acoustic Voice Catcher
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Evaluates vocal cadence, pitch jitter, and long conversational pauses to recognize signs of sadness, fatigue, or acute emotional strain.
              </p>
            </div>

            {/* Feature 3: Relief Arcade */}
            <div className="p-7 bg-[#F2F8F5] border border-[#3E6B63]/15 rounded-3xl flex flex-col gap-4 transition-all duration-300 hover:shadow-xl group">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  5+ Minigames
                </span>
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#142E27]">
                Relief Arcade Distraction
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Break stressful rumination loops instantly with fun, engaging challenges like Flappy Bird, Bot vs User duels, and bubble pops.
              </p>
            </div>

            {/* Feature 4: Distress Analysis Chat */}
            <div className="p-7 bg-[#F2F8F5] border border-[#3E6B63]/15 rounded-3xl flex flex-col gap-4 transition-all duration-300 hover:shadow-xl group">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 bg-[#3E5FE0]/10 text-[#3E5FE0] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Ultra Fast
                </span>
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#142E27]">
                Distress Analysis Chat
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Compassionate conversations that dynamically update distress level indices through subtle semantic flags and typing cadences.
              </p>
            </div>

            {/* Feature 5: Zero-Knowledge Journals */}
            <div className="p-7 bg-[#F2F8F5] border border-[#3E6B63]/15 rounded-3xl flex flex-col gap-4 transition-all duration-300 hover:shadow-xl group">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 bg-emerald-600/10 text-emerald-700 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  End-to-End
                </span>
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#142E27]">
                Private Safe Journals
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Uncensored personal sanctuary. Express your private thoughts freely with mood tracking, trigger tags, and guaranteed encryption.
              </p>
            </div>

            {/* Feature 6: Trend & Escalation Dashboard */}
            <div className="p-7 bg-[#F2F8F5] border border-[#3E6B63]/15 rounded-3xl flex flex-col gap-4 transition-all duration-300 hover:shadow-xl group">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 bg-[#3E6B63]/15 text-[#3E6B63] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <LineChart className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EEF1FB] text-[#3E6B63]">
                  30-Day Curve
                </span>
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#142E27]">
                Trend Telemetry & Escalation
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track your longitudinal mental wellness history with precise hover timestamps and safe multi-tier counselor bridge alerts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= TRADITIONAL VS SAATHI COMPARISON ================= */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27]">
            Why SAATHI Outperforms Traditional Counseling Check-Ins
          </h2>
          <p className="text-[#1E4339] mt-2 text-sm sm:text-base">
            Eliminating stigma through frictionless, intelligent telemetry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Legacy Methods */}
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

          {/* SAATHI Intelligent Approach */}
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

      {/* ================= INTERACTIVE FAQ ACCORDION ================= */}
      <section className="max-w-4xl mx-auto px-6 py-12 w-full">
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

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
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
