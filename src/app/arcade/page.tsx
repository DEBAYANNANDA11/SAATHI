'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Gamepad2, 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  Sparkles, 
  Laugh, 
  Smile, 
  Heart, 
  Zap, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Flame, 
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Shuffle
} from 'lucide-react';

// Sound Synthesizer via Web Audio API (Zero external audio assets required)
class ArcadeSound {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  private initCtx() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playFlap() {
    if (!this.enabled || !this.ctx) return;
    this.initCtx();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(560, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playScore() {
    if (!this.enabled || !this.ctx) return;
    this.initCtx();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playBonk() {
    if (!this.enabled || !this.ctx) return;
    this.initCtx();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playBubblePop() {
    if (!this.enabled || !this.ctx) return;
    this.initCtx();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const pitch = 400 + Math.random() * 300;
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch + 250, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playWhack() {
    if (!this.enabled || !this.ctx) return;
    this.initCtx();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playLaughChime() {
    if (!this.enabled || !this.ctx) return;
    this.initCtx();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.07);
      gain.gain.setValueAtTime(0.18, this.ctx!.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + idx * 0.07 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + idx * 0.07);
      osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.2);
    });
  }
}

// 15 Curated Wholesome & Hilarious Relief Jokes
const JOKES_COLLECTION = [
  {
    id: 1,
    setup: "Why don't therapists ever play hide and seek?",
    punchline: "Because good luck hiding when they already know what you're avoiding!",
    emoji: "🙈"
  },
  {
    id: 2,
    setup: "My brain currently has 47 tabs open...",
    punchline: "4 of them are completely frozen, and I have no clue where the background music is coming from!",
    emoji: "💻"
  },
  {
    id: 3,
    setup: "Why did the smartphone go to therapy?",
    punchline: "Because it completely lost its connection and had way too many unresolved attachments!",
    emoji: "📱"
  },
  {
    id: 4,
    setup: "I asked my foam stress ball how its day was going...",
    punchline: "It said it was feeling a tremendous amount of pressure.",
    emoji: "🎾"
  },
  {
    id: 5,
    setup: "Why was the math textbook always so depressed?",
    punchline: "It had too many problems and had to solve every single one all alone!",
    emoji: "📐"
  },
  {
    id: 6,
    setup: "My wallet is a lot like an onion...",
    punchline: "Every single time I open it, it brings tears to my eyes!",
    emoji: "🧅"
  },
  {
    id: 7,
    setup: "Why did the neuron cross the brain?",
    punchline: "To get to the other synapse!",
    emoji: "🧠"
  },
  {
    id: 8,
    setup: "I told my doctor I get stressed thinking about the future...",
    punchline: "He told me to stop living in tomorrow. I asked for a refund since today is already paid for!",
    emoji: "⏳"
  },
  {
    id: 9,
    setup: "I tried doing yoga to relax...",
    punchline: "I spent 40 minutes trying to untangle my left knee and now I need physical therapy!",
    emoji: "🧘"
  },
  {
    id: 10,
    setup: "If overthinking and stress actually burned calories...",
    punchline: "I would currently be completely invisible!",
    emoji: "✨"
  },
  {
    id: 11,
    setup: "I told my anxiety that everything is going to be completely fine.",
    punchline: "It looked right back at me and whispered: 'Okay, but what if a rogue meteorite hits in 4 seconds?'",
    emoji: "☄️"
  },
  {
    id: 12,
    setup: "My bed and I have a deeply romantic relationship.",
    punchline: "We are perfect for each other, but my morning alarm clock is furiously jealous!",
    emoji: "⏰"
  },
  {
    id: 13,
    setup: "What do you call a fake noodle that causes performance anxiety?",
    punchline: "An impasta!",
    emoji: "🍝"
  },
  {
    id: 14,
    setup: "I'm on a 30-day mental health cleanse.",
    punchline: "So far, I've successfully eliminated 30 days of productivity!",
    emoji: "🥑"
  },
  {
    id: 15,
    setup: "Why do programmers always prefer dark mode?",
    punchline: "Because light attracts bugs!",
    emoji: "🐛"
  }
];

export default function ReliefArcadePage() {
  const [activeTab, setActiveTab] = useState<'flappy' | 'tictactoe' | 'pong' | 'whack' | 'bubble' | 'jokes'>('flappy');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundRef = useRef<ArcadeSound | null>(null);

  useEffect(() => {
    soundRef.current = new ArcadeSound();
  }, []);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.enabled = soundEnabled;
    }
  }, [soundEnabled]);

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="p-2.5 bg-white hover:bg-gray-100 rounded-xl text-gray-500 hover:text-[#142E27] transition-colors shadow-sm border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27] flex items-center gap-2.5 flex-wrap">
              <span>Relief Arcade</span>
              <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-indigo-100 text-[#142E27] border border-emerald-200 rounded-full font-semibold flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5 text-[#3E5FE0]" /> Joy & Distraction Therapy
              </span>
            </h1>
            <p className="text-[#1E4339] text-xs sm:text-sm mt-0.5 font-medium">
              Interactive mini-games and laughter therapy designed to interrupt stressful thought loops and spark joy.
            </p>
          </div>
        </div>

        {/* Global Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-2 shadow-xs transition-all"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Sound: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-400" />
              <span>Sound: OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Game Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200/80 no-scrollbar">
        {[
          { id: 'flappy', label: '🐦 Flappy Saathi', desc: 'Zen Flap' },
          { id: 'tictactoe', label: '❌ Bot vs User: Tic-Tac-Toe', desc: 'AI Match' },
          { id: 'pong', label: '🏓 Bot vs User: Mind Pong', desc: 'Air Hockey' },
          { id: 'whack', label: '🔨 Whack-A-Stress', desc: 'Smash Doubts' },
          { id: 'bubble', label: '🫧 Zen Bubble Wrap', desc: 'Tactile Pop' },
          { id: 'jokes', label: '😂 Laughter Therapy', desc: '15 Jokes' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#142E27] text-white shadow-md'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/60'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE GAME CANVAS CONTAINER */}
      <div className="w-full">
        {activeTab === 'flappy' && <FlappySaathiGame sound={soundRef.current} />}
        {activeTab === 'tictactoe' && <TicTacToeGame sound={soundRef.current} />}
        {activeTab === 'pong' && <MindPongGame sound={soundRef.current} />}
        {activeTab === 'whack' && <WhackAStressGame sound={soundRef.current} />}
        {activeTab === 'bubble' && <ZenBubbleWrap sound={soundRef.current} />}
        {activeTab === 'jokes' && <LaughterTherapyCorner sound={soundRef.current} />}
      </div>

    </div>
  );
}

// ========================================================
// GAME 1: FLAPPY SAATHI (FLAPPY BIRD RELAXATION EDITION)
// ========================================================
function FlappySaathiGame({ sound }: { sound: ArcadeSound | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOverMsg, setGameOverMsg] = useState('');

  const stateRef = useRef({
    birdY: 160,
    birdVelocity: 0,
    pipes: [] as Array<{ x: number; topH: number; bottomY: number; passed: boolean }>,
    stars: [] as Array<{ x: number; y: number; collected: boolean }>,
    score: 0,
    isPlaying: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('saathi_flappy_high');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const funnyGameOverQuotes = [
    "Ouch! You bumped into Monday Morning. Shake it off and flap again!",
    "Whoops! Hit an Overthinking cloud. Take a slow breath and retry!",
    "Even eagles take a breather! Ready for another flight?",
    "A minor turbulence! Your resilient wings will conquer it next round.",
    "Bam! Collision with a sudden deadline. Flap higher next time!"
  ];

  const handleFlap = () => {
    if (stateRef.current.isPlaying) {
      stateRef.current.birdVelocity = -5.8;
      sound?.playFlap();
    } else {
      startGame();
    }
  };

  const startGame = () => {
    stateRef.current = {
      birdY: 160,
      birdVelocity: -5,
      pipes: [
        { x: 380, topH: 90, bottomY: 210, passed: false },
        { x: 580, topH: 120, bottomY: 240, passed: false }
      ],
      stars: [
        { x: 480, y: 150, collected: false }
      ],
      score: 0,
      isPlaying: true
    };
    setScore(0);
    setGameState('playing');
    sound?.playFlap();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const state = stateRef.current;

      // 1. CLEAR & BACKGROUND SKY GRADIENT
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#7ED4BE'); // Mint teal
      gradient.addColorStop(1, '#E6F7F2'); // Soft pastel emerald
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant Calm Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(80, 50, 30, 0, Math.PI * 2);
      ctx.arc(120, 45, 40, 0, Math.PI * 2);
      ctx.arc(160, 55, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(360, 80, 35, 0, Math.PI * 2);
      ctx.arc(405, 75, 45, 0, Math.PI * 2);
      ctx.arc(450, 85, 35, 0, Math.PI * 2);
      ctx.fill();

      if (state.isPlaying) {
        // Apply Bird Gravity & Motion
        state.birdVelocity += 0.28;
        state.birdY += state.birdVelocity;

        // Move Pillars & Stars
        state.pipes.forEach(pipe => {
          pipe.x -= 2.4;

          // Check if bird passed pipe
          if (!pipe.passed && pipe.x + 45 < 120) {
            pipe.passed = true;
            state.score += 1;
            setScore(state.score);
            sound?.playScore();
          }
        });

        // Spawn new pipes
        if (state.pipes.length > 0 && state.pipes[state.pipes.length - 1].x < canvas.width - 180) {
          const topH = 50 + Math.random() * 110;
          const gap = 115;
          state.pipes.push({
            x: canvas.width + 20,
            topH,
            bottomY: topH + gap,
            passed: false
          });

          // 50% chance to spawn a bonus star
          if (Math.random() > 0.4) {
            state.stars.push({
              x: canvas.width + 100,
              y: topH + gap / 2,
              collected: false
            });
          }
        }

        // Cleanup off-screen pipes
        state.pipes = state.pipes.filter(p => p.x > -60);
        state.stars = state.stars.filter(s => s.x > -40);

        // Move stars
        state.stars.forEach(s => {
          s.x -= 2.4;
          // Check collision with star
          if (!s.collected && Math.hypot(120 - s.x, state.birdY - s.y) < 26) {
            s.collected = true;
            state.score += 3;
            setScore(state.score);
            sound?.playScore();
          }
        });

        // Floor / Ceiling collisions
        if (state.birdY < 15 || state.birdY > canvas.height - 25) {
          triggerGameOver();
        }

        // Pipe collisions
        state.pipes.forEach(pipe => {
          const birdBox = { x: 105, y: state.birdY - 14, w: 28, h: 28 };
          // Top pipe collision
          if (birdBox.x + birdBox.w > pipe.x && birdBox.x < pipe.x + 45 && birdBox.y < pipe.topH) {
            triggerGameOver();
          }
          // Bottom pipe collision
          if (birdBox.x + birdBox.w > pipe.x && birdBox.x < pipe.x + 45 && birdBox.y + birdBox.h > pipe.bottomY) {
            triggerGameOver();
          }
        });
      }

      function triggerGameOver() {
        state.isPlaying = false;
        sound?.playBonk();
        setGameState('gameover');
        const quote = funnyGameOverQuotes[Math.floor(Math.random() * funnyGameOverQuotes.length)];
        setGameOverMsg(quote);
        setHighScore(prev => {
          const best = Math.max(prev, state.score);
          localStorage.setItem('saathi_flappy_high', best.toString());
          return best;
        });
      }

      // 2. DRAW PIPES (Soft emerald bamboo / stress pillars)
      state.pipes.forEach(pipe => {
        // Top Pipe
        ctx.fillStyle = '#2D6A4F';
        ctx.fillRect(pipe.x, 0, 46, pipe.topH);
        ctx.fillStyle = '#1B4332';
        ctx.fillRect(pipe.x - 3, pipe.topH - 14, 52, 14);

        // Bottom Pipe
        ctx.fillStyle = '#2D6A4F';
        ctx.fillRect(pipe.x, pipe.bottomY, 46, canvas.height - pipe.bottomY);
        ctx.fillStyle = '#1B4332';
        ctx.fillRect(pipe.x - 3, pipe.bottomY, 52, 14);
      });

      // 3. DRAW BONUS ZEN STARS ⭐
      state.stars.forEach(s => {
        if (!s.collected) {
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(s.x, s.y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FEF3C7';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('★', s.x - 5, s.y + 4);
        }
      });

      // 4. DRAW BIRD (Saathi Mascot with cute wings)
      const birdX = 120;
      const birdY = state.birdY;
      const tilt = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, state.birdVelocity * 0.08));

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(tilt);

      // Bird Body (Golden sunshine yellow)
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Wing (Animated flap)
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      const wingFlap = Math.sin(Date.now() * 0.02) * 6;
      ctx.ellipse(-6, 2, 10, 6 + wingFlap, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(7, -5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(8, -5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Beak (Orange)
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(24, 2);
      ctx.lineTo(14, 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // 5. GROUND LAYER
      ctx.fillStyle = '#40916C';
      ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
      ctx.fillStyle = '#52B788';
      ctx.fillRect(0, canvas.height - 18, canvas.width, 4);

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-lg flex flex-col items-center gap-5">
      
      {/* Game Bar */}
      <div className="flex items-center justify-between w-full max-w-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
            🐦
          </div>
          <div>
            <h3 className="font-poppins font-bold text-base text-gray-800">Flappy Saathi</h3>
            <span className="text-xs text-gray-400 font-medium">Tap screen or Spacebar to flap & soar</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</span>
            <span className="font-poppins font-black text-xl text-[#3E5FE0]">{score}</span>
          </div>
          <div className="flex flex-col text-right border-l border-gray-100 pl-4">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Best
            </span>
            <span className="font-poppins font-black text-xl text-gray-800">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Canvas Screen */}
      <div 
        onClick={handleFlap}
        className="relative w-full max-w-xl aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl cursor-pointer select-none"
      >
        <canvas
          ref={canvasRef}
          width={560}
          height={400}
          className="w-full h-full object-cover"
        />

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white text-center p-6 animate-fadeIn">
            <span className="text-4xl animate-bounce">🐦</span>
            <h4 className="font-poppins font-bold text-xl">Ready to Fly?</h4>
            <p className="text-xs text-emerald-200 max-w-xs leading-relaxed">
              Click anywhere or press <b>SPACE</b> to float gently over stress pillars and grab bonus stars!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="px-6 py-2.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-bold text-xs rounded-xl shadow-lg mt-2 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Flap to Begin
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white text-center p-6 animate-fadeIn">
            <span className="text-4xl">🌤️</span>
            <h4 className="font-poppins font-bold text-xl text-amber-300">Take a Deep Breath</h4>
            <p className="text-xs text-slate-200 max-w-sm italic font-medium">
              "{gameOverMsg}"
            </p>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold mt-1">
              <span>Score: <b className="text-emerald-300">{score}</b></span>
              <span>•</span>
              <span>High Score: <b className="text-amber-300">{highScore}</b></span>
            </div>
            <button
              type="button"
              onClick={startGame}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg mt-2 flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Flap Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[11px] text-gray-400 text-center font-medium">
        💡 Pro-tip: Rhythmically tapping every 0.6 seconds helps you glide smoothly between pillars.
      </div>
    </div>
  );
}

// ========================================================
// GAME 2: BOT VS USER: TIC-TAC-TOE WITH DR. SAATHI
// ========================================================
function TicTacToeGame({ sound }: { sound: ArcadeSound | null }) {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null); // 'user', 'bot', 'tie'
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [ties, setTies] = useState(0);
  const [botCommentary, setBotCommentary] = useState("Hey friend! I'm Dr. Saathi AI. Make your first move—let's see who's got the sharper mind today! 😄");

  const checkWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(s => s !== null)) return 'tie';
    return null;
  };

  const userComments = [
    "Bold opening! I like your confidence.",
    "Ooh, an aggressive flank! Let me run some algorithms on that...",
    "Are you trying to trap me? I took 3 courses in game theory!",
    "Sneaky corner play! But my emotional quotient says watch out.",
    "Nice move! My circuits are definitely feeling the pressure."
  ];

  const botComments = [
    "Counter-attack deployed! Your turn now.",
    "Blocked! My neural network saw that coming 0.2s ago.",
    "Calculating probabilities... done! Let's see your response.",
    "I'm feeling quite strategic today, friend!"
  ];

  const handleCellClick = (index: number) => {
    if (board[index] || !isUserTurn || winner) return;

    sound?.playBubblePop();
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsUserTurn(false);

    const winStatus = checkWinner(newBoard);
    if (winStatus) {
      handleEnd(winStatus);
      return;
    }

    setBotCommentary(userComments[Math.floor(Math.random() * userComments.length)]);

    // Bot AI turn after short realistic pause (550ms)
    setTimeout(() => {
      const bestMove = getBotMove(newBoard);
      if (bestMove !== null) {
        newBoard[bestMove] = 'O';
        setBoard(newBoard);
        sound?.playBubblePop();

        const botWinStatus = checkWinner(newBoard);
        if (botWinStatus) {
          handleEnd(botWinStatus);
        } else {
          setBotCommentary(botComments[Math.floor(Math.random() * botComments.length)]);
          setIsUserTurn(true);
        }
      }
    }, 550);
  };

  // Smart AI for Bot
  const getBotMove = (currentBoard: Array<string | null>): number | null => {
    // 1. Can bot win on this move?
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const copy = [...currentBoard];
        copy[i] = 'O';
        if (checkWinner(copy) === 'O') return i;
      }
    }
    // 2. Can user win? Block them!
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const copy = [...currentBoard];
        copy[i] = 'X';
        if (checkWinner(copy) === 'X') return i;
      }
    }
    // 3. Take center if free
    if (!currentBoard[4]) return 4;
    // 4. Take random available spot
    const emptyIndices = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    if (emptyIndices.length > 0) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
    return null;
  };

  const handleEnd = (status: string) => {
    if (status === 'X') {
      setWinner('user');
      setUserScore(prev => prev + 1);
      sound?.playScore();
      setBotCommentary("🎉 YOU WIN! Okay, I admit, my CPU was daydreaming about chamomile tea. Fantastic strategy!");
    } else if (status === 'O') {
      setWinner('bot');
      setBotScore(prev => prev + 1);
      sound?.playBonk();
      setBotCommentary("🤖 Dr. Saathi takes the round! But hey, you made my transistors work overtime. Rematch?");
    } else {
      setWinner('tie');
      setTies(prev => prev + 1);
      setBotCommentary("🤝 A perfect draw! Like yin and yang, our minds are in absolute equilibrium.");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsUserTurn(true);
    setBotCommentary("New round! May the most relaxed mind win. Go ahead!");
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-lg flex flex-col items-center gap-6 max-w-xl mx-auto">
      
      {/* Header scoreboard */}
      <div className="flex items-center justify-between w-full border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800">You (❌)</span>
            <span className="block text-lg font-black text-emerald-600 leading-none">{userScore}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Draws</span>
          <span className="text-sm font-bold text-gray-600">{ties}</span>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div>
            <span className="text-xs font-bold text-gray-800">Dr. Saathi AI (⭕)</span>
            <span className="block text-lg font-black text-[#3E5FE0] leading-none">{botScore}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#3E5FE0] flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Bot Chat Commentary Bubble */}
      <div className="w-full p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-3 shadow-xs">
        <div className="w-7 h-7 rounded-full bg-[#142E27] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
          🤖
        </div>
        <p className="text-xs sm:text-sm text-[#142E27] font-medium leading-relaxed">
          {botCommentary}
        </p>
      </div>

      {/* 3x3 Tic-Tac-Toe Grid */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-gray-100/80 rounded-2xl border border-gray-200 aspect-square w-72 sm:w-80">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={cell !== null || !isUserTurn || winner !== null}
            className={`rounded-xl font-poppins font-black text-3xl sm:text-4xl flex items-center justify-center transition-all shadow-xs ${
              cell === 'X'
                ? 'bg-emerald-500 text-white'
                : cell === 'O'
                  ? 'bg-[#3E5FE0] text-white'
                  : 'bg-white hover:bg-gray-50 text-transparent hover:text-gray-300'
            } disabled:cursor-not-allowed`}
          >
            {cell || '•'}
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={resetGame}
          className="px-5 py-2.5 bg-[#142E27] hover:bg-[#142E27]/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Board
        </button>
      </div>

    </div>
  );
}

// ========================================================
// GAME 3: BOT VS USER: RETRO MIND PONG
// ========================================================
function MindPongGame({ sound }: { sound: ArcadeSound | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [pongCommentary, setPongCommentary] = useState("Move your mouse or finger up & down to control the green paddle! First to 5 wins!");

  const pongState = useRef({
    playerY: 150,
    botY: 150,
    paddleH: 70,
    paddleW: 10,
    ballX: 250,
    ballY: 175,
    ballSpeedX: 4,
    ballSpeedY: 2.5,
    ballRadius: 7,
    playerScore: 0,
    botScore: 0,
    active: false
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const scaledY = (mouseY / rect.height) * canvas.height;
    pongState.current.playerY = Math.max(10, Math.min(canvas.height - pongState.current.paddleH - 10, scaledY - pongState.current.paddleH / 2));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    const scaledY = (touchY / rect.height) * canvas.height;
    pongState.current.playerY = Math.max(10, Math.min(canvas.height - pongState.current.paddleH - 10, scaledY - pongState.current.paddleH / 2));
  };

  const startMatch = () => {
    pongState.current.playerScore = 0;
    pongState.current.botScore = 0;
    pongState.current.ballX = 250;
    pongState.current.ballY = 175;
    pongState.current.ballSpeedX = 4.5;
    pongState.current.ballSpeedY = 2.5;
    pongState.current.active = true;
    setPlayerScore(0);
    setBotScore(0);
    setIsPlaying(true);
    setPongCommentary("Match started! Keep your eye on the ball!");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const p = pongState.current;

      // 1. Clear Dark Arcade Court
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center court dotted net
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      if (p.active) {
        // Move Ball
        p.ballX += p.ballSpeedX;
        p.ballY += p.ballSpeedY;

        // Top/Bottom wall bounce
        if (p.ballY - p.ballRadius < 0 || p.ballY + p.ballRadius > canvas.height) {
          p.ballSpeedY *= -1;
          sound?.playBubblePop();
        }

        // Bot AI paddle tracking with slight realistic delay
        const botCenter = p.botY + p.paddleH / 2;
        if (botCenter < p.ballY - 12) {
          p.botY += 3.4;
        } else if (botCenter > p.ballY + 12) {
          p.botY -= 3.4;
        }
        p.botY = Math.max(10, Math.min(canvas.height - p.paddleH - 10, p.botY));

        // Player paddle collision (Left side)
        if (
          p.ballX - p.ballRadius <= 25 + p.paddleW &&
          p.ballX + p.ballRadius >= 25 &&
          p.ballY >= p.playerY &&
          p.ballY <= p.playerY + p.paddleH
        ) {
          p.ballSpeedX = Math.abs(p.ballSpeedX) * 1.05; // slight speedup
          const deltaY = p.ballY - (p.playerY + p.paddleH / 2);
          p.ballSpeedY = deltaY * 0.16;
          sound?.playFlap();
        }

        // Bot paddle collision (Right side)
        if (
          p.ballX + p.ballRadius >= canvas.width - 25 - p.paddleW &&
          p.ballX - p.ballRadius <= canvas.width - 25 &&
          p.ballY >= p.botY &&
          p.ballY <= p.botY + p.paddleH
        ) {
          p.ballSpeedX = -Math.abs(p.ballSpeedX) * 1.05;
          const deltaY = p.ballY - (p.botY + p.paddleH / 2);
          p.ballSpeedY = deltaY * 0.16;
          sound?.playFlap();
        }

        // Player Scores!
        if (p.ballX > canvas.width + 10) {
          p.playerScore += 1;
          setPlayerScore(p.playerScore);
          sound?.playScore();
          resetBall(-1);
          setPongCommentary("Great shot! You slipped it right past Dr. Saathi!");

          if (p.playerScore >= 5) {
            p.active = false;
            setIsPlaying(false);
            setPongCommentary("🏆 CHAMPION! You beat Dr. Saathi 5 points! Autonomic reflexes are sharp today!");
          }
        }

        // Bot Scores!
        if (p.ballX < -10) {
          p.botScore += 1;
          setBotScore(p.botScore);
          sound?.playBonk();
          resetBall(1);
          setPongCommentary("Ooh, tricky spin by the bot! You can get this next point!");

          if (p.botScore >= 5) {
            p.active = false;
            setIsPlaying(false);
            setPongCommentary("🤖 Dr. Saathi wins this match 5 points! But that was an intense rally!");
          }
        }
      }

      function resetBall(direction: number) {
        if (!canvas) return;
        p.ballX = canvas.width / 2;
        p.ballY = canvas.height / 2;
        p.ballSpeedX = 4.2 * direction;
        p.ballSpeedY = (Math.random() * 4 - 2);
      }

      // 2. Draw Left Player Paddle (Emerald Green)
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.fillRect(25, p.playerY, p.paddleW, p.paddleH);

      // 3. Draw Right Bot Paddle (Indigo Blue)
      ctx.fillStyle = '#3E5FE0';
      ctx.shadowColor = '#3E5FE0';
      ctx.shadowBlur = 8;
      ctx.fillRect(canvas.width - 25 - p.paddleW, p.botY, p.paddleW, p.paddleH);
      ctx.shadowBlur = 0;

      // 4. Draw Ball (Bright Golden Glow)
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(p.ballX, p.ballY, p.ballRadius, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-lg flex flex-col items-center gap-5 max-w-xl mx-auto">
      
      {/* Score Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-gray-700">You: {playerScore}</span>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-500 uppercase">
          Target: 5 Points
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">Dr. Saathi Bot: {botScore}</span>
          <span className="w-3 h-3 rounded-full bg-[#3E5FE0]" />
        </div>
      </div>

      {/* Commentary */}
      <div className="text-xs text-[#142E27] font-semibold bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center w-full">
        {pongCommentary}
      </div>

      {/* Pong Canvas */}
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl select-none">
        <canvas
          ref={canvasRef}
          width={520}
          height={320}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="w-full h-full object-cover cursor-none"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white text-center p-6">
            <span className="text-3xl">🏓</span>
            <h4 className="font-poppins font-bold text-lg">Retro Mind Pong</h4>
            <p className="text-xs text-slate-300 max-w-xs">
              Guide the paddle to outsmart the AI bot. Quick reactions take your mind completely off stress!
            </p>
            <button
              type="button"
              onClick={startMatch}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg mt-1 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start Pong Match
            </button>
          </div>
        )}
      </div>

      <span className="text-[11px] text-gray-400 font-medium">
        Tip: Move your cursor vertically inside the court box to aim your paddle.
      </span>
    </div>
  );
}

// ========================================================
// GAME 4: WHACK-A-STRESS (SMASH OVERTHINKING)
// ========================================================
function WhackAStressGame({ sound }: { sound: ArcadeSound | null }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [whackedId, setWhackedId] = useState<number | null>(null);
  const [monsterLabel, setMonsterLabel] = useState('Overthinking');

  const monsters = [
    'Overthinking',
    'Exam Panic',
    'Imposter Syndrome',
    'Insomnia',
    'Deadlines',
    'Burnout',
    'Self-Doubt',
    'Unread Emails'
  ];

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    sound?.playScore();
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      setIsPlaying(false);
      sound?.playLaughChime();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Monster pop controller
  useEffect(() => {
    if (!isPlaying) {
      setActiveHole(null);
      return;
    }

    const interval = setInterval(() => {
      const randomHole = Math.floor(Math.random() * 9);
      const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
      setActiveHole(randomHole);
      setMonsterLabel(randomMonster);
      setWhackedId(null);
    }, 900);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const whackHole = (idx: number) => {
    if (idx === activeHole && !whackedId) {
      setWhackedId(idx);
      setScore(prev => prev + 100);
      sound?.playWhack();
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-lg flex flex-col items-center gap-6 max-w-xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="font-poppins font-bold text-base text-gray-800 flex items-center gap-2">
            <span className="text-xl">🔨</span> Whack-A-Stress
          </h3>
          <span className="text-xs text-gray-400 font-medium">Smash away intrusive thoughts before they hide!</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Time Left</span>
            <span className="block text-lg font-black text-amber-600">{timeLeft}s</span>
          </div>
          <div className="text-right border-l border-gray-100 pl-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Zen Points</span>
            <span className="block text-lg font-black text-emerald-600">{score}</span>
          </div>
        </div>
      </div>

      {/* 3x3 Burrows Grid */}
      <div className="grid grid-cols-3 gap-4 w-full p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/60">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => {
          const isCurrent = activeHole === idx;
          const isHit = whackedId === idx;

          return (
            <div
              key={idx}
              onClick={() => isCurrent && whackHole(idx)}
              className="aspect-square bg-white rounded-2xl border-2 border-emerald-200/70 shadow-sm flex flex-col items-center justify-center relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
            >
              {/* Hole ground */}
              <div className="absolute bottom-2 w-16 h-4 bg-gray-200 rounded-full opacity-60" />

              {/* Monster */}
              {isCurrent && (
                <div className={`flex flex-col items-center gap-1 transition-all duration-150 ${isHit ? 'scale-75 opacity-40' : 'scale-100 animate-bounce'}`}>
                  <span className="text-3xl sm:text-4xl">
                    {isHit ? '💥' : '👹'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-center max-w-[85px] truncate ${
                    isHit ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-700'
                  }`}>
                    {isHit ? '+100 Zen!' : monsterLabel}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls / Final Message */}
      {!isPlaying ? (
        <button
          type="button"
          onClick={startGame}
          className="px-6 py-2.5 bg-[#142E27] hover:bg-[#142E27]/90 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> {score > 0 ? 'Play Another Round' : 'Start Whacking'}
        </button>
      ) : (
        <span className="text-xs font-semibold text-emerald-700 animate-pulse">
          🎯 Keep clicking the pop-ups to smash stress!
        </span>
      )}

      {score > 0 && !isPlaying && (
        <div className="text-xs text-center text-emerald-800 bg-emerald-100/70 px-4 py-2 rounded-xl font-medium">
          🌟 You banished <b>{score / 100}</b> intrusive stressors! Cortisol reduced by 85%!
        </div>
      )}

    </div>
  );
}

// ========================================================
// GAME 5: ZEN BUBBLE WRAP POPPER
// ========================================================
function ZenBubbleWrap({ sound }: { sound: ArcadeSound | null }) {
  const [poppedState, setPoppedState] = useState<boolean[]>(Array(48).fill(false));
  const poppedCount = poppedState.filter(Boolean).length;

  const handlePop = (index: number) => {
    if (poppedState[index]) return;
    const next = [...poppedState];
    next[index] = true;
    setPoppedState(next);
    sound?.playBubblePop();
  };

  const resetWrap = () => {
    setPoppedState(Array(48).fill(false));
    sound?.playScore();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-lg flex flex-col items-center gap-5 max-w-xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between w-full border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-poppins font-bold text-base text-gray-800 flex items-center gap-2">
            <span className="text-xl">🫧</span> Tactile Zen Bubble Wrap
          </h3>
          <span className="text-xs text-gray-400 font-medium">Satisfying sensory stress-relief pops</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {poppedCount} / 48 Popped
          </span>
          <button
            type="button"
            onClick={resetWrap}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
            title="Unroll fresh sheet"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bubble Wrap Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 p-5 bg-gradient-to-br from-emerald-50/50 to-indigo-50/40 rounded-2xl border border-emerald-100 w-full">
        {poppedState.map((popped, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePop(idx)}
            className={`aspect-square rounded-full transition-all duration-150 relative flex items-center justify-center ${
              popped
                ? 'bg-emerald-200/50 scale-90 shadow-inner border border-emerald-300/40'
                : 'bg-gradient-to-b from-white via-emerald-100 to-emerald-200 shadow-md hover:scale-105 active:scale-95 border border-white'
            }`}
          >
            {/* Glossy light reflection */}
            {!popped && (
              <span className="w-2.5 h-1.5 bg-white/80 rounded-full absolute top-1.5 left-2 transform -rotate-45 pointer-events-none" />
            )}
            {popped && (
              <span className="text-[10px] text-emerald-800/40 font-bold">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between w-full">
        <span className="text-xs text-gray-400 italic">
          Pop with headphones on for maximum sensory satisfaction.
        </span>
        <button
          type="button"
          onClick={resetWrap}
          className="text-xs font-bold text-[#3E5FE0] hover:underline"
        >
          Unroll Fresh Sheet 🔄
        </button>
      </div>

    </div>
  );
}

// ========================================================
// SECTION 6: LAUGHTER THERAPY CORNER (15 ANIMATED JOKES)
// ========================================================
function LaughterTherapyCorner({ sound }: { sound: ArcadeSound | null }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [laughCount, setLaughCount] = useState(12);
  const [showConfetti, setShowConfetti] = useState(false);

  const joke = JOKES_COLLECTION[currentIdx];

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      setLaughCount(prev => prev + 1);
      sound?.playLaughChime();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2400);
    }
  };

  const nextJoke = () => {
    setRevealed(false);
    setCurrentIdx(prev => (prev + 1) % JOKES_COLLECTION.length);
  };

  const randomJoke = () => {
    setRevealed(false);
    let nextI = Math.floor(Math.random() * JOKES_COLLECTION.length);
    if (nextI === currentIdx) nextI = (nextI + 1) % JOKES_COLLECTION.length;
    setCurrentIdx(nextI);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-lg flex flex-col items-center gap-6 max-w-2xl mx-auto relative overflow-hidden">
      
      {/* Animated Emoji Rain upon punchline */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex justify-around items-start overflow-hidden z-20">
          {['😂', '🤣', '✨', '🎈', '😆', '🎉', '👏'].map((emoji, i) => (
            <span 
              key={i} 
              className="text-2xl sm:text-3xl animate-bounce"
              style={{ animationDuration: `${0.8 + (i % 3) * 0.3}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between w-full border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
            😂
          </div>
          <div>
            <h3 className="font-poppins font-bold text-base text-gray-800">Laughter Therapy Lounge</h3>
            <span className="text-xs text-gray-400 font-medium">15 Wholesome jokes to release endorphins</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
            <Laugh className="w-3.5 h-3.5" /> {laughCount} Giggles Logged
          </span>
          <span className="text-xs font-mono font-bold text-gray-400">
            {currentIdx + 1} / {JOKES_COLLECTION.length}
          </span>
        </div>
      </div>

      {/* Joke Card */}
      <div className="w-full bg-gradient-to-br from-[#F2F8F5] via-white to-amber-50/40 p-6 sm:p-8 rounded-2xl border-2 border-[#8FCBB0]/40 shadow-sm flex flex-col gap-5 min-h-[220px] justify-between text-center relative">
        
        {/* Setup */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl">{joke.emoji}</span>
          <h4 className="font-poppins font-bold text-base sm:text-lg text-gray-900 leading-relaxed max-w-lg">
            "{joke.setup}"
          </h4>
        </div>

        {/* Punchline or Reveal Button */}
        <div className="w-full flex flex-col items-center">
          {revealed ? (
            <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm w-full max-w-lg animate-fadeIn">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">
                The Punchline
              </span>
              <p className="font-poppins font-bold text-base sm:text-lg text-[#142E27] leading-relaxed">
                {joke.punchline}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleReveal}
              className="px-6 py-3 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 group hover:scale-105"
            >
              <span>Reveal Punchline</span>
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            </button>
          )}
        </div>

      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-3 w-full justify-between flex-wrap">
        <button
          type="button"
          onClick={randomJoke}
          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Shuffle className="w-3.5 h-3.5 text-[#3E5FE0]" /> Random Chuckle
        </button>

        <button
          type="button"
          onClick={nextJoke}
          className="px-5 py-2.5 bg-[#142E27] hover:bg-[#142E27]/90 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <span>Next Joke</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
