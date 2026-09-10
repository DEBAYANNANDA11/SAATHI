'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, Escalation, UserProfile } from '@/lib/supabase';
import { 
  Users, 
  CheckCircle, 
  Activity, 
  AlertTriangle, 
  MessageSquare, 
  Send,
  Loader2,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export default function CounsellorPage() {
  const { user, profile } = useAuth();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [selectedEsc, setSelectedEsc] = useState<Escalation | null>(null);
  const [outreachText, setOutreachText] = useState('');
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfileMap, setUserProfileMap] = useState<Record<string, UserProfile>>({});

  // Fetch escalations queue
  useEffect(() => {
    if (!user) return;
    const loadQueue = async () => {
      setLoading(true);
      const escList = await db.getEscalations();
      
      // Filter out resolved ones for cleaner queue
      const activeQueue = escList.filter(e => e.status !== 'resolved');
      
      // Sort: high tier first, then moderate, then sorted by date (newest first)
      const sortedQueue = activeQueue.sort((a, b) => {
        if (a.tier === 'high' && b.tier !== 'high') return -1;
        if (a.tier !== 'high' && b.tier === 'high') return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setEscalations(sortedQueue);

      // Fetch user profile contact info for phone dialer support
      const profileMap: Record<string, UserProfile> = {};
      for (const esc of sortedQueue) {
        if (!profileMap[esc.user_id]) {
          const uProfile = await db.getProfile(esc.user_id);
          if (uProfile) {
            profileMap[esc.user_id] = uProfile;
          }
        }
      }
      setUserProfileMap(profileMap);
      setLoading(false);
    };

    loadQueue();
  }, [user]);

  if (!user || !profile || profile.role !== 'counsellor') return null;

  // Handle Mark as Contacted / Resolved
  const handleMarkContacted = async (escId: string) => {
    try {
      // Set to contacted first
      const updated = await db.updateEscalation(escId, { 
        status: 'contacted', 
        assigned_counsellor: user.id 
      });

      if (updated) {
        // Update local list
        setEscalations(prev => prev.map(e => e.id === escId ? { ...e, status: 'contacted', assigned_counsellor: user.id } : e));
        
        // Update currently selected escalation
        if (selectedEsc && selectedEsc.id === escId) {
          setSelectedEsc(prev => prev ? { ...prev, status: 'contacted', assigned_counsellor: user.id } : null);
        }
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleResolveEscalation = async (escId: string) => {
    try {
      const updated = await db.updateEscalation(escId, { 
        status: 'resolved', 
        assigned_counsellor: user.id 
      });
      if (updated) {
        // Remove from list
        setEscalations(prev => prev.filter(e => e.id !== escId));
        setSelectedEsc(null);
        alert("Escalation resolved and cleared from active queue.");
      }
    } catch (err) {
      alert("Failed to resolve escalation.");
    }
  };

  // Submit Outreach message
  const handleSendOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachText.trim() || !selectedEsc) return;

    setSendingOutreach(true);
    try {
      // In a real app, this sends an SMS, email, or in-app notification to the student.
      // We simulate creating a system notification entry in DB.
      await db.createEntry(
        selectedEsc.user_id, 
        'chat', 
        `[Outreach from ${profile.full_name}]: ${outreachText}`, 
        0.0 // neutral
      );

      // Upgrade escalation status to contacted
      await handleMarkContacted(selectedEsc.id);

      setOutreachText('');
      alert(`Outreach successfully sent to the student!`);
    } catch (err) {
      alert("Could not deliver outreach message.");
    } finally {
      setSendingOutreach(false);
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8 h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div>
        <h1 className="font-poppins font-bold text-3xl text-[#3E6B63]">Counsellor Queue</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review, outreach, and manage student distress indices. <b>Note:</b> Student chat histories remain locked to protect confidentiality.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-stretch flex-1 min-h-[400px]">
        
        {/* Left Column: Escalate Queue List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 md:col-span-2 overflow-y-auto p-5 flex flex-col gap-4">
          <h3 className="font-poppins font-bold text-base text-[#3E6B63] flex items-center gap-2 border-b border-[#EEF1FB] pb-2">
            <Activity className="w-5 h-5 text-[#3E5FE0]" /> Active Care Alerts ({escalations.length})
          </h3>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fetching queue...</span>
            </div>
          ) : escalations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <p className="text-sm font-semibold text-gray-500">All optimal!</p>
              <p className="text-xs text-gray-400">There are no pending distress alerts currently flagged in the system.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {escalations.map((esc) => {
                const isSelected = selectedEsc?.id === esc.id;
                const userProfile = userProfileMap[esc.user_id];
                
                return (
                  <button
                    key={esc.id}
                    onClick={() => { setSelectedEsc(esc); setOutreachText(''); }}
                    className={`w-full text-left p-4 border rounded-xl transition-all flex justify-between items-start gap-4 ${
                      isSelected 
                        ? 'border-[#3E5FE0] bg-[#EEF1FB]/30 ring-1 ring-[#3E5FE0]' 
                        : 'border-gray-150 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-poppins font-bold text-sm text-gray-800">
                        {esc.user_name || 'Student Client'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Alert: {new Date(esc.created_at).toLocaleDateString()}
                      </span>
                      
                      {/* Status Badges */}
                      <div className="flex gap-1.5 mt-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          esc.tier === 'high' 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {esc.tier} Alert
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          esc.status === 'contacted'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-red-50 text-red-700 animate-pulse'
                        }`}>
                          {esc.status}
                        </span>
                      </div>
                    </div>

                    {/* Circle Score Indicator */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                      esc.tier === 'high' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {esc.tier === 'high' ? 'High' : 'Mod'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detail Outreach View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 md:col-span-3 p-6 flex flex-col justify-between overflow-y-auto">
          {selectedEsc ? (
            <div className="flex flex-col gap-6 h-full justify-between">
              
              {/* Profile Card Header */}
              <div className="flex flex-col gap-4 border-b border-[#EEF1FB] pb-4">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="font-poppins font-bold text-xl text-[#3E6B63]">
                      {selectedEsc.user_name || 'Student Client'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Client ID: {selectedEsc.user_id.slice(0, 8)}... &bull; Language: {userProfileMap[selectedEsc.user_id]?.language.toUpperCase() || 'EN'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Phone button if opt-in */}
                    {userProfileMap[selectedEsc.user_id]?.emergency_contact_opt_in && userProfileMap[selectedEsc.user_id]?.emergency_contact_phone && (
                      <a
                        href={`tel:${userProfileMap[selectedEsc.user_id]?.emergency_contact_phone}`}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Contact Emergency Backup"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call Emergency
                      </a>
                    )}
                    
                    <button
                      onClick={() => handleResolveEscalation(selectedEsc.id)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve Case
                    </button>
                  </div>
                </div>

                {/* Score indicators */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-[#EEF1FB]/30 p-3.5 rounded-xl border border-[#EEF1FB] flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Distress Rating</span>
                    <span className="text-lg font-poppins font-bold text-gray-800 mt-0.5 capitalize">
                      {selectedEsc.tier} Tier
                    </span>
                  </div>

                  <div className="bg-[#EEF1FB]/30 p-3.5 rounded-xl border border-[#EEF1FB] flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Outreach Assigned</span>
                    <span className="text-xs font-bold text-gray-700 mt-1.5 flex items-center gap-1">
                      {selectedEsc.assigned_counsellor ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Managed by you
                        </>
                      ) : (
                        'Unassigned'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Privacy Warning */}
              <div className="bg-amber-50/50 p-4 border border-amber-100 rounded-xl text-xs text-amber-800 leading-relaxed flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">Student Confidentiality Enforced</span>
                  <span>In compliance with privacy policies, raw chat content is strictly hidden. Outreaching requires checking on the student via direct communication or our secure portal below.</span>
                </div>
              </div>

              {/* Outreach reply form */}
              <form onSubmit={handleSendOutreach} className="flex flex-col gap-4 mt-auto">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-[#3E5FE0]" /> Outreach Message
                  </label>
                  <textarea
                    placeholder="Write a supportive, non-clinical outreach message. E.g. 'Hey Rahul, noticed you were feeling a bit heavy today. Let me know if you would like to schedule a virtual session to vent.'"
                    value={outreachText}
                    onChange={(e) => setOutreachText(e.target.value)}
                    required
                    className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5FE0] resize-none"
                  />
                </div>

                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleMarkContacted(selectedEsc.id)}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
                  >
                    Mark as Contacted (Offline)
                  </button>

                  <button
                    type="submit"
                    disabled={sendingOutreach || !outreachText.trim()}
                    className="px-6 py-2.5 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:bg-gray-200 disabled:shadow-none"
                  >
                    {sendingOutreach ? 'Sending...' : 'Send Outreach'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2 text-gray-400">
              <Users className="w-10 h-10 text-gray-300" />
              <p className="text-sm font-semibold">No Client selected</p>
              <p className="text-xs max-w-xs leading-relaxed">Select a student alert card on the left panel to review client indices, update status, or dispatch outreach templates.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
