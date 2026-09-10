'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Heart, Users, Eye, HelpCircle, ArrowRight, Phone } from 'lucide-react';

export default function ConsentPage() {
  const { profile, updateConsent, updateEmergencyContact } = useAuth();
  const router = useRouter();

  // Consent toggles
  const [consentText, setConsentText] = useState(false);
  const [consentVoice, setConsentVoice] = useState(false);
  const [consentVideo, setConsentVideo] = useState(false);

  // Emergency contact fields
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactOptIn, setContactOptIn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentText) {
      setError('You must agree to the primary distress detection consent to proceed.');
      return;
    }

    setError(null);
    setLoading(true);

    // Save primary sensing consent
    const consentSuccess = await updateConsent({
      text: consentText,
      voice: consentVoice,
      video: consentVideo,
    });

    if (!consentSuccess) {
      setError('Failed to update consent preferences. Please try again.');
      setLoading(false);
      return;
    }

    // Save emergency contact if provided
    if (contactName.trim() || contactPhone.trim()) {
      if (!contactName.trim() || !contactPhone.trim()) {
        setError('Both name and phone number are required for emergency contact.');
        setLoading(false);
        return;
      }
      
      const contactSuccess = await updateEmergencyContact({
        name: contactName,
        phone: contactPhone,
        optIn: contactOptIn,
      });

      if (!contactSuccess) {
        setError('Consent was saved, but emergency contact failed to update.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="flex-1 flex justify-center py-12 px-6 bg-gradient-to-b from-[#EEF1FB]/40 to-[#EEF1FB]">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center border-b border-[#EEF1FB] pb-6">
          <div className="w-14 h-14 bg-[#8FCBB0]/20 rounded-full flex items-center justify-center text-[#3E6B63] mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-poppins font-bold text-2xl text-[#3E6B63]">SAATHI Consent & Privacy</h1>
          <p className="text-gray-500 text-sm max-w-lg">
            We value your emotional health and your privacy equally. Please review how we operate and customize your preferences below.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Explanation Blocks */}
          <div className="flex flex-col gap-4">
            <h3 className="font-poppins font-bold text-base text-[#3E6B63]">How Distress Sensing Works</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-xl flex gap-3">
                <Eye className="w-5 h-5 text-[#3E5FE0] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-[#3E6B63]">What is Analyzed</span>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    We process keyword usage, sentiment scores, and response pacing. We do NOT log raw message logs to third parties.
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#EEF1FB]/30 border border-[#EEF1FB] rounded-xl flex gap-3">
                <Users className="w-5 h-5 text-[#3E5FE0] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-[#3E6B63]">Escalation & Care</span>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    If distress hits Tier 2 or 3, your counselor queue is alerted. They see only the distress index and brief highlights, never your diary content.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Consent Toggles */}
          <div className="flex flex-col gap-4 border-t border-[#EEF1FB] pt-6">
            <h3 className="font-poppins font-bold text-base text-[#3E6B63]">Enable Distress Check-in Sensing</h3>
            
            <div className="flex flex-col gap-3">
              {/* Text Check-ins (Required) */}
              <label className="flex items-start gap-3 p-3.5 border border-[#3E5FE0]/20 rounded-xl bg-[#EEF1FB]/20 hover:bg-[#EEF1FB]/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentText}
                  onChange={(e) => setConsentText(e.target.checked)}
                  className="w-5 h-5 text-[#3E5FE0] rounded border-gray-300 focus:ring-[#3E5FE0] mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#3E6B63]">Text sentiment analysis (Required for Dashboard)</span>
                  <span className="text-xs text-gray-500">
                    I consent to SAATHI processing my chat and journal message text indicators to compute my daily Distress Index.
                  </span>
                </div>
              </label>

              {/* Voice (Optional - coming soon) */}
              <div className="flex items-start gap-3 p-3.5 border border-gray-100 rounded-xl bg-gray-50 opacity-60">
                <input
                  type="checkbox"
                  checked={consentVoice}
                  onChange={(e) => setConsentVoice(e.target.checked)}
                  className="w-5 h-5 text-[#3E5FE0] rounded border-gray-300 focus:ring-[#3E5FE0] mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                    Voice feature checks <span className="bg-[#8FCBB0] text-[#3E6B63] text-[9px] px-1.5 py-0.5 rounded-full font-bold">Coming Soon</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    Analyze speech pause timing, volume variances, and vocal tone to map distress signatures in real-time audio check-ins.
                  </span>
                </div>
              </div>

              {/* Video (Optional - coming soon) */}
              <div className="flex items-start gap-3 p-3.5 border border-gray-100 rounded-xl bg-gray-50 opacity-60">
                <input
                  type="checkbox"
                  checked={consentVideo}
                  onChange={(e) => setConsentVideo(e.target.checked)}
                  className="w-5 h-5 text-[#3E5FE0] rounded border-gray-300 focus:ring-[#3E5FE0] mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                    Micro-expression analysis <span className="bg-[#8FCBB0] text-[#3E6B63] text-[9px] px-1.5 py-0.5 rounded-full font-bold">Coming Soon</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    Consent to processing front-camera pixel landmarks during check-in videos (all locally on device) to score fatigue rates.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Emergency Contact Section */}
          <div className="flex flex-col gap-4 border-t border-[#EEF1FB] pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-base text-[#3E6B63]">Optional Emergency Contact</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Highly Recommended</span>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              If your Distress Index reaches Tier 3 (High Distress, 75-100), configuring this allows SAATHI to automatically dispatch a supportive warning or connect you directly with them via quick-dial buttons.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Sharma (Father)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0]"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={contactOptIn}
                onChange={(e) => setContactOptIn(e.target.checked)}
                className="w-4 h-4 text-[#3E5FE0] rounded border-gray-300 focus:ring-[#3E5FE0] mt-0.5"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I consent to SAATHI notifying this contact if my Distress Index reaches a critical Tier 3 rating.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !consentText}
            className="w-full py-4 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl mt-4 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:shadow-none"
          >
            {loading ? 'Saving Preferences...' : 'Understand & Submit'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
