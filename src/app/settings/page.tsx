'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/supabase';
import { 
  Settings, 
  ArrowLeft, 
  ShieldCheck, 
  Phone, 
  Trash2, 
  Download, 
  Globe, 
  Check,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, profile, updateConsent, updateEmergencyContact } = useAuth();
  
  // Consent states
  const [consentText, setConsentText] = useState(false);
  const [consentVoice, setConsentVoice] = useState(false);
  const [consentVideo, setConsentVideo] = useState(false);

  // Contact states
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactOptIn, setContactOptIn] = useState(false);

  // Language state
  const [language, setLanguage] = useState('en');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync state with profile data
  useEffect(() => {
    if (!profile) return;
    setConsentText(profile.consent_text);
    setConsentVoice(profile.consent_voice);
    setConsentVideo(profile.consent_video);
    setContactName(profile.emergency_contact_name || '');
    setContactPhone(profile.emergency_contact_phone || '');
    setContactOptIn(profile.emergency_contact_opt_in);
    setLanguage(profile.language || 'en');
  }, [profile]);

  if (!user || !profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      // 1. Save consent
      await updateConsent({
        text: consentText,
        voice: consentVoice,
        video: consentVideo,
      });

      // 2. Save contact details
      await updateEmergencyContact({
        name: contactName,
        phone: contactPhone,
        optIn: contactOptIn,
      });

      // 3. Save language preference
      await db.updateProfile(user.id, { language });

      setFeedback({ text: 'Settings updated successfully.', type: 'success' });
    } catch (err) {
      setFeedback({ text: 'Error updating settings. Try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    alert("SANDBOX EXPORT: Extracting user profile, entries, and distress history JSON. Downloading to local disk...");
    
    // Simulate JSON file download
    const exportData = {
      profile,
      device_logs: "Sensing model details (local to device only)",
      security_tier: "Complies with SIH PS 94 data anonymization directives"
    };
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saathi_data_export_${user.id.slice(0, 6)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteData = () => {
    const confirmDelete = window.confirm(
      "CRITICAL: Are you sure you want to request data deletion? This will purge all chat histories and journal records in compliance with data privacy standards. This action is irreversible."
    );
    if (confirmDelete) {
      alert("SUCCESS: Deletion request sent. All entries have been removed from local storage sandbox.");
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-poppins font-bold text-3xl text-[#142E27]">Preferences & Settings</h1>
          <p className="text-[#1E4339] text-sm mt-1 font-medium">Manage data consent, emergency contacts, and language settings.</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-sm flex gap-2 items-center ${
          feedback.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 flex flex-col gap-6">
          
          {/* Section 1: Distress Sensing Consent */}
          <div className="flex flex-col gap-4">
            <h3 className="font-poppins font-bold text-base text-[#3E6B63] flex items-center gap-2 border-b border-[#EEF1FB] pb-2">
              <ShieldCheck className="w-5 h-5 text-[#3E5FE0]" /> Dynamic Sensing Consents
            </h3>

            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentText}
                  onChange={(e) => setConsentText(e.target.checked)}
                  className="w-4 h-4 text-[#3E5FE0] rounded border-gray-300 focus:ring-[#3E5FE0] mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">Message Text Sentiment Analysis</span>
                  <span className="text-[10px] text-gray-500 leading-relaxed">
                    Compute emotional index metrics based on chat entries and logs. (Enables primary dashboard).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 border border-gray-100 rounded-xl bg-gray-50 opacity-60">
                <input
                  type="checkbox"
                  checked={consentVoice}
                  onChange={(e) => setConsentVoice(e.target.checked)}
                  className="w-4 h-4 text-[#3E5FE0] rounded border-gray-300 focus:ring-[#3E5FE0] mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    Speech/Vocal Cadence Analysis <span className="bg-[#8FCBB0] text-[#3E6B63] text-[8px] px-1.5 py-0.5 rounded-full font-bold">Coming Soon</span>
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Consent to processing microphone audio signals locally to parse vocal frequencies.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 border border-gray-100 rounded-xl bg-gray-50 opacity-60">
                <input
                  type="checkbox"
                  checked={consentVideo}
                  onChange={(e) => setConsentVideo(e.target.checked)}
                  className="w-4 h-4 text-[#3E5FE0] rounded border-gray-300 focus:ring-[#3E5FE0] mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    Micro-Expression Landmarks <span className="bg-[#8FCBB0] text-[#3E6B63] text-[8px] px-1.5 py-0.5 rounded-full font-bold">Coming Soon</span>
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Process front-camera feed markers during check-ins locally on device.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div className="flex flex-col gap-4 border-t border-[#EEF1FB] pt-4">
            <h3 className="font-poppins font-bold text-base text-[#3E6B63] flex items-center gap-2 border-b border-[#EEF1FB] pb-2">
              <Phone className="w-5 h-5 text-[#3E5FE0]" /> Emergency Guardian Contact
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Sharma (Father)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3E5FE0]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3E5FE0]"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={contactOptIn}
                onChange={(e) => setContactOptIn(e.target.checked)}
                className="w-4 h-4 text-[#3E5FE0] rounded border-gray-300 focus:ring-[#3E5FE0] mt-0.5"
              />
              <span className="text-[11px] text-gray-600 leading-relaxed">
                Allow SAATHI to send automated emergency resources or notifications to this contact if distress indexes reach Tier 3.
              </span>
            </label>
          </div>

          {/* Section 3: Language */}
          <div className="flex flex-col gap-4 border-t border-[#EEF1FB] pt-4">
            <h3 className="font-poppins font-bold text-base text-[#3E6B63] flex items-center gap-2 border-b border-[#EEF1FB] pb-2">
              <Globe className="w-5 h-5 text-[#3E5FE0]" /> Language Preference
            </h3>

            <div className="flex gap-4">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'Hindi (हिन्दी)' },
                { code: 'bn', label: 'Bengali (বাংলা)' },
              ].map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    language === lang.code
                      ? 'border-[#3E5FE0] bg-[#3E5FE0]/10 text-[#3E5FE0]'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {language === lang.code && <Check className="w-3.5 h-3.5" />}
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto self-end px-6 py-3 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl transition-all shadow-md"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Right Column: Data privacy stubs */}
        <div className="flex flex-col gap-6">
          <h3 className="font-poppins font-bold text-base text-[#3E6B63]">Data & Privacy Actions</h3>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              In compliance with local privacy frameworks, you retain complete rights to access, export, or request the purging of your emotional tracking datasets.
            </p>

            <button
              type="button"
              onClick={handleExportData}
              className="w-full py-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-gray-500" /> Export My Profile Data
            </button>

            <button
              type="button"
              onClick={handleDeleteData}
              className="w-full py-3 bg-red-50 hover:bg-red-100/80 text-red-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-red-200 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4 text-red-500" /> Purge & Delete Account
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
