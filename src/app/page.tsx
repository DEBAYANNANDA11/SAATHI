'use client';

import React from 'react';
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
  Lock
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#EEF1FB] via-white to-[#EEF1FB]/40">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 self-center md:self-start bg-[#8FCBB0]/25 rounded-full text-sm font-semibold text-[#3E6B63]">
            <Brain className="w-4 h-4 animate-pulse" />
            <span>Smart India Hackathon 2026 Submission &bull; PS 94</span>
          </div>
          
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl text-[#3E6B63] leading-tight">
            Your silent companion for <span className="text-[#3E5FE0]">emotional well-being</span>
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
            SAATHI combines responsive conversational AI with subtle typing and sentiment analytics to detect early signs of mental distress, connecting you to support when it matters most.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-[#3E6B63]/20 bg-white hover:bg-gray-50 text-[#3E6B63] font-semibold rounded-xl shadow-sm transition-all duration-300"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 bg-[#8FCBB0]/20 blur-3xl rounded-full transform scale-75 -z-10" />
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100/50 max-w-md w-full relative overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
            {/* Top Bar */}
            <div className="flex justify-between items-center pb-4 border-b border-[#EEF1FB] mb-6">
              <Logo size={32} showText />
              <span className="text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full border border-green-200">
                AI Active
              </span>
            </div>

            {/* Simulated Chat Window */}
            <div className="space-y-4">
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-[#8FCBB0]/30 flex items-center justify-center text-xs font-semibold text-[#3E6B63]">S</div>
                <div className="bg-[#EEF1FB] p-3.5 rounded-2xl rounded-tl-none text-sm text-[#3E6B63] font-medium max-w-[80%]">
                  Noticed you've gone quiet today — want to talk, or just breathe together?
                </div>
              </div>
              <div className="flex gap-2.5 items-start justify-end">
                <div className="bg-[#3E5FE0] text-white p-3.5 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-sm">
                  Just feeling a bit heavy and overwhelmed with work...
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-[#8FCBB0]/30 flex items-center justify-center text-xs font-semibold text-[#3E6B63]">S</div>
                <div className="bg-[#EEF1FB] p-3.5 rounded-2xl rounded-tl-none text-sm text-[#3E6B63] font-medium max-w-[80%]">
                  I hear you. Take a slow, deep breath. We can take it one small step at a time.
                </div>
              </div>
            </div>

            {/* Scoring visual */}
            <div className="mt-8 pt-4 border-t border-[#EEF1FB] flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-[#3E6B63]" /> End-to-end Encrypted</span>
              <span className="font-semibold text-[#3E5FE0]">Distress Index: Low</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white border-t border-[#EEF1FB] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-poppins font-bold text-3xl text-[#3E6B63]">
              A non-intrusive, supportive ecosystem
            </h2>
            <p className="text-gray-500 mt-3">
              SAATHI guides users through low-stress checks and offers layered response tiers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-2xl flex flex-col gap-4">
              <div className="w-12 h-12 bg-[#3E5FE0]/10 text-[#3E5FE0] rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">Distress Analysis Chat</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Warm conversations that dynamically measure stress level indices through basic semantic sentiment flags.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-2xl flex flex-col gap-4">
              <div className="w-12 h-12 bg-[#8FCBB0]/20 text-[#3E6B63] rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">Private Journals</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Free-expression workspace. Vent privately to keep track of daily mood tags and thoughts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-2xl flex flex-col gap-4">
              <div className="w-12 h-12 bg-[#3E5FE0]/10 text-[#3E5FE0] rounded-xl flex items-center justify-center">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">Trend Dashboard</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Review your 30-day distress level curve split across clear safety tier bands (green, yellow, red).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-2xl flex flex-col gap-4">
              <div className="w-12 h-12 bg-[#8FCBB0]/20 text-[#3E6B63] rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#3E6B63]">Escalation Tiers</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connects high-distress users to designated institutional counsellors directly through a clean, privacy-first queue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Guarantee Banner */}
      <section className="bg-gradient-to-r from-[#3E6B63] to-[#2D504A] text-white py-14 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <ShieldCheck className="w-10 h-10 text-[#8FCBB0]" />
          <h2 className="font-poppins font-bold text-2xl">Privacy & Consent First</h2>
          <p className="text-[#EEF1FB] text-base leading-relaxed max-w-2xl">
            We operate under explicit user consent. We never save raw chat text to logs viewed by counsellors. Only aggregate metadata and distress index scores are processed to assure absolute anonymity and data security.
          </p>
        </div>
      </section>
    </div>
  );
}
