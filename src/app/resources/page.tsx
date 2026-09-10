'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LifeBuoy, 
  ArrowLeft, 
  Wind, 
  Compass, 
  BookOpen, 
  PhoneCall, 
  Play, 
  X,
  ExternalLink,
  ChevronRight,
  Activity,
  Heart
} from 'lucide-react';
import Link from 'next/link';

interface ResourceCard {
  id: string;
  title: string;
  description: string;
  category: 'Breathing' | 'Grounding' | 'Reading' | 'Connect' | 'Yoga';
  duration: string;
  instructions: string[];
  linkText?: string;
  linkHref?: string;
}

const STATIC_RESOURCES: ResourceCard[] = [
  {
    id: 'res-1',
    title: '4-7-8 Breathing Technique',
    description: 'A natural tranquilizer for the nervous system. Helps reduce anxiety and aids sleep induction.',
    category: 'Breathing',
    duration: '5 Mins',
    instructions: [
      'Exhale completely through your mouth, making a whoosh sound.',
      'Close your mouth and inhale quietly through your nose for a count of 4.',
      'Hold your breath for a count of 7.',
      'Exhale completely through your mouth, making a whoosh sound to a count of 8.',
      'Repeat the cycle 4 times.'
    ]
  },
  {
    id: 'res-2',
    title: '5-4-3-2-1 Grounding Exercise',
    description: 'Anchor yourself in the present moment when feeling overwhelmed or panicky.',
    category: 'Grounding',
    duration: '10 Mins',
    instructions: [
      'Look around you and name 5 things you can see (e.g., a chair, a shadow).',
      'Name 4 things you can physically feel or touch (e.g., your shirt, the table).',
      'Name 3 things you can hear around you (e.g., traffic, fan hum).',
      'Name 2 things you can smell (e.g., soap, coffee).',
      'Name 1 thing you can taste.'
    ]
  },
  {
    id: 'res-3',
    title: 'Understanding Anxiety',
    description: 'Learn the biological purposes of anxiety, how the fight-or-flight response triggers, and how to tame it.',
    category: 'Reading',
    duration: '6 Mins Read',
    instructions: [
      'Anxiety is a protective signal, not a defect. It triggers adrenaline to prepare for action.',
      'Cognitive symptoms include catastrophic thinking and worrying about uncontrollable variables.',
      'Physical symptoms include heart racing, sweat, shallow breathing, and digestive shifts.',
      'To manage: acknowledge the threat feeling, anchor in physical reality, and take deep, slow diaphragmatic breaths.'
    ]
  },
  {
    id: 'res-4',
    title: 'Talking to Someone You Trust',
    description: 'Step-by-step advice on how to start difficult conversations about your mental health.',
    category: 'Connect',
    duration: '10 Mins Read',
    instructions: [
      'Pick a supportive person who is calm and non-judgmental.',
      'Write down what you want to say in advance if you are worried about locking up.',
      'Start with simple starters: "I have been feeling a bit heavy lately and just want to talk."',
      'Explain what you need: do you want solutions, or do you just want a sympathetic ear to vent?'
    ]
  },
  {
    id: 'res-5',
    title: 'Box Breathing (Square Breathing)',
    description: 'Used by athletes and emergency responders to clear the mind, center focus, and regulate stress.',
    category: 'Breathing',
    duration: '4 Mins',
    instructions: [
      'Exhale all air from your lungs.',
      'Inhale slowly through your nose for 4 seconds.',
      'Hold your breath in for 4 seconds.',
      'Exhale slowly through your mouth for 4 seconds.',
      'Hold empty for 4 seconds, then repeat.'
    ]
  },
  {
    id: 'res-6',
    title: 'Progressive Muscle Relaxation (PMR)',
    description: 'Tense and release muscle groups sequentially to release stored physical stress.',
    category: 'Grounding',
    duration: '12 Mins',
    instructions: [
      'Sit comfortably and close your eyes.',
      'Starting at your toes, squeeze the muscles tightly for 5 seconds, then release completely.',
      'Move up to your calves, tensing and relaxing.',
      'Work your way up: thighs, abdomen, chest, shoulders, hands, face.',
      'Breathe deeply and feel the weight of physical release.'
    ]
  },
  {
    id: 'res-7',
    title: 'Managing Academic & Career Pressure',
    description: 'Practical time management and boundary setting to counter burnout and imposter feelings.',
    category: 'Reading',
    duration: '8 Mins Read',
    instructions: [
      'Break large goals into micro-tasks. Large tasks cause executive paralysis.',
      'Practice the Pomodoro method: work 25 mins, rest 5 mins.',
      'Understand imposter feelings: doubt is normal when learning. Be kind to your progress.',
      'Establish a clear end-of-work threshold daily. Your mind requires idle rest to retain data.'
    ]
  },
  {
    id: 'res-8',
    title: 'Find a Local Support Line',
    description: 'Immediate crisis hotlines, online text chats, and helpline directories in India.',
    category: 'Connect',
    duration: 'Direct Contact',
    instructions: [
      'KIRAN Mental Health Helpline (Govt of India): 1800-599-0019 (24/7, Toll-Free)',
      'Vandrevala Foundation Helpline: +91 9999 666 555',
      'AASRA Suicide Prevention Line: +91-9820466726',
      'For immediate medical emergencies, dial 112 or visit a nearby care center.'
    ],
    linkText: 'Kiran Helpline Directory',
    linkHref: 'https://www.socialjustice.gov.in/'
  },
  {
    id: 'res-9',
    title: 'Cat-Cow Stretch (Marjariasana)',
    description: 'A gentle flow between spinal arching and flexing. Relieves lower back tension and neck fatigue.',
    category: 'Yoga',
    duration: '3 Mins Flow',
    instructions: [
      'Start on your hands and knees in a tabletop position. Keep your wrists under shoulders and knees under hips.',
      'Inhale: Arch your back down, drop your belly, press chest forward, and lift head to look up (Cow Pose).',
      'Exhale: Round your spine up to ceiling, pull your belly in, and drop chin to chest (Cat Pose).',
      'Move fluidly between the two shapes synced to your breathing cycles for 1 to 2 minutes.'
    ]
  },
  {
    id: 'res-10',
    title: "Child's Pose (Balasana)",
    description: 'A deeply restorative grounding posture that shuts down hyper-alert sensory stress.',
    category: 'Yoga',
    duration: '5 Mins Rest',
    instructions: [
      'Kneel on the floor, touch your big toes together, and sit back on your heels.',
      'Separate your knees about hip-width apart and fold your torso forward down between your thighs.',
      'Extend your arms forward on the floor in front of you, palms facing down.',
      'Rest your forehead gently on the floor and focus on deep, heavy expansion in your lower back.'
    ]
  },
  {
    id: 'res-11',
    title: 'Legs-Up-The-Wall Pose (Viparita Karani)',
    description: 'A passive relaxation pose that improves leg circulation, relieves physical fatigue, and calms the heart.',
    category: 'Yoga',
    duration: '8 Mins Flow',
    instructions: [
      'Lie flat on your back, bringing your hips as close to a wall as comfortable.',
      'Extend your legs straight up along the wall line. Let your hands rest out by your sides, palms facing upward.',
      'Relax your spine and shoulder blades flat into the floor.',
      'Inhale: Expand your belly slowly. Exhale: Drop all tension down. Hold this calming posture.'
    ]
  },
  {
    id: 'res-12',
    title: 'Cobra Pose (Bhujangasana)',
    description: 'Stretches the abdominal organs, opens the lungs/chest, and strengthens spine extensors to relieve stress.',
    category: 'Yoga',
    duration: '4 Mins Flow',
    instructions: [
      'Lie face down on the floor with your legs close together. Place your hands under your shoulders.',
      'Inhale: Slowly press into your palms to lift your chest off the floor. Keep your lower belly connected to ground.',
      'Keep your shoulders relaxed away from your ears, looking slightly upward (Cobra backbend).',
      'Exhale: Gently lower your chest and head back down to the ground. Repeat for several breathing cycles.'
    ]
  }
];

export default function ResourcesPage() {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeResource, setActiveResource] = useState<ResourceCard | null>(null);

  // Breathing simulation state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Prepare'>('Prepare');
  const [breathingTimer, setBreathingTimer] = useState(4);

  // Yoga simulation state
  const [yogaActive, setYogaActive] = useState(false);
  const [yogaBreathPhase, setYogaBreathPhase] = useState<'Inhale' | 'Exhale'>('Inhale');
  const [yogaBreathTimer, setYogaBreathTimer] = useState(5);
  const [yogaTimer, setYogaTimer] = useState(30);

  // Filter cards
  const filteredResources = selectedCategory === 'All' 
    ? STATIC_RESOURCES 
    : STATIC_RESOURCES.filter(r => r.category === selectedCategory);

  // Active breathing simulation cycle
  useEffect(() => {
    if (!breathingActive || !activeResource) return;

    const isBox = activeResource.title.includes('Box');
    
    const interval = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          let nextPhase: 'Inhale' | 'Hold' | 'Exhale' | 'Prepare' = 'Inhale';
          let nextDuration = 4;

          if (breathingPhase === 'Prepare') {
            nextPhase = 'Inhale';
            nextDuration = 4;
          } else if (breathingPhase === 'Inhale') {
            nextPhase = 'Hold';
            nextDuration = isBox ? 4 : 7;
          } else if (breathingPhase === 'Hold') {
            nextPhase = 'Exhale';
            nextDuration = isBox ? 4 : 8;
          } else if (breathingPhase === 'Exhale') {
            nextPhase = isBox ? 'Prepare' : 'Inhale';
            nextDuration = 4;
          }

          setBreathingPhase(nextPhase);
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive, activeResource, breathingPhase]);

  // Active yoga stretch cycle
  useEffect(() => {
    if (!yogaActive || !activeResource) return;

    const interval = setInterval(() => {
      setYogaTimer((prev) => {
        if (prev <= 1) {
          setYogaActive(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });

      setYogaBreathTimer((prevBreath) => {
        if (prevBreath <= 1) {
          setYogaBreathPhase((current) => (current === 'Inhale' ? 'Exhale' : 'Inhale'));
          return 5;
        }
        return prevBreath - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [yogaActive, activeResource]);

  if (!user || !profile) return null;

  const startBreathingSimulation = (res: ResourceCard) => {
    setActiveResource(res);
    if (res.category === 'Breathing') {
      setBreathingActive(true);
      setBreathingPhase('Prepare');
      setBreathingTimer(3);
      setYogaActive(false);
    } else if (res.category === 'Yoga') {
      setBreathingActive(false);
      setYogaActive(true);
      setYogaTimer(30);
      setYogaBreathTimer(5);
      setYogaBreathPhase('Inhale');
    } else {
      setBreathingActive(false);
      setYogaActive(false);
    }
  };

  const closeResourceModal = () => {
    setActiveResource(null);
    setBreathingActive(false);
    setYogaActive(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Breathing': return Wind;
      case 'Grounding': return Compass;
      case 'Reading': return BookOpen;
      case 'Yoga': return Activity;
      default: return PhoneCall;
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
          <h1 className="font-poppins font-bold text-3xl text-[#3E6B63]">Coping & Self-Help</h1>
          <p className="text-gray-500 text-sm mt-1">Guided grounding, breathing practices, and stress education.</p>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 border-b border-[#EEF1FB]">
        {['All', 'Breathing', 'Grounding', 'Yoga', 'Reading', 'Connect'].map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap ${
                active 
                  ? 'bg-[#3E5FE0] text-white' 
                  : 'bg-white hover:bg-gray-50 text-[#3E6B63] border border-gray-100'
              }`}
            >
              {cat !== 'All' && React.createElement(getCategoryIcon(cat), { className: 'w-3.5 h-3.5' })}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Resources grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const Icon = getCategoryIcon(res.category);
          return (
            <div 
              key={res.id} 
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 hover:border-[#8FCBB0]/30 transition-all flex flex-col gap-4 group justify-between"
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-[#EEF1FB] text-[#3E6B63] rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {res.duration}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-poppins font-bold text-base text-[#3E6B63] group-hover:text-[#3E5FE0] transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{res.description}</p>
                </div>
              </div>

              <button
                onClick={() => startBreathingSimulation(res)}
                className="mt-2 text-xs font-bold text-[#3E5FE0] flex items-center gap-1 group-hover:underline transition-all"
              >
                {res.category === 'Breathing' ? 'Start exercise' : res.category === 'Yoga' ? 'Start stretch' : 'Read guide'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* DETAILED GUIDE MODAL (WITH BREATHING WIDGET INCLUDED) */}
      {activeResource && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative border border-gray-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={closeResourceModal}
              className="absolute right-6 top-6 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8FCBB0]/20 text-[#3E6B63] rounded-xl flex items-center justify-center">
                {React.createElement(getCategoryIcon(activeResource.category), { className: 'w-5 h-5' })}
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#3E5FE0] bg-[#3E5FE0]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeResource.category} &bull; {activeResource.duration}
                </span>
                <h2 className="font-poppins font-bold text-xl text-[#3E6B63] mt-1">{activeResource.title}</h2>
              </div>
            </div>

            {/* INTERACTIVE BREATHING BUBBLE COMPONENT */}
            {breathingActive && (
              <div className="p-8 bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-2xl flex flex-col items-center gap-6">
                
                {/* Expanding breathing circle */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className={`absolute rounded-full bg-[#8FCBB0]/25 border border-[#8FCBB0]/40 transition-all duration-1000 flex items-center justify-center ${
                    breathingPhase === 'Inhale' 
                      ? 'w-full h-full scale-100 opacity-90' 
                      : breathingPhase === 'Hold' 
                        ? 'w-full h-full scale-[1.05] opacity-100 ring-4 ring-[#8FCBB0]/20' 
                        : 'w-24 h-24 scale-75 opacity-70'
                  }`}>
                    {/* Inner core */}
                    <div className="w-20 h-20 rounded-full bg-[#3E6B63] text-white flex flex-col items-center justify-center shadow-md">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                        {breathingPhase}
                      </span>
                      <span className="font-poppins font-bold text-xl leading-none mt-1">
                        {breathingTimer}s
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed font-semibold">
                    {breathingPhase === 'Prepare' && 'Close your eyes. Relax your chest.'}
                    {breathingPhase === 'Inhale' && 'Breathe in slowly through your nose. Expand your lungs.'}
                    {breathingPhase === 'Hold' && 'Keep the air inside your lungs. Relax your mind.'}
                    {breathingPhase === 'Exhale' && 'Whoosh the air out through your mouth completely.'}
                  </p>
                </div>
              </div>
            )}

            {/* INTERACTIVE YOGA STRETCH ILLUSTRATOR */}
            {activeResource.category === 'Yoga' && (
              <div className="flex flex-col gap-5 items-center">
                {/* Embedded pose styles */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes resSpineFlex {
                    0%, 100% { d: path("M25 65 Q50 65 75 65"); }
                    50% { d: path("M25 65 Q50 48 75 65"); }
                  }
                  @keyframes resCowSpineFlex {
                    0%, 100% { d: path("M25 65 Q50 65 75 65"); }
                    50% { d: path("M25 65 Q50 78 75 65"); }
                  }
                  @keyframes resChildsBreath {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.03) translate(-1px, -1px); }
                  }
                  @keyframes resCobraBreath {
                    0%, 100% { d: path("M55 76 Q45 60 40 45"); }
                    50% { d: path("M55 76 Q42 55 38 42"); }
                  }
                  .animate-resCatSpine { animation: resSpineFlex 5s ease-in-out infinite; }
                  .animate-resCowSpine { animation: resCowSpineFlex 5s ease-in-out infinite; }
                  .animate-resChildsBreath { transform-origin: 50% 70%; animation: resChildsBreath 6s ease-in-out infinite; }
                  .animate-resCobraBreath { animation: resCobraBreath 5s ease-in-out infinite; }
                `}} />

                <div className="w-full bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-2xl flex items-center justify-center p-6 relative aspect-video">
                  {activeResource.id === 'res-9' ? (
                    // Cat Cow Vector
                    <svg width="200" height="120" viewBox="0 0 100 100" className="text-[#3E6B63]">
                      <line x1="10" y1="80" x2="90" y2="80" stroke="#8FCBB0" strokeWidth="2" />
                      <line x1="25" y1="80" x2="25" y2="65" stroke="currentColor" strokeWidth="3" />
                      <line x1="75" y1="80" x2="75" y2="65" stroke="currentColor" strokeWidth="3" />
                      <path
                        d="M25 65 Q50 65 75 65"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        className={yogaActive ? (yogaBreathPhase === 'Inhale' ? 'animate-resCowSpine' : 'animate-resCatSpine') : ''}
                      />
                      <g className={`transition-transform duration-1000 ${yogaActive && yogaBreathPhase === 'Inhale' ? '-translate-y-1' : 'translate-y-0.5'}`}>
                        <line x1="25" y1="65" x2="20" y2="52" stroke="currentColor" strokeWidth="3" />
                        <circle cx="20" cy="46" r="5" fill="currentColor" />
                      </g>
                    </svg>
                  ) : activeResource.id === 'res-10' ? (
                    // Child's Pose Vector
                    <svg width="200" height="120" viewBox="0 0 100 100" className="text-[#3E6B63]">
                      <line x1="10" y1="80" x2="90" y2="80" stroke="#8FCBB0" strokeWidth="2" />
                      <path d="M70 80 C70 70, 85 70, 85 80" fill="none" stroke="currentColor" strokeWidth="3" />
                      <g className={yogaActive ? 'animate-resChildsBreath' : ''}>
                        <circle cx="25" cy="74" r="5" fill="currentColor" />
                        <path d="M75 72 C55 60, 35 60, 25 74" fill="none" stroke="currentColor" strokeWidth="3.5" />
                      </g>
                      <path d="M25 76 L12 80" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                  ) : activeResource.id === 'res-11' ? (
                    // Legs-Up-The-Wall Vector
                    <svg width="200" height="120" viewBox="0 0 100 100" className="text-[#3E6B63]">
                      <line x1="10" y1="80" x2="90" y2="80" stroke="#8FCBB0" strokeWidth="2" />
                      <line x1="75" y1="80" x2="75" y2="25" stroke="#8FCBB0" strokeWidth="2" strokeDasharray="3,3" />
                      <line x1="74" y1="78" x2="74" y2="35" stroke="currentColor" strokeWidth="3" />
                      <line x1="74" y1="78" x2="45" y2="78" stroke="currentColor" strokeWidth="3.5" />
                      <circle cx="39" cy="76" r="4.5" fill="currentColor" />
                      <line x1="55" y1="78" x2="50" y2="74" stroke="currentColor" strokeWidth="2.5" />
                      
                      {yogaActive && (
                        <circle 
                          cx="60" 
                          cy="74" 
                          r="5" 
                          fill="none" 
                          stroke="#8FCBB0" 
                          strokeWidth="1.2" 
                          className={`transition-all duration-1000 ${
                            yogaBreathPhase === 'Inhale' ? 'scale-[1.6] opacity-50' : 'scale-100 opacity-10'
                          }`}
                          style={{ transformOrigin: '60px 74px' }}
                        />
                      )}
                    </svg>
                  ) : (
                    // Cobra Pose Vector
                    <svg width="200" height="120" viewBox="0 0 100 100" className="text-[#3E6B63]">
                      <line x1="10" y1="80" x2="90" y2="80" stroke="#8FCBB0" strokeWidth="2" />
                      <path d="M85 78 Q70 78 55 76" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path 
                        d="M55 76 Q45 60 40 45" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3.5" 
                        className={yogaActive && yogaBreathPhase === 'Inhale' ? 'animate-resCobraBreath' : ''}
                      />
                      <path d="M48 78 L45 65" fill="none" stroke="currentColor" strokeWidth="2.8" />
                      <g className={`transition-transform duration-1000 ${yogaActive && yogaBreathPhase === 'Inhale' ? 'translate-y-[-2px] rotate-[-5deg]' : ''}`} style={{ transformOrigin: '40px 45px' }}>
                        <circle cx="40" cy="38" r="5" fill="currentColor" />
                      </g>
                    </svg>
                  )}

                  {yogaActive && (
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-[#3E6B63] flex items-center gap-1 border border-slate-100 shadow-sm">
                      <Wind className="w-3.5 h-3.5 animate-spin" />
                      <span>{yogaBreathPhase} ({yogaBreathTimer}s)</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 bg-slate-900/90 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                    Timer: {yogaTimer}s
                  </div>
                </div>

                <div className="w-full flex gap-3">
                  {!yogaActive ? (
                    <button
                      onClick={() => setYogaActive(true)}
                      className="flex-1 py-2.5 bg-[#3E6B63] hover:bg-[#3E6B63]/90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Stretching Flow
                    </button>
                  ) : (
                    <button
                      onClick={() => setYogaActive(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Pause Stretch
                    </button>
                  )}
                  <button
                    onClick={() => { setYogaActive(false); setYogaTimer(30); setYogaBreathTimer(5); }}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Steps & Instructions */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Instructions & Tips</h4>
              <ol className="flex flex-col gap-3 text-sm text-gray-600">
                {activeResource.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start leading-relaxed">
                    <span className="w-5 h-5 bg-[#EEF1FB] text-[#3E5FE0] font-bold text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Support Link or Helpline directory */}
            {activeResource.linkHref && activeResource.linkText && (
              <a
                href={activeResource.linkHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-[#3E5FE0] hover:underline"
              >
                <span>{activeResource.linkText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Exercise restart buttons */}
            {activeResource.category === 'Breathing' && !breathingActive && (
              <button
                onClick={() => { setBreathingActive(true); setBreathingPhase('Prepare'); setBreathingTimer(3); }}
                className="w-full py-3 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl mt-2 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Play className="w-4 h-4 fill-current" /> Start Breathing Guide
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
