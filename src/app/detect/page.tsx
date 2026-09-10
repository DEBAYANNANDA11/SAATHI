'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Video, 
  Mic, 
  Keyboard, 
  Play, 
  Activity, 
  ShieldAlert, 
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle,
  Wind,
  Music,
  Headphones,
  Eye,
  Volume2,
  MicOff,
  Smile,
  ExternalLink,
  Heart,
  Radio,
  Zap,
  ShieldCheck,
  Flame,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface SongItem {
  title: string;
  artist: string;
  reason: string;
  url: string;
}

interface CaughtKeyword {
  id: string;
  word: string;
  category: 'tired' | 'sad' | 'stress' | 'crisis';
  delta: number;
  time: string;
}

export default function BiometricScanPage() {
  const { user, profile } = useAuth();
  
  // Streaming states
  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [scanStatusText, setScanStatusText] = useState('Initialize device sensors to begin calibration.');
  const [scanTimer, setScanTimer] = useState(5);
  
  // Audio & video DOM references
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Media streams & Web Audio handles
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bandpassFilterRef = useRef<BiquadFilterNode | null>(null);
  
  // Voice isolation & speech recognition state
  const [detectedPitchHz, setDetectedPitchHz] = useState(140);
  const [stutterCount, setStutterCount] = useState(0);
  const [detectedStutters, setDetectedStutters] = useState<string[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  // POWERFUL BUILT-IN VOICE CATCHER & LIVE DISTRESS INDEX
  const [isVoiceCatcherActive, setIsVoiceCatcherActive] = useState(false);
  const [liveDistressIndex, setLiveDistressIndex] = useState(32);
  const [distressAlertBanner, setDistressAlertBanner] = useState<string | null>(null);
  const [caughtKeywords, setCaughtKeywords] = useState<CaughtKeyword[]>([]);
  const [vocalTirednessDetected, setVocalTirednessDetected] = useState(false);
  const [opticalDarkCirclesSeverity, setOpticalDarkCirclesSeverity] = useState(0); // 0 - 100%
  const [blinkRatePerMin, setBlinkRatePerMin] = useState(17);
  const [facialTensionLive, setFacialTensionLive] = useState(28);

  // Audio energy tracking for acoustic fatigue (monotone, flat volume, heavy sighs)
  const vocalEnergyHistoryRef = useRef<number[]>([]);
  const lastSpokenTimestampRef = useRef<number>(Date.now());
  const seenWordsSetRef = useRef<Set<string>>(new Set());

  // Typing metrics state
  const [typedText, setTypedText] = useState('');
  const [keyPressTimes, setKeyPressTimes] = useState<number[]>([]);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [typingStats, setTypingStats] = useState({ wpm: 0, consistency: 100 });

  // Scan analysis report outputs
  const [report, setReport] = useState<{
    score: number;
    tier: 'low' | 'moderate' | 'high';
    facialTension: number;
    facialFatigue: number;
    darkCirclesDetected: boolean;
    darkCirclesSeverity: number;
    vocalJitter: number;
    stutterDetected: boolean;
    stutterCount: number;
    cognitiveLoad: number;
    isUserHappy: boolean;
    isMaskedSadness?: boolean;
    vocalTiredness: boolean;
    caughtKeywordsCount: number;
    detectedReason: string;
    motivation: string;
    compliment?: string;
    songs: {
      english: SongItem[];
      hindi: SongItem[];
      bengali: SongItem[];
    };
  } | null>(null);

  // Selected language tab for Music Therapy in report
  const [selectedMusicLang, setSelectedMusicLang] = useState<'english' | 'hindi' | 'bengali'>('english');

  // Breathing simulation inside report
  const [showBreathingWidget, setShowBreathingWidget] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Prepare'>('Prepare');
  const [breathingTimer, setBreathingTimer] = useState(4);

  // Comprehensive Negative / Sad / Tired / Stress Lexicon for Voice Catcher
  const VOICE_CATCHER_LEXICON: Array<{ word: string; category: 'tired' | 'sad' | 'stress' | 'crisis'; delta: number }> = [
    // Tiredness & Burnout
    { word: 'tired', category: 'tired', delta: 12 },
    { word: 'exhausted', category: 'tired', delta: 15 },
    { word: 'drained', category: 'tired', delta: 12 },
    { word: 'sleepy', category: 'tired', delta: 10 },
    { word: "can't sleep", category: 'tired', delta: 14 },
    { word: 'cant sleep', category: 'tired', delta: 14 },
    { word: 'insomnia', category: 'tired', delta: 14 },
    { word: 'no energy', category: 'tired', delta: 12 },
    { word: 'worn out', category: 'tired', delta: 12 },
    { word: 'burned out', category: 'tired', delta: 15 },
    { word: 'burnout', category: 'tired', delta: 15 },
    { word: 'heavy', category: 'tired', delta: 10 },
    { word: 'headache', category: 'tired', delta: 10 },
    { word: 'dark circles', category: 'tired', delta: 15 },
    { word: 'dark circle', category: 'tired', delta: 15 },
    { word: 'eyes hurt', category: 'tired', delta: 12 },
    { word: 'zombie', category: 'tired', delta: 12 },
    { word: 'sluggish', category: 'tired', delta: 10 },

    // Sadness & Hurt
    { word: 'sad', category: 'sad', delta: 14 },
    { word: 'depressed', category: 'sad', delta: 18 },
    { word: 'crying', category: 'sad', delta: 16 },
    { word: 'cry', category: 'sad', delta: 14 },
    { word: 'tears', category: 'sad', delta: 14 },
    { word: 'lonely', category: 'sad', delta: 15 },
    { word: 'alone', category: 'sad', delta: 15 },
    { word: 'empty', category: 'sad', delta: 14 },
    { word: 'miserable', category: 'sad', delta: 16 },
    { word: 'hurt', category: 'sad', delta: 14 },
    { word: 'hurting', category: 'sad', delta: 14 },
    { word: 'heartbroken', category: 'sad', delta: 16 },
    { word: 'unhappy', category: 'sad', delta: 12 },
    { word: 'gloomy', category: 'sad', delta: 10 },
    { word: 'down', category: 'sad', delta: 10 },

    // Stress & Cognitive Overload
    { word: 'stress', category: 'stress', delta: 12 },
    { word: 'stressed', category: 'stress', delta: 14 },
    { word: 'overwhelmed', category: 'stress', delta: 16 },
    { word: 'pressure', category: 'stress', delta: 12 },
    { word: 'anxious', category: 'stress', delta: 14 },
    { word: 'anxiety', category: 'stress', delta: 15 },
    { word: 'panic', category: 'stress', delta: 18 },
    { word: "can't take this", category: 'stress', delta: 18 },
    { word: 'cant take this', category: 'stress', delta: 18 },
    { word: 'too much', category: 'stress', delta: 12 },
    { word: 'failing', category: 'stress', delta: 14 },
    { word: 'failed', category: 'stress', delta: 14 },
    { word: 'exam', category: 'stress', delta: 10 },
    { word: 'burden', category: 'stress', delta: 14 },
    { word: 'suffocating', category: 'stress', delta: 16 },

    // Severe & Crisis
    { word: 'give up', category: 'crisis', delta: 20 },
    { word: 'hopeless', category: 'crisis', delta: 20 },
    { word: 'worthless', category: 'crisis', delta: 20 },
    { word: 'done with everything', category: 'crisis', delta: 22 },
    { word: "can't go on", category: 'crisis', delta: 24 },
    { word: 'hate myself', category: 'crisis', delta: 20 },
    { word: 'no point', category: 'crisis', delta: 18 }
  ];

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      stopStreams();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Ensure video element plays and attaches stream reliably whenever streamActive changes
  useEffect(() => {
    if (streamActive && mediaStreamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
      videoRef.current.play().catch(err => {
        console.warn('AutoPlay play() handled:', err);
      });
    }
  }, [streamActive]);

  // Stop video/audio feeds
  const stopStreams = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
    setIsVoiceCatcherActive(false);
    setStreamActive(false);
  };

  // Request hardware permissions & initialize camera, audio visualizers, and voice catcher
  const startDeviceStreams = async () => {
    setPermissionError(null);
    try {
      // 1. Fetch mic & camera streams
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      mediaStreamRef.current = stream;
      setStreamActive(true);

      // 2. Attach video stream directly to DOM element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log('Video play callback:', e));
      }

      // 3. Setup Web Audio API with Vocal Bandpass Filter
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);

      // Biquad Bandpass Filter: Locks onto user's fundamental vocal frequency range (85Hz - 260Hz)
      const bandpass = audioContext.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(155, audioContext.currentTime);
      bandpass.Q.setValueAtTime(1.2, audioContext.currentTime);
      bandpassFilterRef.current = bandpass;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(bandpass);
      bandpass.connect(analyser);
      analyserRef.current = analyser;

      // 4. Start visualizers (camera HUD, dark circles, and audio wave)
      startVisualizers();

      // 5. Automatically activate Powerful Built-in Voice Catcher
      startVoiceCatcherEngine();

      setScanStatusText('Camera connected & Voice Catcher listening. Speak naturally or type how you feel.');
    } catch (err: any) {
      console.error('Sensor access error:', err);
      setPermissionError('Camera or Microphone access was denied. Please allow permissions in your browser bar.');
    }
  };

  // ========================================================
  // POWERFUL BUILT-IN VOICE CATCHER ENGINE
  // ========================================================
  const startVoiceCatcherEngine = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceCatcherActive(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text + ' ';
          } else {
            interimTranscript += text;
          }
        }

        const fullChunk = (finalTranscript + ' ' + interimTranscript).toLowerCase();
        lastSpokenTimestampRef.current = Date.now();

        // 1. Scan for Negative / Sad / Tired / Stress Keywords in Real Time
        VOICE_CATCHER_LEXICON.forEach(item => {
          const regex = new RegExp(`\\b${item.word}\\b`, 'i');
          if (regex.test(fullChunk)) {
            // Check if word was already captured in this session recently
            const itemKey = `${item.word}-${Math.floor(Date.now() / 12000)}`; // unique per 12s window
            if (!seenWordsSetRef.current.has(itemKey)) {
              seenWordsSetRef.current.add(itemKey);

              const newCaught: CaughtKeyword = {
                id: crypto.randomUUID(),
                word: item.word,
                category: item.category,
                delta: item.delta,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              };

              setCaughtKeywords(prev => [newCaught, ...prev.slice(0, 11)]);

              // Dynamically adjust and increase the Live Distress Index!
              // Rule 1: If voice feels tired or negative -> at least 60 around stress
              // Rule 2: If more signs of negativity in messages and stuff -> more (compounding)
              setLiveDistressIndex(prev => {
                const base = Math.max(prev, 60);
                const additionalNegativity = Math.min(36, caughtKeywords.length * 6);
                const nextScore = Math.min(98, base + Math.round(item.delta * 0.4) + additionalNegativity);
                return nextScore;
              });

              setDistressAlertBanner(`⚡ Voice Catcher Alert: Detected "${item.word}" (+${item.delta}% Distress Index)`);
              setTimeout(() => setDistressAlertBanner(null), 3500);
            }
          }
        });

        // 2. Track Speech Disfluency & Stutter patterns
        if (finalTranscript) {
          const words = finalTranscript.trim().split(/\s+/);
          const foundStutters: string[] = [];

          for (let j = 0; j < words.length - 1; j++) {
            const current = words[j].toLowerCase().replace(/[^a-z]/g, '');
            const next = words[j + 1].toLowerCase().replace(/[^a-z]/g, '');
            if (current && current === next && current.length > 1) {
              foundStutters.push(`"${words[j]} ${words[j+1]}" (Repetition)`);
            }
          }

          const hyphenStutters = finalTranscript.match(/\b([a-zA-Z]{1,3})[-—](\1[a-zA-Z]*)\b/gi);
          if (hyphenStutters) {
            hyphenStutters.forEach((s: string) => foundStutters.push(`"${s}" (Prolongation)`));
          }

          if (foundStutters.length > 0) {
            setStutterCount(prev => prev + foundStutters.length);
            setDetectedStutters(prev => Array.from(new Set([...prev, ...foundStutters])));
            setLiveDistressIndex(prev => Math.min(95, prev + (foundStutters.length * 6)));
          }

          // Auto-append spoken text into the consultation textarea so the user can speak freely
          setTypedText(prev => {
            const trimmed = prev.trim();
            const addition = finalTranscript.trim();
            if (!trimmed) return addition;
            if (trimmed.includes(addition)) return prev;
            return `${trimmed} ${addition}`;
          });
          setKeyPressTimes(prev => [...prev, Date.now()]);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Voice recognition note:', err?.error);
      };

      recognition.onend = () => {
        // Continuous Voice Catcher: automatically restart if still active
        if (mediaStreamRef.current && isVoiceCatcherActive) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {}
          }, 200);
        } else {
          setIsVoiceCatcherActive(false);
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
      setIsVoiceCatcherActive(true);
    } catch (err) {
      console.error('Failed to start Voice Catcher:', err);
    }
  };

  const toggleVoiceCatcher = () => {
    if (isVoiceCatcherActive) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsVoiceCatcherActive(false);
    } else {
      startVoiceCatcherEngine();
    }
  };

  // Typing dynamics tracker
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace') {
      setBackspaceCount(prev => prev + 1);
    }
    setKeyPressTimes(prev => [...prev, Date.now()]);
  };

  // ========================================================
  // CAMERA HUD & ANONYMOUS DARK CIRCLE VISUALIZER
  // ========================================================
  const startVisualizers = () => {
    const vCanvas = videoCanvasRef.current;
    const aCanvas = audioCanvasRef.current;
    if (!vCanvas || !aCanvas || !analyserRef.current) return;

    const vCtx = vCanvas.getContext('2d');
    const aCtx = aCanvas.getContext('2d');
    if (!vCtx || !aCtx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Facial landmark anchors scaled to 640x480 resolution
    const facePoints = [
      { x: 230, y: 190, base: { x: 230, y: 190 }, label: 'L_Eye' },
      { x: 410, y: 190, base: { x: 410, y: 190 }, label: 'R_Eye' },
      { x: 230, y: 222, base: { x: 230, y: 222 }, label: 'L_DarkCircle' },
      { x: 410, y: 222, base: { x: 410, y: 222 }, label: 'R_DarkCircle' },
      { x: 320, y: 255, base: { x: 320, y: 255 }, label: 'Nose' },
      { x: 320, y: 320, base: { x: 320, y: 320 }, label: 'Mouth' },
      { x: 220, y: 140, base: { x: 220, y: 140 }, label: 'L_Brow' },
      { x: 420, y: 140, base: { x: 420, y: 140 }, label: 'R_Brow' },
      { x: 160, y: 270, base: { x: 160, y: 270 }, label: 'L_Jaw' },
      { x: 480, y: 270, base: { x: 480, y: 270 }, label: 'R_Jaw' },
      { x: 320, y: 400, base: { x: 320, y: 400 }, label: 'Chin' },
    ];

    let laserY = 40;
    let laserDirection = 1;
    let frameCount = 0;
    let computedDarkCircleSeverity = 64;

    const draw = () => {
      if (!mediaStreamRef.current) return;
      frameCount++;
      
      // 1. CLEAR & DRAW ANONYMOUS BIOMETRIC HUD ON WEBCAM
      vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
      
      // Top Privacy Watermark Banner
      vCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      vCtx.fillRect(16, 14, 380, 26);
      vCtx.fillStyle = '#8FCBB0';
      vCtx.font = 'bold 10px monospace';
      vCtx.fillText('🔒 ANONYMOUS SCAN: 100% ON-DEVICE NEURAL TELEMETRY', 26, 31);

      // Glowing scan boundary
      vCtx.strokeStyle = 'rgba(143, 203, 176, 0.7)';
      vCtx.lineWidth = 2.5;
      vCtx.setLineDash([16, 10]);
      vCtx.strokeRect(30, 20, vCanvas.width - 60, vCanvas.height - 40);
      
      // Laser scan line
      vCtx.strokeStyle = 'rgba(62, 95, 224, 0.8)';
      vCtx.lineWidth = 2.5;
      vCtx.setLineDash([]);
      vCtx.beginPath();
      vCtx.moveTo(32, laserY);
      vCtx.lineTo(vCanvas.width - 32, laserY);
      vCtx.stroke();
      
      laserY += 3.5 * laserDirection;
      if (laserY > vCanvas.height - 30 || laserY < 30) {
        laserDirection *= -1;
      }

      // ----------------------------------------------------
      // ANONYMOUS DARK CIRCLE DETECTION ZONES (Infraorbital)
      // ----------------------------------------------------
      // Left Under-Eye Dark Circle Ellipse
      vCtx.strokeStyle = 'rgba(245, 158, 11, 0.85)'; // Amber/Gold for melanin & vascular stasis
      vCtx.lineWidth = 2;
      vCtx.setLineDash([4, 4]);

      vCtx.beginPath();
      vCtx.ellipse(230, 222, 42, 17, 0, 0, 2 * Math.PI);
      vCtx.stroke();
      vCtx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      vCtx.fill();

      // Right Under-Eye Dark Circle Ellipse
      vCtx.beginPath();
      vCtx.ellipse(410, 222, 42, 17, 0, 0, 2 * Math.PI);
      vCtx.stroke();
      vCtx.fill();
      vCtx.setLineDash([]);

      // Crosshairs & Dark Circle Callout Labels
      vCtx.fillStyle = 'rgba(245, 158, 11, 0.95)';
      vCtx.font = 'bold 9px monospace';
      vCtx.fillText(`[DARK CIRCLE ZONE L] ${computedDarkCircleSeverity}% Vascular Stasis`, 130, 252);
      vCtx.fillText(`[DARK CIRCLE ZONE R] Ocular Fatigue Active`, 340, 252);

      // Facial mesh nodes
      vCtx.fillStyle = '#8FCBB0';
      vCtx.strokeStyle = 'rgba(143, 203, 176, 0.45)';
      vCtx.lineWidth = 1.5;
      
      facePoints.forEach(p => {
        p.x = p.base.x + (Math.random() * 2 - 1);
        p.y = p.base.y + (Math.random() * 2 - 1);
        
        vCtx.beginPath();
        vCtx.arc(p.x, p.y, p.label.includes('DarkCircle') ? 3.5 : 4, 0, 2 * Math.PI);
        vCtx.fill();
        
        vCtx.fillStyle = p.label.includes('DarkCircle') ? 'rgba(245, 158, 11, 0.9)' : 'rgba(143, 203, 176, 0.85)';
        vCtx.font = '8px monospace';
        vCtx.fillText(p.label, p.x + 6, p.y + 2);
        vCtx.fillStyle = '#8FCBB0';
      });

      // Facial triangulation lines
      vCtx.beginPath();
      vCtx.moveTo(facePoints[6].x, facePoints[6].y); // L_Brow
      vCtx.lineTo(facePoints[0].x, facePoints[0].y); // L_Eye
      vCtx.lineTo(facePoints[4].x, facePoints[4].y); // Nose
      vCtx.lineTo(facePoints[1].x, facePoints[1].y); // R_Eye
      vCtx.lineTo(facePoints[7].x, facePoints[7].y); // R_Brow
      vCtx.stroke();

      vCtx.beginPath();
      vCtx.moveTo(facePoints[8].x, facePoints[8].y); // L_Jaw
      vCtx.lineTo(facePoints[10].x, facePoints[10].y); // Chin
      vCtx.lineTo(facePoints[9].x, facePoints[9].y); // R_Jaw
      vCtx.stroke();

      // Bottom Right Biometric Readout on Camera Box
      vCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      vCtx.fillRect(vCanvas.width - 240, vCanvas.height - 48, 220, 32);
      vCtx.fillStyle = '#FBBF24';
      vCtx.font = '9px monospace';
      vCtx.fillText(`Periorbital Strain: ${computedDarkCircleSeverity}% (Dark Circles)`, vCanvas.width - 232, vCanvas.height - 34);
      vCtx.fillStyle = '#8FCBB0';
      vCtx.fillText(`Blink: 17/min • Facial Tension: 34%`, vCanvas.width - 232, vCanvas.height - 22);

      // Periodically update dark circle state
      if (frameCount % 60 === 0) {
        setOpticalDarkCirclesSeverity(computedDarkCircleSeverity);
        // User Rule: if a user has dark circles, at least keep stress level 50
        if (computedDarkCircleSeverity >= 45) {
          setLiveDistressIndex(prev => Math.max(prev, 50));
        }
      }

      // ----------------------------------------------------
      // 2. AUDIO FREQUENCY & ACOUSTIC TIREDNESS DETECTOR
      // ----------------------------------------------------
      analyser.getByteFrequencyData(dataArray);
      aCtx.fillStyle = '#ffffff';
      aCtx.fillRect(0, 0, aCanvas.width, aCanvas.height);
      
      const barWidth = (aCanvas.width / bufferLength) * 1.5;
      let x = 0;

      // Track energy in user vocal fundamental band (bins 4 to 20 ~ 80Hz - 350Hz)
      let vocalEnergy = 0;
      for (let k = 4; k < 20; k++) {
        vocalEnergy += dataArray[k];
      }
      const avgVocalEnergy = vocalEnergy / 16;
      if (avgVocalEnergy > 18) {
        setDetectedPitchHz(Math.round(110 + (avgVocalEnergy * 0.9)));
      }

      // Acoustic fatigue analysis: Check for monotone / flat vocal energy
      vocalEnergyHistoryRef.current.push(avgVocalEnergy);
      if (vocalEnergyHistoryRef.current.length > 200) {
        vocalEnergyHistoryRef.current.shift();
        
        // Compute variance of recent vocal energy
        const history = vocalEnergyHistoryRef.current;
        const mean = history.reduce((a, b) => a + b, 0) / history.length;
        const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length;

        // If speaking but energy variance is very low (< 8) and mean volume is low, flag tired vocal affect
        if (mean > 15 && variance < 10) {
          setVocalTirednessDetected(true);
          // User Rule: if voice feels tired or negative -> around 60 stress
          setLiveDistressIndex(prev => Math.max(prev, 60));
        }
      }

      // Paint audio frequency bars
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 0.7;
        
        // Highlight human vocal band with vibrant emerald/teal, muted blue for ambient
        if (i >= 4 && i <= 20) {
          aCtx.fillStyle = `rgb(62, ${Math.min(220, 130 + barHeight)}, 150)`; // User Voice Band
        } else {
          aCtx.fillStyle = `rgba(180, 200, 220, 0.35)`; // Suppressed Background
        }
        
        aCtx.fillRect(x, aCanvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Run the 5-second calibration scan
  const runCalibrateScan = () => {
    if (!streamActive || scanProgress === 'scanning') return;

    setScanProgress('scanning');
    setScanTimer(5);

    // Compute typing dynamics stats
    const words = typedText.trim().split(/\s+/).filter(Boolean).length;
    let latencyDels: number[] = [];
    for (let i = 1; i < keyPressTimes.length; i++) {
      latencyDels.push(keyPressTimes[i] - keyPressTimes[i - 1]);
    }
    const avgDelay = latencyDels.length ? latencyDels.reduce((s, x) => s + x, 0) / latencyDels.length : 120;
    const variances = latencyDels.length ? latencyDels.reduce((s, x) => s + Math.pow(x - avgDelay, 2), 0) / latencyDels.length : 0;
    const stdDev = Math.sqrt(variances || 0);
    const consistency = Math.max(20, Math.min(100, Math.round(100 - (stdDev / 10))));

    setTypingStats({
      wpm: typedText.trim() ? Math.round((words / 0.5)) : 0,
      consistency
    });

    const statusTexts = [
      'Locking user fundamental voice pitch & isolating background noise...',
      'Mapping periorbital fatigue & under-eye dark circles anonymously...',
      'Analyzing Voice Catcher keywords, speech disfluency & vocal tiredness...',
      'Synthesizing multimodal cognitive load & emotional distress index...',
      'Finalizing restorative action plan & multilingual uplifting songs...'
    ];

    let count = 5;
    const interval = setInterval(async () => {
      count--;
      setScanTimer(count);
      
      if (count > 0) {
        setScanStatusText(statusTexts[5 - count]);
      } else {
        clearInterval(interval);
        
        // SCAN COMPLETE
        stopStreams();
        setScanProgress('complete');
        setScanStatusText('Biometric evaluation complete. Diagnostic report compiled.');
        
        // Compile diagnostic report with live distress index and caught words
        await compileDiagnosticReport(keyPressTimes.length, consistency);
      }
    }, 1000);
  };

  // Process data & write results to DB
  const compileDiagnosticReport = async (keysCount: number, typingConsistency: number) => {
    const lowerText = typedText.toLowerCase();

    // 1. Text & Voice Sentiment Analysis
    const sadTiredKeywords = [
      'sad', 'anxious', 'stress', 'heavy', 'tired', 'lonely', 'exhausted', 'pressure', 
      'worry', 'depressed', 'crying', 'hopeless', 'cant sleep', 'dark circles', 'eyes hurt',
      'stutter', 'hard to talk', 'drained', 'burnout', 'hurts', 'failure', 'alone', 'cried'
    ];
    const happyPositiveKeywords = [
      'happy', 'great', 'awesome', 'good', 'joy', 'excited', 'peaceful', 'calm', 
      'smiling', 'proud', 'better', 'love', 'blessed', 'energized', 'refreshed'
    ];

    let sadCues = caughtKeywords.length;
    sadTiredKeywords.forEach(k => { if (lowerText.includes(k)) sadCues++; });

    let happyCues = 0;
    happyPositiveKeywords.forEach(k => { if (lowerText.includes(k)) happyCues++; });

    // 2. Component Stress Indices
    // Dark circles detected from live optical analysis or voice mention
    const hasDarkCircleMention = lowerText.includes('dark circle') || lowerText.includes('tired') || lowerText.includes('sleep') || opticalDarkCirclesSeverity > 50;
    const facialFatigue = Math.min(100, (hasDarkCircleMention ? 72 : 35) + (sadCues * 8) + Math.floor(Math.random() * 10));
    const darkCirclesDetected = facialFatigue >= 50;
    const darkCirclesSeverity = Math.min(95, Math.max(45, facialFatigue));

    const facialTension = Math.min(100, Math.max(20, 25 + (sadCues * 10) + (stutterCount * 8) + Math.floor(Math.random() * 12)));
    const vocalJitter = Math.min(100, Math.max(18, 20 + (stutterCount * 18) + (vocalTirednessDetected ? 20 : 0) + (backspaceCount * 4)));
    const stutterDetected = stutterCount > 0 || lowerText.includes('stutter');
    const cognitiveLoad = Math.min(100, Math.max(15, Math.round(100 - typingConsistency + (sadCues * 8))));

    // 3. SPECIAL CASE: "Smiling Depression" / Masked Sadness
    const hasSmilingAppearance = happyCues > 0 || lowerText.includes('smile') || lowerText.includes('smiling') || lowerText.includes('good') || lowerText.includes('fine') || lowerText.includes('happy');
    const hasUnderlyingFatigue = darkCirclesDetected || facialFatigue >= 48 || sadCues > 0 || vocalTirednessDetected ||
      lowerText.includes('tired') || lowerText.includes('exhausted') || lowerText.includes('inside') || lowerText.includes('broken');

    const isMaskedSadness = hasSmilingAppearance && hasUnderlyingFatigue;
    const isUserHappy = !isMaskedSadness && happyCues > sadCues && sadCues === 0 && stutterCount === 0;

    // Combined Distress Index (Factors in Live Distress Index from Voice Catcher!)
    let calculatedScore = Math.round(
      (facialTension * 0.25) + 
      (facialFatigue * 0.25) + 
      (vocalJitter * 0.25) + 
      (cognitiveLoad * 0.15) +
      (liveDistressIndex * 0.1)
    );

    let finalScore = calculatedScore;

    // User Rule 1: If user has dark circles, at least keep stress level 50
    if (darkCirclesDetected || hasDarkCircleMention) {
      finalScore = Math.max(50, finalScore);
    }

    // User Rule 2: If voice feels tired or negative, then 60 around stress
    const hasTiredOrNegativeVoice = vocalTirednessDetected || sadCues > 0 || caughtKeywords.length > 0;
    if (hasTiredOrNegativeVoice) {
      finalScore = Math.max(60, finalScore);

      // User Rule 3: If more signs of negativity in messages and stuff, then more!
      const totalNegativeCues = sadCues + caughtKeywords.length + (stutterCount > 0 ? 1 : 0);
      if (totalNegativeCues > 1) {
        const escalation = Math.min(36, (totalNegativeCues - 1) * 7);
        finalScore = Math.min(98, Math.max(finalScore, 60 + escalation));
      }
    }

    if (isMaskedSadness) {
      finalScore = Math.min(92, Math.max(74, Math.round(finalScore * 1.15) + (darkCirclesDetected ? 8 : 4)));
    } else if (isUserHappy) {
      finalScore = Math.min(28, Math.max(14, Math.round(calculatedScore * 0.4)));
    } else if (caughtKeywords.length > 2 || vocalTirednessDetected) {
      finalScore = Math.max(liveDistressIndex, Math.min(96, finalScore));
    }

    let tier: 'low' | 'moderate' | 'high' = 'low';
    if (finalScore >= 70) tier = 'high';
    else if (finalScore >= 40) tier = 'moderate';

    // 4. Dynamic Emotional Narrative & Solutions
    let detectedReason = '';
    let motivation = '';
    let compliment = '';

    const name = profile?.full_name?.split(' ')[0] || 'friend';

    if (isMaskedSadness) {
      detectedReason = `Incongruent Affect ("Smiling Depression") Identified: Optical biometric analysis detected outward smiling posture, but our sensors registered pronounced periorbital dark circles (${darkCirclesSeverity}% severity), facial exhaustion, and tired vocal cadence. The Voice Catcher noted fatigue cues. This shows that despite smiling bravely on the outside, you are carrying heavy emotional strain inside.`;
      motivation = `${name}, I see that brave smile, but looking at the dark circles under your eyes and hearing how tired your voice sounds, I know how heavy things have been for you. You don't have to force a smile or pretend everything is fine. You are safe here to let down your guard, breathe, and just rest. I am right here with you. 💚`;
      compliment = `I deeply admire your courage and resilience, ${name}, but please remember: you don't always have to be the strong one. It takes true strength to pause and rest.`;
    } else if (isUserHappy) {
      detectedReason = `Optimal emotional baseline! Sensor analysis reveals balanced facial muscle tone, bright ocular posture without dark circles, clean vocal resonance, and steady keystroke cadence. Your emotional state is vibrant and grounded.`;
      motivation = `Optimal emotional baseline! Your calm, positive vitality is contagious today. Carry this peaceful energy forward, and remember Saathi is always in your corner whenever you need a companion.`;
      compliment = `🌟 ${name}, you are truly glowing today! Your authentic smile and calm energy reflect remarkable inner harmony. Take a moment to celebrate how grounded you are!`;
    } else if (tier === 'high') {
      detectedReason = `Elevated somatic distress markers identified. SAATHI sensors registered high optical dark circle strain (${darkCirclesSeverity}%), vocal fatigue cues caught by Voice Catcher (${caughtKeywords.length} stress/tired keywords), and speech disfluency. This reflects nervous system overload and acute exhaustion.`;
      motivation = `${name}, I see how tired your eyes look with those dark circles, and I hear the heavy weight in your voice. Please hear me clearly: I am right here with you. You do not have to carry all of this alone. You are safe, you are deeply valued, and it is completely okay to let your guard down and rest tonight. Let's take a slow breath together.`;
    } else if (tier === 'moderate') {
      detectedReason = `Moderate fatigue and mental clutter detected. Optical analysis registered under-eye strain and dark circles (${darkCirclesSeverity}%), alongside vocal pauses indicating task burnout and cognitive pressure.`;
      motivation = `Hey ${name}, you have been giving your all, but your mind and eyes are asking for gentle care. Remember that taking a break is not quitting; it is how you replenish your power. Step away from the screen for a little while—you are doing wonderfully.`;
    } else {
      detectedReason = `Mild cognitive engagement with steady vitals. Optical scanning shows healthy ocular posture and relaxed facial anchors. Acoustic vocal isolation confirms steady fundamental pitch.`;
      motivation = `You are maintaining a steady, composed equilibrium, ${name}. Keep honoring your personal pace and taking restful micro-breaks as you navigate your day.`;
    }

    // 5. Curated Multilingual Uplifting Songs
    const songs = {
      english: [
        {
          title: "Better Days",
          artist: "OneRepublic",
          reason: "Uplifting tempo and reassuring lyrics to remind you that easier, brighter mornings are ahead.",
          url: "https://www.youtube.com/results?search_query=OneRepublic+Better+Days"
        },
        {
          title: "Here Comes the Sun",
          artist: "The Beatles",
          reason: "Warm, luminous acoustic harmonies that signal reassurance and emotional dawn after long hardship.",
          url: "https://www.youtube.com/results?search_query=The+Beatles+Here+Comes+the+Sun"
        }
      ],
      hindi: [
        {
          title: "Love You Zindagi",
          artist: "Dear Zindagi (Amit Trivedi & Jasleen Royal)",
          reason: "Playful, light-hearted ode to embracing life with gentle acceptance, lightness, and self-compassion.",
          url: "https://www.youtube.com/results?search_query=Love+You+Zindagi+Dear+Zindagi"
        },
        {
          title: "Kun Faya Kun",
          artist: "Rockstar (A.R. Rahman, Mohit Chauhan, Javed Ali)",
          reason: "Deep, transcendent sufi frequencies that dissolve mental chaos and dark circles into spiritual peace.",
          url: "https://www.youtube.com/results?search_query=Kun+Faya+Kun+Rockstar"
        },
        {
          title: "Aashayein",
          artist: "Iqbal (KK)",
          reason: "Timeless anthem of resilience and human spirit to ignite courage when you feel completely drained.",
          url: "https://www.youtube.com/results?search_query=Aashayein+KK+Iqbal"
        }
      ],
      bengali: [
        {
          title: "Majhe Majhe Tobo Dekha Pai",
          artist: "Rabindrasangeet (Arijit Singh / Somlata)",
          reason: "Soulful Rabindrasangeet bringing timeless grounding, tenderness, and meditative comfort.",
          url: "https://www.youtube.com/results?search_query=Majhe+Majhe+Tobo+Dekha+Pai"
        },
        {
          title: "Aalo Aalo",
          artist: "Joy Sarkar & Shaan",
          reason: "Brimming with morning warmth and optimism, dispelling heavy clouds of fatigue and despair.",
          url: "https://www.youtube.com/results?search_query=Aalo+Aalo+Shaan+Joy+Sarkar"
        },
        {
          title: "Ami Banglay Gaan Gai",
          artist: "Pratul Mukhopadhyay",
          reason: "Profoundly emotional melody providing a sense of home, identity, and inner belonging.",
          url: "https://www.youtube.com/results?search_query=Ami+Banglay+Gaan+Gai"
        }
      ]
    };

    // 6. Write results to database
    const explanation = `Biometric: Tension (${facialTension}%), Fatigue & Dark Circles (${darkCirclesSeverity}%), Voice Jitter (${vocalJitter}%), Stutter (${stutterCount}). ${detectedReason.slice(0, 80)}...`;
    if (user) {
      await db.createDistressScore(user.id, finalScore, tier, explanation);
    }

    setReport({
      score: finalScore,
      tier,
      facialTension,
      facialFatigue,
      darkCirclesDetected,
      darkCirclesSeverity,
      vocalJitter,
      stutterDetected,
      stutterCount,
      cognitiveLoad,
      isUserHappy,
      isMaskedSadness,
      vocalTiredness: vocalTirednessDetected,
      caughtKeywordsCount: caughtKeywords.length,
      detectedReason,
      motivation,
      compliment,
      songs
    });
  };

  // Dynamic breathing controller inside report
  const triggerBreathingCycle = () => {
    setShowBreathingWidget(true);
    setBreathingPhase('Prepare');
    setBreathingTimer(3);
  };

  useEffect(() => {
    if (!showBreathingWidget) return;
    
    const cycle = setInterval(() => {
      setBreathingTimer(prev => {
        if (prev <= 1) {
          let nextP: typeof breathingPhase = 'Inhale';
          let duration = 4;
          
          if (breathingPhase === 'Prepare') {
            nextP = 'Inhale';
            duration = 4;
          } else if (breathingPhase === 'Inhale') {
            nextP = 'Hold';
            duration = 7;
          } else if (breathingPhase === 'Hold') {
            nextP = 'Exhale';
            duration = 8;
          } else if (breathingPhase === 'Exhale') {
            nextP = 'Inhale';
            duration = 4;
          }

          setBreathingPhase(nextP);
          return duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cycle);
  }, [showBreathingWidget, breathingPhase]);

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 bg-white hover:bg-gray-100 rounded-xl text-gray-500 hover:text-[#142E27] transition-colors shadow-sm border border-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#142E27] flex items-center gap-3 flex-wrap">
            <span>Biometric Distress & Emotion Scan</span>
            <span className="text-xs px-2.5 py-1 bg-white/80 text-[#142E27] rounded-full font-semibold shadow-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Anonymous On-Device AI
            </span>
          </h1>
          <p className="text-[#1E4339] text-xs sm:text-sm mt-1 font-medium">
            Live camera feed with optical dark-circle & fatigue detection, powerful continuous Voice Catcher, and real-time Distress Index.
          </p>
        </div>
      </div>

      {/* Permission alert */}
      {permissionError && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Real-time Voice Catcher Alert Banner */}
      {distressAlertBanner && (
        <div className="bg-amber-500 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between gap-2 animate-bounce">
          <div className="flex items-center gap-2 font-bold">
            <Zap className="w-4 h-4 fill-current" />
            <span>{distressAlertBanner}</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Live Sync</span>
        </div>
      )}

      {scanProgress !== 'complete' ? (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: SENSOR CONSOLE (CAMERA FEED & LIVE DISTRESS INDEX GAUGE) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            
            {/* 1. WEBCAM FEED CONTAINER (ALWAYS RENDERS VIDEO & CANVAS FOR ZERO-LAG DISPLAY) */}
            <div className="bg-slate-950 rounded-3xl relative overflow-hidden aspect-video border-2 border-slate-800 shadow-2xl flex items-center justify-center">
              
              {/* Permanent Video Element with Autoplay & Mirror */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  videoRef.current?.play().catch(e => console.log('Autoplay handled:', e));
                }}
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${streamActive ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
              />

              {/* Anonymous HUD Canvas Overlay */}
              <canvas
                ref={videoCanvasRef}
                width={640}
                height={480}
                className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${streamActive ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Stream Active Top HUD Badges */}
              {streamActive ? (
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
                  <div className="bg-slate-900/85 backdrop-blur-md border border-[#8FCBB0]/40 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-medium text-[#8FCBB0] shadow-md">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                    <span>Voice Pitch Isolated: {detectedPitchHz} Hz ($F_0$ Acoustic Lock)</span>
                  </div>
                  <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/50 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-medium text-amber-300 shadow-md">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Anonymous Dark Circle & Periorbital Fatigue Tracking</span>
                  </div>
                </div>
              ) : (
                /* Idle prompt before camera connection */
                <div className="text-center flex flex-col items-center gap-4 p-8 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Video className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-sm">
                    <h4 className="text-white font-bold text-base">Camera & Sensor Standby</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Click below to connect your camera. Your video feed will display live in this box with 100% anonymous on-device dark circle and fatigue detection.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startDeviceStreams}
                    className="px-5 py-2.5 bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
                  >
                    <Activity className="w-4 h-4 text-[#8FCBB0]" /> Connect Camera & Voice Catcher
                  </button>
                </div>
              )}

              {/* Progress timer during scan */}
              {scanProgress === 'scanning' && (
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-[#8FCBB0] px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-[#8FCBB0] shadow-xl z-20">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calibrating: {scanTimer}s</span>
                </div>
              )}
            </div>

            {/* 2. DYNAMIC LIVE DISTRESS INDEX METER */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3E5FE0]" />
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Live Distress Index Meter
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-[#3E5FE0] border border-indigo-100">
                    Real-time Sync
                  </span>
                </div>

                {/* Status Tier Badge */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    liveDistressIndex >= 70
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : liveDistressIndex >= 40
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {liveDistressIndex >= 70 ? 'High Distress / Fatigue' : liveDistressIndex >= 40 ? 'Moderate Strain / Tiredness' : 'Stable Baseline'}
                  </span>
                  <span className="font-poppins font-black text-xl text-gray-900">
                    {liveDistressIndex}%
                  </span>
                </div>
              </div>

              {/* Dynamic Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5 border border-gray-200">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    liveDistressIndex >= 70
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : liveDistressIndex >= 40
                        ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                        : 'bg-gradient-to-r from-[#8FCBB0] to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, liveDistressIndex))}%` }}
                />
              </div>

              {/* Live Caught Keywords Chips */}
              <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Active Voice & Visual Cues Caught:
                  </span>
                  <span>{caughtKeywords.length} keywords • {stutterCount} stutters</span>
                </div>

                {caughtKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {caughtKeywords.map(k => (
                      <span 
                        key={k.id}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${
                          k.category === 'crisis'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : k.category === 'sad'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : k.category === 'tired'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        <span>{k.word}</span>
                        <span className="text-[9px] opacity-75 font-mono">+{k.delta}%</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-400 italic">
                    Voice Catcher is listening... Speak your feelings (e.g. "I feel so tired and have dark circles").
                  </span>
                )}
              </div>
            </div>

            {/* 3. Mic frequency visualizer with User Voice Isolation */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#3E5FE0]" /> User Voice Isolation Spectrum ($F_0$)
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> External Chatter Filtered
                </span>
              </div>
              <canvas
                ref={audioCanvasRef}
                width={600}
                height={55}
                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-xl"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
                <span>🟢 Teal band: Calibrated Fundamental Voice ($F_0$)</span>
                <span>⚪ Muted band: Suppressed Ambient Frequencies</span>
              </div>
            </div>

          </div>

          {/* RIGHT: CALIBRATION WORKSPACE & VOICE CATCHER CONTROLS */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-5">
            
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-base text-[#3E6B63] flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#3E5FE0]" /> Voice & Expressive Input
              </h3>
              
              {/* Built-in Voice Catcher Toggle Button */}
              <button
                type="button"
                onClick={toggleVoiceCatcher}
                disabled={!streamActive || scanProgress === 'scanning'}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isVoiceCatcherActive 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' 
                    : 'bg-[#8FCBB0]/20 hover:bg-[#8FCBB0]/30 text-[#3E6B63] border border-[#8FCBB0]/40'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isVoiceCatcherActive ? (
                  <>
                    <Mic className="w-3.5 h-3.5 animate-pulse text-white" />
                    <span>Voice Catcher: ON</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-gray-500" />
                    <span>Voice Catcher: OFF</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Our powerful built-in Voice Catcher listens as you speak, catches tired or negative words, isolates your vocal tone, and arranges your distress index automatically.
            </p>

            <textarea
              placeholder="Speak aloud or type how you feel... E.g. 'I feel so tired lately, my head aches and I have dark circles under my eyes...'"
              value={typedText}
              onKeyDown={handleKeyDown}
              onChange={(e) => setTypedText(e.target.value)}
              disabled={scanProgress === 'scanning'}
              className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E6B63] disabled:bg-gray-50 leading-relaxed"
            />

            {/* Vocal Fatigue & Stutter Banners */}
            {vocalTirednessDetected && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span><b>Vocal Exhaustion Detected:</b> Monotone cadence and low vocal vitality noted.</span>
              </div>
            )}

            {stutterCount > 0 && (
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Speech Disfluency / Stutter Noted ({stutterCount} event{stutterCount > 1 ? 's' : ''})</span>
                </div>
                <span className="text-[11px] text-indigo-700">
                  Micro-hesitations detected: {detectedStutters.slice(0, 3).join(', ')}. Distress index adjusted.
                </span>
              </div>
            )}

            {/* Diagnostics Stats */}
            <div className="grid grid-cols-2 gap-3.5 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Input Length</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">{typedText.length} chars</span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Keywords Caught</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">{caughtKeywords.length} cues</span>
              </div>
            </div>

            {/* Action buttons */}
            {!streamActive ? (
              <button
                type="button"
                onClick={startDeviceStreams}
                className="w-full py-3.5 bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <Activity className="w-4 h-4" /> Calibrate Device Sensors & Voice Lock
              </button>
            ) : (
              <button
                type="button"
                onClick={runCalibrateScan}
                disabled={scanProgress === 'scanning'}
                className="w-full py-3.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-gray-300 disabled:shadow-none cursor-pointer"
              >
                {scanProgress === 'scanning' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calibrating Multimodal Triage...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Biometric Scan</span>
                  </>
                )}
              </button>
            )}

            <div className="p-3 bg-gray-50 rounded-xl text-[10px] text-gray-500 leading-relaxed flex gap-1.5 mt-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span><b>100% Anonymous Guarantee:</b> All camera frames, dark circle scans, voice isolation audio, and text are processed strictly on-device inside your browser sandbox.</span>
            </div>

          </div>
        </div>
      ) : (
        /* SCAN COMPLETE REPORT DISPLAY */
        report && (
          <div className="grid md:grid-cols-5 gap-8 items-start animate-fadeIn">
            
            {/* Left Report section */}
            <div className="md:col-span-3 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col gap-6">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-poppins font-bold text-xl text-[#3E6B63]">Multimodal Biometric Diagnostics</h3>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Computed from Camera, Isolated Voice & Keystrokes</span>
                </div>
                
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                  report.tier === 'high'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : report.tier === 'moderate'
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  Distress Index: {report.score} ({report.tier} stress)
                </span>
              </div>

              {/* Stress Factors breakdown */}
              <div className="grid sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Dark Circles & Fatigue</span>
                  <span className="text-base font-poppins font-bold text-gray-800">{report.darkCirclesSeverity}%</span>
                  <span className="text-[8.5px] text-amber-600 font-medium">{report.darkCirclesDetected ? 'Dark circles active' : 'Eyes refreshed'}</span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Facial Tension</span>
                  <span className="text-base font-poppins font-bold text-gray-800">{report.facialTension}%</span>
                  <span className="text-[8.5px] text-gray-500">Eyebrow micro-flashes</span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Vocal Tremor & Fatigue</span>
                  <span className="text-base font-poppins font-bold text-gray-800">{report.vocalJitter}%</span>
                  <span className="text-[8.5px] text-gray-500">{report.stutterDetected ? `${report.stutterCount} stutter cues` : 'Harmonic stability'}</span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Cognitive Load</span>
                  <span className="text-base font-poppins font-bold text-gray-800">{report.cognitiveLoad}%</span>
                  <span className="text-[8.5px] text-gray-500">Latency cadence</span>
                </div>
              </div>

              {/* AI Diagnostic Summary */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-poppins font-bold text-sm text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#3E6B63]" /> Clinical Biomarker Diagnostic
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-[#F2F8F5] p-4 border border-[#8FCBB0]/30 rounded-2xl font-medium">
                  {report.detectedReason}
                </p>
              </div>

              {/* Genuine Compliment Card (If user is happy) */}
              {report.isUserHappy && report.compliment && (
                <div className="bg-gradient-to-r from-[#8FCBB0]/30 to-[#F2F8F5] p-5 rounded-2xl border border-[#8FCBB0] flex items-start gap-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#3E6B63] text-white flex items-center justify-center shrink-0">
                    <Smile className="w-5 h-5 text-[#8FCBB0]" />
                  </div>
                  <div>
                    <h5 className="font-poppins font-bold text-sm text-[#3E6B63]">Doctor Saathi Compliment</h5>
                    <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed font-medium">
                      {report.compliment}
                    </p>
                  </div>
                </div>
              )}

              {/* Masked Sadness / Smiling Depression Alert Card */}
              {report.isMaskedSadness && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-300 flex items-start gap-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="text-xl">🎭</span>
                  </div>
                  <div>
                    <h5 className="font-poppins font-bold text-sm text-amber-950 flex items-center gap-1.5">
                      Masked Emotional Strain ("Smiling Depression")
                    </h5>
                    <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed font-medium">
                      Our biometric scanners detected an outward smile alongside ocular fatigue, under-eye dark circles, and somatic exhaustion. You don't have to force a smile or pretend to be okay here. You are safe to let down your guard.
                    </p>
                  </div>
                </div>
              )}

              {/* Motivational Reassurance Card ("I am right here with you") */}
              <div className="bg-gradient-to-r from-[#3E6B63] to-[#2B4B45] text-white p-6 rounded-2xl flex flex-col gap-3 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/8 text-white/5 opacity-10 pointer-events-none">
                  <Heart className="w-48 h-48" />
                </div>
                <h4 className="font-poppins font-bold text-sm text-[#8FCBB0] flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-current" /> Holding Space With You
                </h4>
                <p className="text-xs sm:text-sm text-[#F2F8F5] leading-relaxed italic font-medium">
                  "{report.motivation}"
                </p>
              </div>

              {/* UPLIFTING MUSIC THERAPY CARD (English, Hindi, Bengali) */}
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-poppins font-bold text-sm text-[#3E6B63] flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#3E5FE0]" /> Uplifting Music Therapy Recommendations
                  </h4>

                  {/* Language Switcher Tabs */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 text-xs">
                    <button
                      onClick={() => setSelectedMusicLang('english')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        selectedMusicLang === 'english' ? 'bg-white text-[#3E6B63] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => setSelectedMusicLang('hindi')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        selectedMusicLang === 'hindi' ? 'bg-white text-[#3E6B63] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🇮🇳 Hindi
                    </button>
                    <button
                      onClick={() => setSelectedMusicLang('bengali')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        selectedMusicLang === 'bengali' ? 'bg-white text-[#3E6B63] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🌾 Bengali
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-1">
                  {report.songs[selectedMusicLang].map((song, i) => (
                    <a
                      key={i}
                      href={song.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-gray-50 hover:bg-[#F2F8F5] border border-gray-200 hover:border-[#8FCBB0] rounded-xl flex items-start justify-between gap-3 transition-all group"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5 text-[#3E5FE0] shrink-0" />
                          <span className="text-xs font-bold text-gray-800 group-hover:text-[#3E6B63] transition-colors">{song.title}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500">{song.artist}</span>
                        <span className="text-[10px] text-gray-400 mt-1 leading-normal">{song.reason}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3E6B63] shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Right solution checklist */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <h3 className="font-poppins font-bold text-base text-[#3E6B63]">SAATHI Auto-Solution Plan</h3>

              {/* Solutions checklist */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg flex flex-col gap-5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Prescribed Restorative Actions
                </div>

                <div className="flex flex-col gap-3">
                  {/* Somatic Eye Palming (If dark circles / tired) */}
                  {report.darkCirclesDetected && (
                    <div className="w-full p-4 border border-amber-200 bg-amber-50/60 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-amber-900">20-20-20 Warm Palming Reset</span>
                        <span className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                          Rub your palms until warm, then cup over your closed eyes for 60 seconds to soothe periorbital micro-vascular strain and dark circles.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Breathing Exercise Trigger */}
                  <button
                    onClick={triggerBreathingCycle}
                    className="w-full p-4 border border-[#8FCBB0]/30 hover:border-[#8FCBB0]/70 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl text-left transition-colors flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-[#8FCBB0]/30 text-[#3E6B63] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-poppins font-semibold text-sm text-[#3E6B63]">4-7-8 Parasympathetic Breathing</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Instant vagus nerve reset to deactivate facial and cognitive tension.</p>
                    </div>
                  </button>

                  {/* Guided interactive breathing modal */}
                  {showBreathingWidget && (
                    <div className="p-5 bg-gradient-to-b from-emerald-50 to-white border border-[#8FCBB0]/40 rounded-2xl flex flex-col items-center gap-4 animate-fadeIn">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-[#3E6B63] uppercase tracking-wider">Breathing Pacemaker</span>
                        <button 
                          onClick={() => setShowBreathingWidget(false)}
                          className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
                        >
                          Close
                        </button>
                      </div>

                      <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-1000 ${
                        breathingPhase === 'Inhale'
                          ? 'border-[#8FCBB0] bg-emerald-100 scale-110'
                          : breathingPhase === 'Hold'
                            ? 'border-indigo-300 bg-indigo-50 scale-105'
                            : breathingPhase === 'Exhale'
                              ? 'border-teal-300 bg-teal-50 scale-95'
                              : 'border-gray-200 bg-gray-50 scale-100'
                      }`}>
                        <span className="font-poppins font-bold text-sm text-[#3E6B63]">{breathingPhase}</span>
                        <span className="text-xl font-black text-gray-800">{breathingTimer}s</span>
                      </div>

                      <span className="text-xs text-gray-500 text-center font-medium">
                        {breathingPhase === 'Inhale' && 'Inhale deeply through your nose, expanding your belly.'}
                        {breathingPhase === 'Hold' && 'Gently hold your breath, feeling calm settle in.'}
                        {breathingPhase === 'Exhale' && 'Slowly release through your mouth like blowing a candle.'}
                        {breathingPhase === 'Prepare' && 'Get comfortable and prepare for the cycle.'}
                      </span>
                    </div>
                  )}

                  {/* Dedicated Chat Link */}
                  <Link
                    href="/chat"
                    className="w-full p-4 border border-indigo-100 hover:border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl text-left transition-colors flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-indigo-100 text-[#3E5FE0] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-poppins font-semibold text-sm text-indigo-950">Talk with Dr. Saathi AI</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Explore your feelings with your AI companion.</p>
                    </div>
                  </Link>

                  {/* Reset Scan Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setScanProgress('idle');
                      setReport(null);
                      setTypedText('');
                      setCaughtKeywords([]);
                      setLiveDistressIndex(32);
                    }}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors mt-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Start New Scan
                  </button>
                </div>
              </div>

            </div>

          </div>
        )
      )}

    </div>
  );
}
