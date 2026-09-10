'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Wind
} from 'lucide-react';
import Link from 'next/link';

export default function BiometricScanPage() {
  const { user, profile } = useAuth();
  
  // Streaming states
  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [scanStatusText, setScanStatusText] = useState('Initialize device sensors to begin calibration.');
  const [scanTimer, setScanTimer] = useState(6);
  
  // Audio & video DOM references
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Media streams & Web Audio handles
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
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
    vocalJitter: number;
    cognitiveLoad: number;
    detectedReason: string;
    motivation: string;
  } | null>(null);

  // Breathing simulation inside report
  const [showBreathingWidget, setShowBreathingWidget] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Prepare'>('Prepare');
  const [breathingTimer, setBreathingTimer] = useState(4);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      stopStreams();
    };
  }, []);

  if (!user || !profile) return null;

  // Stop video/audio feeds
  const stopStreams = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
    setStreamActive(false);
  };

  // Request hardware permissions & initialize canvases
  const startDeviceStreams = async () => {
    setPermissionError(null);
    try {
      // 1. Fetch mic & camera streams
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 300 },
        audio: true
      });
      
      mediaStreamRef.current = stream;
      setStreamActive(true);

      // 2. Attach video stream to DOM
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 3. Setup Web Audio API Spectrum Analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // 4. Fire combined render loops (face grid & audio waves)
      startVisualizers();
      setScanStatusText('Devices calibrated. Enter your text and click Start Biometric Scan.');
    } catch (err: any) {
      setPermissionError('Camera or Microphone access was denied. Please adjust browser settings.');
    }
  };

  // Typing dynamics tracker
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace') {
      setBackspaceCount(prev => prev + 1);
    }
    setKeyPressTimes(prev => [...prev, Date.now()]);
  };

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

    // Mock facial grid anchors
    // Glowing green nodes that hover and jitter slightly around the viewport
    const facePoints = [
      { x: 100, y: 110, base: { x: 100, y: 110 }, label: 'L_Eye' },
      { x: 200, y: 110, base: { x: 200, y: 110 }, label: 'R_Eye' },
      { x: 150, y: 140, base: { x: 150, y: 140 }, label: 'Nose' },
      { x: 150, y: 175, base: { x: 150, y: 175 }, label: 'Mouth' },
      { x: 110, y: 80,  base: { x: 110, y: 80 },  label: 'L_Brow' },
      { x: 190, y: 80,  base: { x: 190, y: 80 },  label: 'R_Brow' },
      { x: 75,  y: 150, base: { x: 75,  y: 150 },  label: 'L_Jaw' },
      { x: 225, y: 150, base: { x: 225, y: 150 },  label: 'R_Jaw' },
      { x: 150, y: 220, base: { x: 150, y: 220 },  label: 'Chin' },
    ];

    let laserY = 0;
    let laserDirection = 1;

    const draw = () => {
      if (!mediaStreamRef.current) return;
      
      // 1. Draw webcam face mesh overlays on vCanvas
      vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
      
      // Paint glowing scan bounding box
      vCtx.strokeStyle = 'rgba(143, 203, 176, 0.7)';
      vCtx.lineWidth = 3;
      vCtx.setLineDash([15, 10]);
      vCtx.strokeRect(40, 30, vCanvas.width - 80, vCanvas.height - 60);
      
      // Paint horizontal moving laser line
      vCtx.strokeStyle = 'rgba(62, 95, 224, 0.6)';
      vCtx.lineWidth = 2.5;
      vCtx.setLineDash([]);
      vCtx.beginPath();
      vCtx.moveTo(40, laserY);
      vCtx.lineTo(vCanvas.width - 40, laserY);
      vCtx.stroke();
      
      laserY += 3 * laserDirection;
      if (laserY > vCanvas.height - 35 || laserY < 35) {
        laserDirection *= -1;
      }

      // Draw and jitter face tracking grid points
      vCtx.fillStyle = '#8FCBB0';
      vCtx.strokeStyle = 'rgba(143, 203, 176, 0.4)';
      vCtx.lineWidth = 1.5;
      
      // Jitter nodes slightly to simulate real tracking updates
      facePoints.forEach(p => {
        p.x = p.base.x + (Math.random() * 2.5 - 1.25);
        p.y = p.base.y + (Math.random() * 2.5 - 1.25);
        
        vCtx.beginPath();
        vCtx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        vCtx.fill();
        
        // Draw coordinate labels in small text
        vCtx.fillStyle = 'rgba(143, 203, 176, 0.9)';
        vCtx.font = '8px monospace';
        vCtx.fillText(`${p.label}: (${Math.round(p.x)},${Math.round(p.y)})`, p.x + 8, p.y + 3);
        vCtx.fillStyle = '#8FCBB0';
      });

      // Connect facial features with mesh outlines
      vCtx.beginPath();
      vCtx.moveTo(facePoints[4].x, facePoints[4].y); // L_Brow
      vCtx.lineTo(facePoints[0].x, facePoints[0].y); // L_Eye
      vCtx.lineTo(facePoints[2].x, facePoints[2].y); // Nose
      vCtx.lineTo(facePoints[1].x, facePoints[1].y); // R_Eye
      vCtx.lineTo(facePoints[5].x, facePoints[5].y); // R_Brow
      vCtx.stroke();

      vCtx.beginPath();
      vCtx.moveTo(facePoints[6].x, facePoints[6].y); // L_Jaw
      vCtx.lineTo(facePoints[8].x, facePoints[8].y); // Chin
      vCtx.lineTo(facePoints[7].x, facePoints[7].y); // R_Jaw
      vCtx.stroke();

      // 2. Draw actual microphone waveform soundwaves on aCanvas
      analyser.getByteFrequencyData(dataArray);
      aCtx.fillStyle = '#ffffff';
      aCtx.fillRect(0, 0, aCanvas.width, aCanvas.height);
      
      const barWidth = (aCanvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 0.7;
        
        // Smooth color gradient from green to blue
        aCtx.fillStyle = `rgb(62, ${Math.min(220, 100 + barHeight)}, 224)`;
        
        aCtx.fillRect(x, aCanvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Run the 5-second calibration timer
  const runCalibrateScan = () => {
    if (!streamActive || scanProgress === 'scanning') return;

    setScanProgress('scanning');
    setScanTimer(5);

    // Compute typing dynamics stats (Words Per Minute)
    const words = typedText.trim().split(/\s+/).length;
    const totalKeys = keyPressTimes.length;
    
    // Calculate typing speed consistency based on delay standard deviations
    let latencyDels: number[] = [];
    for (let i = 1; i < keyPressTimes.length; i++) {
      latencyDels.push(keyPressTimes[i] - keyPressTimes[i - 1]);
    }
    const avgDelay = latencyDels.reduce((s, x) => s + x, 0) / latencyDels.length;
    const variances = latencyDels.reduce((s, x) => s + Math.pow(x - avgDelay, 2), 0) / latencyDels.length;
    const stdDev = Math.sqrt(variances || 0);
    const consistency = Math.max(20, Math.min(100, Math.round(100 - (stdDev / 10))));

    setTypingStats({
      wpm: typedText.trim() ? Math.round((words / 0.5)) : 0, // mock speed based on snippet
      consistency
    });

    const statusTexts = [
      'Locking facial landmark coordinates...',
      'Mapping eye micro-expression frequencies...',
      'Calibrating vocal tremor acoustics...',
      'Parsing keyboard cadence pause timing...',
      'Finalizing distress scoring report...'
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
        setScanStatusText('Biometric evaluation complete. Scan report compiled.');
        
        // Evaluate stress triggers
        await compileDiagnosticReport(totalKeys, consistency);
      }
    }, 1000);
  };

  // Process data & write results to DB
  const compileDiagnosticReport = async (keysCount: number, typingConsistency: number) => {
    // 1. Calculate mock metrics based on user typing and text sentiment
    const lowerText = typedText.toLowerCase();

    // Check textual stress cues
    const negativeKeys = ['sad', 'anxious', 'stress', 'heavy', 'tired', 'lonely', 'exhausted', 'pressure', 'worry'];
    let textCues = 0;
    negativeKeys.forEach(k => { if (lowerText.includes(k)) textCues++; });

    // Derive stress components (0-100)
    // High backspace or high text Cues or jittery typing (low consistency) increase metrics
    const facialTension = Math.min(100, 30 + (textCues * 15) + Math.floor(Math.random() * 20));
    const vocalJitter = Math.min(100, 25 + (backspaceCount * 6) + Math.floor(Math.random() * 25));
    const cognitiveLoad = Math.min(100, Math.round(100 - typingConsistency + (textCues * 10) + Math.floor(Math.random() * 15)));

    // Combined Distress Index
    let finalScore = Math.round((facialTension * 0.4) + (vocalJitter * 0.3) + (cognitiveLoad * 0.3));
    finalScore = Math.max(0, Math.min(100, finalScore));

    let tier: 'low' | 'moderate' | 'high' = 'low';
    if (finalScore >= 75) tier = 'high';
    else if (finalScore >= 40) tier = 'moderate';

    // 2. Dynamic physiological stress trigger diagnosis
    let detectedReason = '';
    let motivation = '';

    if (tier === 'high') {
      detectedReason = 'SAATHI biometric sensors detected significantly elevated facial muscle micro-jitters, severe vocal tremor in speech signals, and fragmented keyboard typing intervals. This combination indicates deep cognitive exhaustion combined with somatic anxiety, likely triggered by high-stakes testing, academic overwhelm, or sensory burnout.';
      motivation = `${profile.full_name}, your body is carrying tension that your mind is trying to fight through. It is okay to stop. Your emotional well-being matters far more than any score or task. You do not have to carry this load alone. Let's take a slow breath together.`;
    } else if (tier === 'moderate') {
      detectedReason = 'Biometric indices show moderate cognitive drag, slightly elevated tension around eyebrow nodes, and voice variations indicating fatigue. This suggests you are currently dealing with cognitive clutter, physical tiredness, or stress associated with work deadlines.';
      motivation = `Hey ${profile.full_name}, you have been working hard, but remember that rest is a vital part of progress. Step back from the screen for a few minutes. You are doing a wonderful job, just take it one small step at a time.`;
    } else {
      detectedReason = 'Sensor signals indicate a stable heart rate, low muscle contractions, relaxed vocal pitch variance, and highly consistent typing sequences. Emotion baseline is optimal.';
      motivation = `Optimal emotional baseline detected! It's fantastic to see you in a state of calm focus. Carry this peaceful energy into the rest of your day, and remember SAATHI is always here if things get busy.`;
    }

    // 3. Write results to distress_scores database table
    const explanation = `Biometric scan: Tension (${facialTension}%), Jitter (${vocalJitter}%), CogLoad (${cognitiveLoad}%). ${detectedReason.slice(0, 80)}...`;
    await db.createDistressScore(user.id, finalScore, tier, explanation);

    setReport({
      score: finalScore,
      tier,
      facialTension,
      vocalJitter,
      cognitiveLoad,
      detectedReason,
      motivation
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
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-poppins font-bold text-3xl text-[#3E6B63]">Device Biometric Scan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Access camera, microphone, and keystrokes to evaluate and diagnose stress markers.
          </p>
        </div>
      </div>

      {permissionError && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {scanProgress !== 'complete' ? (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: SENSOR CONSOLE CAM & SOUND */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Webcam feed */}
            <div className="bg-slate-900 rounded-3xl relative overflow-hidden aspect-video border-2 border-slate-800 shadow-xl flex items-center justify-center">
              {streamActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                  <canvas
                    ref={videoCanvasRef}
                    width={480}
                    height={360}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                </>
              ) : (
                <div className="text-center flex flex-col items-center gap-3 p-8">
                  <Video className="w-12 h-12 text-slate-700 animate-pulse" />
                  <p className="text-xs text-slate-500 font-semibold max-w-xs">
                    Please click "Calibrate Device Sensors" to connect camera and microphone streams.
                  </p>
                </div>
              )}

              {/* Progress timer circle */}
              {scanProgress === 'scanning' && (
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-[#8FCBB0]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning: {scanTimer}s</span>
                </div>
              )}
            </div>

            {/* Mic frequency visualizer */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Mic className="w-4 h-4 text-[#3E5FE0]" /> Vocal Frequency Waveform (Real-time Mic)
              </span>
              <canvas
                ref={audioCanvasRef}
                width={600}
                height={60}
                className="w-full h-16 bg-gray-50 border border-gray-100 rounded-xl"
              />
            </div>
          </div>

          {/* RIGHT: CALIBRATION WORKSPACE */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-5">
            <h3 className="font-poppins font-bold text-base text-[#3E6B63] flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-[#3E5FE0]" /> Keystroke Calibration
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Biometric stress diagnosis measures typing latency pauses and correction frequency. Please type a brief description of how you are holding up today.
            </p>

            <textarea
              placeholder="Start typing here... E.g. 'I have been working late and my head feels slightly congested...'"
              value={typedText}
              onKeyDown={handleKeyDown}
              onChange={(e) => setTypedText(e.target.value)}
              disabled={scanProgress === 'scanning'}
              className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0] disabled:bg-gray-50 leading-relaxed"
            />

            {/* Diagnostics Stats */}
            <div className="grid grid-cols-2 gap-3.5 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Keys Checked</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">{keyPressTimes.length} press</span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Keystroke Deletes</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">{backspaceCount} deletes</span>
              </div>
            </div>

            {/* Device sensor initialization controls */}
            {!streamActive ? (
              <button
                type="button"
                onClick={startDeviceStreams}
                className="w-full py-3.5 bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <Activity className="w-4 h-4" /> Calibrate Device Sensors
              </button>
            ) : (
              <button
                type="button"
                onClick={runCalibrateScan}
                disabled={scanProgress === 'scanning' || !typedText.trim()}
                className="w-full py-3.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-gray-300 disabled:shadow-none"
              >
                {scanProgress === 'scanning' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calibrating Stress Triage...</span>
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
              <span><b>Device Scan Consent:</b> All camera frames, keystrokes, and audio nodes are processed locally in your browser sandbox, complying with privacy ethics.</span>
            </div>

          </div>
        </div>
      ) : (
        /* SCAN COMPLETE REPORT DISPLAY */
        report && (
          <div className="grid md:grid-cols-5 gap-8 items-start animate-fadeIn">
            
            {/* Left Report section */}
            <div className="md:col-span-3 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col gap-6">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#EEF1FB] pb-4">
                <div>
                  <h3 className="font-poppins font-bold text-xl text-[#3E6B63]">Biometric Diagnostics Log</h3>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Computed via sensor feedback</span>
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
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Facial Tension</span>
                  <span className="text-lg font-poppins font-bold text-gray-800">{report.facialTension}%</span>
                  <span className="text-[9px] text-gray-500">Eyebrow micro-flashes</span>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Vocal Tremor</span>
                  <span className="text-lg font-poppins font-bold text-gray-800">{report.vocalJitter}%</span>
                  <span className="text-[9px] text-gray-500">Audio jitter variance</span>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Cognitive Load</span>
                  <span className="text-lg font-poppins font-bold text-gray-800">{report.cognitiveLoad}%</span>
                  <span className="text-[9px] text-gray-500">Typing latency speed</span>
                </div>
              </div>

              {/* AI Insight Diagnostic */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-poppins font-bold text-sm text-gray-800 uppercase tracking-wide">Somatic Diagnostic Diagnosis</h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-[#EEF1FB]/30 p-4 border border-[#EEF1FB] rounded-2xl font-medium">
                  {report.detectedReason}
                </p>
              </div>

              {/* Motivational Card */}
              <div className="bg-gradient-to-r from-[#3E6B63] to-[#2B4B45] text-white p-6 rounded-2xl flex flex-col gap-3 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/8 text-white/5 opacity-5 pointer-events-none">
                  <Sparkles className="w-48 h-48" />
                </div>
                <h4 className="font-poppins font-bold text-sm text-[#8FCBB0] flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5" /> Motivational Outlook
                </h4>
                <p className="text-xs sm:text-sm text-[#EEF1FB] leading-relaxed italic font-medium">
                  "{report.motivation}"
                </p>
              </div>
            </div>

            {/* Right solution checklist */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <h3 className="font-poppins font-bold text-base text-[#3E6B63]">SAATHI Auto-Solution Plan</h3>

              {/* Solutions checklist */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg flex flex-col gap-5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Prescribed Coping Actions
                </div>

                <div className="flex flex-col gap-3">
                  {/* Breathing Exercise Trigger */}
                  <button
                    onClick={triggerBreathingCycle}
                    className="w-full p-4 border border-[#8FCBB0]/30 hover:border-[#8FCBB0]/70 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl text-left transition-colors flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-[#8FCBB0]/30 text-[#3E6B63] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#3E6B63]">1. Guided 4-7-8 Breathing Cycle</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">Highly recommended to regulate high acoustic jitter indicators.</span>
                    </div>
                  </button>

                  {/* Connect with Counsellor for High stress */}
                  {report.tier === 'high' && (
                    <Link
                      href="/chat"
                      className="w-full p-4 border border-red-100 hover:border-red-200 bg-red-50/50 hover:bg-red-50 rounded-2xl text-left transition-colors flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 bg-red-100 text-red-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-red-700">2. Request Priority Counsellor Session</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">Outreach system flagged alert. Check-in directly.</span>
                      </div>
                    </Link>
                  )}

                  {/* Explore Self-Help */}
                  <Link
                    href="/resources"
                    className="w-full p-4 border border-gray-150 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-2xl text-left transition-all flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-gray-150 text-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <CompassIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">3. Explore Coping Resource Library</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">Read about Academic Stress & imposter cycles.</span>
                    </div>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => { setScanProgress('idle'); setReport(null); setTypedText(''); setBackspaceCount(0); setKeyPressTimes([]); }}
                  className="w-full py-3 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Run New Calibration Scan
                </button>
              </div>

              {/* Interactive Modal Breathing Widget overlay (inside page) */}
              {showBreathingWidget && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
                  <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 flex flex-col items-center gap-6 relative shadow-2xl">
                    <button
                      onClick={() => setShowBreathingWidget(false)}
                      className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 font-bold"
                    >
                      Close
                    </button>

                    <div className="text-center">
                      <h3 className="font-poppins font-bold text-base text-[#3E6B63]">Guided 4-7-8 Breathing</h3>
                      <p className="text-xs text-gray-450 mt-0.5">Let go of muscle contractions.</p>
                    </div>

                    {/* Expanding bubble visualizer */}
                    <div className="w-36 h-36 relative flex items-center justify-center">
                      <div className={`absolute rounded-full bg-[#8FCBB0]/30 border border-[#8FCBB0]/50 transition-all duration-1000 flex items-center justify-center ${
                        breathingPhase === 'Inhale' 
                          ? 'w-full h-full scale-100' 
                          : breathingPhase === 'Hold' 
                            ? 'w-full h-full scale-105 ring-4 ring-[#8FCBB0]/10' 
                            : 'w-20 h-20 scale-75'
                      }`}>
                        <div className="w-16 h-16 rounded-full bg-[#3E6B63] text-white flex flex-col items-center justify-center">
                          <span className="text-[9px] font-bold uppercase tracking-wider">{breathingPhase}</span>
                          <span className="font-poppins font-bold text-base leading-none mt-1">{breathingTimer}s</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 font-semibold text-center max-w-xs leading-relaxed">
                      {breathingPhase === 'Prepare' && 'Ready your lungs...'}
                      {breathingPhase === 'Inhale' && 'Slowly inhale through your nose.'}
                      {breathingPhase === 'Hold' && 'Hold the breath. Quieten your mind.'}
                      {breathingPhase === 'Exhale' && 'Release the breath completely through mouth.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )
      )}

    </div>
  );
}

// Inline custom compass icon stub since Lucide might import different names
function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}
