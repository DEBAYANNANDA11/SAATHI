'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  Wind, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ChevronRight, 
  Play, 
  Compass, 
  Volume2, 
  VolumeX, 
  Heart,
  TrendingDown
} from 'lucide-react';

interface CopingSessionProps {
  userId: string;
  initialScore: number;
  detectedCues: string[];
  onClose: () => void;
  onComplete: (newScore: number) => void;
}

export const CopingSession: React.FC<CopingSessionProps> = ({
  userId,
  initialScore,
  detectedCues,
  onClose,
  onComplete,
}) => {
  const { profile } = useAuth();
  const [step, setStep] = useState<'intro' | 'yoga' | 'breathing' | 'complete'>('intro');
  const [activeYogaPose, setActiveYogaPose] = useState<'catcow' | 'childspose'>('catcow');
  
  // Timer states
  const [yogaTimer, setYogaTimer] = useState(30);
  const [yogaActive, setYogaActive] = useState(false);
  const [yogaBreathPhase, setYogaBreathPhase] = useState<'Inhale' | 'Exhale'>('Inhale');
  const [yogaBreathTimer, setYogaBreathTimer] = useState(5);

  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Prepare'>('Prepare');
  const [breathingTimer, setBreathingTimer] = useState(3);
  const [breathingCycles, setBreathingCycles] = useState(0);

  // Audio voice toggle
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Mute audio synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 1. Yoga pose timing cycle
  useEffect(() => {
    if (!yogaActive) return;
    
    speakText(
      activeYogaPose === 'catcow'
        ? "Move onto hands and knees. Inhale, arch your back down and look up. Exhale, round your spine up and chin to chest."
        : "Kneel down, sit back on your heels, fold forward stretching your arms out, and rest your forehead on the floor."
    );

    const interval = setInterval(() => {
      // General timer countdown
      setYogaTimer(prev => {
        if (prev <= 1) {
          setYogaActive(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });

      // Breath phase transitions every 5 seconds
      setYogaBreathTimer(prevBreath => {
        if (prevBreath <= 1) {
          setYogaBreathPhase(current => {
            const next = current === 'Inhale' ? 'Exhale' : 'Inhale';
            speakText(next === 'Inhale' ? "Slowly inhale." : "Slowly exhale.");
            return next;
          });
          return 5;
        }
        return prevBreath - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [yogaActive, activeYogaPose]);

  // 2. 4-7-8 Breathing cycle
  useEffect(() => {
    if (!breathingActive) return;

    speakText("Prepare to breathe. Close your mouth and get ready.");

    const interval = setInterval(() => {
      setBreathingTimer(prev => {
        if (prev <= 1) {
          let nextP: typeof breathingPhase = 'Inhale';
          let duration = 4;

          if (breathingPhase === 'Prepare') {
            nextP = 'Inhale';
            duration = 4;
            speakText("Inhale quietly through your nose.");
          } else if (breathingPhase === 'Inhale') {
            nextP = 'Hold';
            duration = 7;
            speakText("Hold your breath.");
          } else if (breathingPhase === 'Hold') {
            nextP = 'Exhale';
            duration = 8;
            speakText("Exhale completely through your mouth, making a whoosh sound.");
          } else if (breathingPhase === 'Exhale') {
            nextP = 'Inhale';
            duration = 4;
            setBreathingCycles(c => {
              const nextC = c + 1;
              if (nextC >= 3) {
                // Done with breathing
                setBreathingActive(false);
                clearInterval(interval);
                setTimeout(() => {
                  setStep('complete');
                  saveStressRecovery();
                }, 1000);
              }
              return nextC;
            });
            speakText("Inhale through your nose.");
          }

          setBreathingPhase(nextP);
          return duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive, breathingPhase]);

  // 3. Log recovery in DB
  const saveStressRecovery = async () => {
    try {
      // Lower Distress index by 15 points
      const newScore = Math.max(0, initialScore - 15);
      
      let tier: 'low' | 'moderate' | 'high' = 'low';
      if (newScore >= 75) tier = 'high';
      else if (newScore >= 40) tier = 'moderate';

      const explanation = `Stress recovery completed: Managed physical tension via Yoga (${activeYogaPose}) and regulated breathing.`;
      
      await db.createDistressScore(userId, newScore, tier, explanation);
      onComplete(newScore);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative border border-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Custom Yoga CSS animations injected dynamically */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes yogaSpineFlex {
            0%, 100% { d: path("M25 65 Q50 65 75 65"); }
            50% { d: path("M25 65 Q50 48 75 65"); } /* Cat arch */
          }
          @keyframes cowSpineFlex {
            0%, 100% { d: path("M25 65 Q50 65 75 65"); }
            50% { d: path("M25 65 Q50 78 75 65"); } /* Cow dip */
          }
          @keyframes childsBreath {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03) translate(-1px, -1px); }
          }
          .animate-catSpine {
            animation: yogaSpineFlex 5s ease-in-out infinite;
          }
          .animate-cowSpine {
            animation: cowSpineFlex 5s ease-in-out infinite;
          }
          .animate-childsBreath {
            transform-origin: 50% 70%;
            animation: childsBreath 6s ease-in-out infinite;
          }
        `}} />

        {/* ==========================================
            STEP 1: INTRO & DIAGNOSIS SUMMARY
            ========================================== */}
        {step === 'intro' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="font-poppins font-bold text-xl text-[#3E6B63]">SAATHI Deep Wellness Check</h2>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Biometric Diagnostics
                </span>
              </div>
            </div>

            <div className="bg-[#EEF1FB]/30 p-6 rounded-2xl border border-[#EEF1FB] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#3E6B63]">Stress Score Index</span>
                <span className="text-sm font-bold text-red-600">{initialScore} / 100 (Elevated)</span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                I've reviewed your private database history. Based on your journal entry keywords: 
                <span className="font-bold text-[#3E5FE0] mx-1">
                  {detectedCues.map(c => `"${c}"`).join(', ') || '"stressed", "heavy"'}
                </span> 
                and your typing latency variations, I sense that you are carrying significant muscular tension and feeling cognitively overloaded.
              </p>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                Rather than visual scanning, I want to help you **physically release** this weight. Let's do a 30-second guided yoga stretch to drop your shoulder tension, followed by a 4-7-8 breathing sequence to reset your nervous system.
              </p>
            </div>

            {/* Voice toggle */}
            <button
              onClick={() => { const s = !voiceEnabled; setVoiceEnabled(s); if (s) speakText("Voice guidance activated."); }}
              className={`py-2 px-4 rounded-xl border text-xs font-semibold self-start transition-all flex items-center gap-1.5 ${
                voiceEnabled ? 'bg-blue-50 border-blue-200 text-[#3E5FE0]' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>Voice Assist {voiceEnabled ? "On" : "Off"}</span>
            </button>

            <button
              onClick={() => setStep('yoga')}
              className="w-full py-4 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Start Guided Yoga Stretch
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==========================================
            STEP 2: GUIDED YOGA STRETCHES (ANIMATED)
            ========================================== */}
        {step === 'yoga' && (
          <div className="flex flex-col gap-6 items-center">
            
            {/* Header / Toggles */}
            <div className="w-full flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">Step 1: Release Somatic Tension</h3>
                <p className="text-xs text-gray-400">Choose one posture to stretch for 30 seconds.</p>
              </div>

              {/* Selector Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveYogaPose('catcow'); setYogaActive(false); setYogaTimer(30); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeYogaPose === 'catcow' 
                      ? 'bg-[#3E5FE0] text-white border-transparent' 
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  Cat-Cow
                </button>
                <button
                  onClick={() => { setActiveYogaPose('childspose'); setYogaActive(false); setYogaTimer(30); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeYogaPose === 'childspose' 
                      ? 'bg-[#3E5FE0] text-white border-transparent' 
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  Child's Pose
                </button>
              </div>
            </div>

            {/* ANIMATED YOGA SVG BOX */}
            <div className="w-full max-w-sm aspect-video bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-2xl flex items-center justify-center relative p-6">
              
              {activeYogaPose === 'catcow' ? (
                // Cat-Cow animated stick-figure
                <svg width="240" height="150" viewBox="0 0 100 100" className="text-[#3E6B63]">
                  {/* Ground line */}
                  <line x1="10" y1="80" x2="90" y2="80" stroke="#8FCBB0" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Hands / Arms */}
                  <line x1="25" y1="80" x2="25" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Legs / Hips */}
                  <line x1="75" y1="80" x2="75" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Morphing Spine Curve (arch up and down based on breathing phase) */}
                  <path
                    d="M25 65 Q50 65 75 65"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className={yogaActive 
                      ? (yogaBreathPhase === 'Inhale' ? 'animate-cowSpine' : 'animate-catSpine')
                      : ''
                    }
                  />

                  {/* Neck and Head (translating slightly up/down synced to breath) */}
                  <g className={`transition-transform duration-1000 ${
                    yogaActive && yogaBreathPhase === 'Inhale' ? 'translate-y-[-3px] translate-x-[-1px]' : 'translate-y-[2px]'
                  }`}>
                    <line x1="25" y1="65" x2="20" y2="52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="20" cy="46" r="6" fill="currentColor" />
                  </g>
                  
                  {/* Visual Breath expansion waves */}
                  {yogaActive && (
                    <circle 
                      cx="50" 
                      cy="60" 
                      r="12" 
                      fill="none" 
                      stroke="#8FCBB0" 
                      strokeWidth="1.5" 
                      className={`transition-all duration-1000 ${
                        yogaBreathPhase === 'Inhale' ? 'scale-125 opacity-40' : 'scale-75 opacity-10'
                      }`}
                      style={{ transformOrigin: '50% 60%' }}
                    />
                  )}
                </svg>
              ) : (
                // Child's Pose animated stick-figure (diaphragmatic breath pulse)
                <svg width="240" height="150" viewBox="0 0 100 100" className="text-[#3E6B63]">
                  {/* Ground line */}
                  <line x1="10" y1="80" x2="90" y2="80" stroke="#8FCBB0" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Kneeling Legs fold */}
                  <path d="M70 80 C70 70, 85 70, 85 80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Back spine / Chest folded forward (breathing pulse scale) */}
                  <g className={yogaActive ? 'animate-childsBreath' : ''}>
                    {/* Head resting on floor */}
                    <circle cx="25" cy="74" r="5" fill="currentColor" />
                    {/* Folded torso curve */}
                    <path d="M75 72 C55 60, 35 60, 25 74" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  </g>

                  {/* Arms stretched forward on ground */}
                  <path d="M25 76 L12 80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}

              {/* Inhale/Exhale Visual overlay */}
              {yogaActive && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm text-[10px] font-bold text-[#3E6B63] flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 animate-spin" />
                  <span>Breathing: {yogaBreathPhase} ({yogaBreathTimer}s)</span>
                </div>
              )}

              {/* Timer indicator */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                Time: {yogaTimer}s
              </div>
            </div>

            {/* Instruction description card */}
            <div className="text-center max-w-md">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instructions</span>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {activeYogaPose === 'catcow' 
                  ? "Arch your back down, draw your shoulders back and look up to inhale. Round your spine up to ceiling and look down to exhale. Flow smoothly."
                  : "Sit back on your heels, crawl your fingers forward, and let your chest sink into the floor. Feel your lower back release with each deep exhale."
                }
              </p>
            </div>

            {/* Action buttons */}
            <div className="w-full flex gap-3 mt-4">
              {!yogaActive ? (
                <button
                  onClick={() => setYogaActive(true)}
                  className="flex-1 py-3.5 bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" /> Begin 30s Guide
                </button>
              ) : (
                <button
                  onClick={() => setYogaActive(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Pause Stretch
                </button>
              )}

              <button
                disabled={yogaActive}
                onClick={() => setStep('breathing')}
                className="px-6 py-3.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl text-sm shadow-md flex items-center gap-1.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ==========================================
            STEP 3: GUIDED 4-7-8 BREATHING CYCLE
            ========================================== */}
        {step === 'breathing' && (
          <div className="flex flex-col gap-6 items-center">
            <div className="text-center">
              <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">Step 2: Regulate Nervous System</h3>
              <p className="text-xs text-gray-400">Complete 3 cycles of 4-7-8 diaphragmatic breathing.</p>
            </div>

            {/* Expanding breathing circle */}
            <div className="w-44 h-44 relative flex items-center justify-center my-4 bg-slate-50/50 rounded-full border border-slate-100">
              <div className={`absolute rounded-full bg-[#8FCBB0]/30 border border-[#8FCBB0]/60 transition-all duration-1000 flex items-center justify-center ${
                breathingPhase === 'Inhale' 
                  ? 'w-full h-full scale-100' 
                  : breathingPhase === 'Hold' 
                    ? 'w-full h-full scale-105 ring-4 ring-[#8FCBB0]/10' 
                    : 'w-24 h-24 scale-75'
              }`}>
                <div className="w-20 h-20 rounded-full bg-[#3E6B63] text-white flex flex-col items-center justify-center shadow-md">
                  <span className="text-[9px] font-bold uppercase tracking-wider">{breathingPhase}</span>
                  <span className="font-poppins font-bold text-xl leading-none mt-1">{breathingTimer}s</span>
                </div>
              </div>
            </div>

            <div className="text-center max-w-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Completed cycles: {breathingCycles} / 3
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                {breathingPhase === 'Prepare' && 'Close your eyes. Blow all air out of your chest.'}
                {breathingPhase === 'Inhale' && 'Slowly inhale through your nose. Expand your stomach.'}
                {breathingPhase === 'Hold' && 'Keep the breath inside. Relax your jaw and shoulders.'}
                {breathingPhase === 'Exhale' && 'Exhale completely with a whoosh sound.'}
              </p>
            </div>

            {!breathingActive ? (
              <button
                onClick={() => { setBreathingActive(true); setBreathingPhase('Prepare'); setBreathingTimer(3); }}
                className="w-full py-4 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Begin 4-7-8 Breathing
              </button>
            ) : (
              <button
                onClick={() => setBreathingActive(false)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl"
              >
                Pause Breathing
              </button>
            )}

          </div>
        )}

        {/* ==========================================
            STEP 4: SESSION RESOLUTION
            ========================================== */}
        {step === 'complete' && (
          <div className="flex flex-col gap-6 items-center text-center py-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner border border-emerald-100">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-poppins font-bold text-2xl text-[#3E6B63]">Stress Level Reduced!</h2>
              <p className="text-slate-500 text-sm max-w-sm">
                Sensory metrics successfully calibrated. Your Distress Index baseline has dropped by 15 points.
              </p>
            </div>

            {/* Score shift indicator */}
            <div className="bg-[#EEF1FB]/30 p-4 border border-[#EEF1FB] rounded-2xl flex items-center gap-6 justify-center w-full max-w-sm mt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Previous Score</span>
                <span className="text-lg font-bold text-slate-500 mt-0.5">{initialScore}</span>
              </div>
              <div className="text-slate-300">
                <ArrowRight className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#3E6B63] uppercase">New Score</span>
                <span className="text-xl font-bold text-[#3E5FE0] mt-0.5 flex items-center gap-1 justify-center">
                  {Math.max(10, initialScore - 15)}
                  <TrendingDown className="w-4.5 h-4.5 text-green-500" />
                </span>
              </div>
            </div>

            {/* Motivational message */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold italic max-w-md bg-slate-55 p-4 rounded-xl border border-slate-100 mt-2">
              "You did great, {profile?.full_name || 'Client'}. By taking time to reset your physical posture and breathe, you've shown that you can regulate your response to stress. Keep this calm focus with you."
            </p>

            <button
              onClick={() => { onComplete(Math.max(10, initialScore - 15)); onClose(); }}
              className="w-full py-4 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-2xl mt-4 shadow-md"
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
export default CopingSession;
