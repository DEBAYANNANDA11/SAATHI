import { createClient } from '@supabase/supabase-js';

// Types representing database tables
export interface UserProfile {
  id: string;
  full_name: string;
  role: 'user' | 'counsellor' | 'admin';
  language: string;
  consent_text: boolean;
  consent_voice: boolean;
  consent_video: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_opt_in: boolean;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  type: 'chat' | 'journal' | 'voice';
  content: string;
  sentiment_score: number; // between -1.0 and 1.0
  created_at: string;
}

export interface DistressScore {
  id: string;
  user_id: string;
  score: number; // 0 to 100
  tier: 'low' | 'moderate' | 'high';
  explanation: string;
  computed_at: string;
}

export interface Escalation {
  id: string;
  user_id: string;
  tier: 'moderate' | 'high';
  status: 'pending' | 'contacted' | 'resolved';
  assigned_counsellor?: string;
  created_at: string;
  updated_at: string;
  // Join fields for UI helper
  user_name?: string;
}

// 1. Detect if Supabase is properly configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isMockMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-supabase') ||
  supabaseAnonKey.includes('your-supabase');

// Export native client (only active in non-mock mode)
export const supabase = !isMockMode ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ==========================================
// MOCK LOCALSTORAGE DATABASE IMPLEMENTATION
// ==========================================

const MOCK_PROFILES_KEY = 'saathi_mock_profiles';
const MOCK_ENTRIES_KEY = 'saathi_mock_entries';
const MOCK_SCORES_KEY = 'saathi_mock_scores';
const MOCK_ESCALATIONS_KEY = 'saathi_mock_escalations';

// Default Seed Data
const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-id-1',
    full_name: 'Rahul Sharma',
    role: 'user',
    language: 'en',
    consent_text: true,
    consent_voice: false,
    consent_video: false,
    emergency_contact_name: 'Amit Sharma (Father)',
    emergency_contact_phone: '+91 9876543210',
    emergency_contact_opt_in: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-id-2',
    full_name: 'Priya Patel',
    role: 'user',
    language: 'hi',
    consent_text: true,
    consent_voice: false,
    consent_video: false,
    emergency_contact_name: 'Rita Patel (Mother)',
    emergency_contact_phone: '+91 9988776655',
    emergency_contact_opt_in: false,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'counsellor-id-1',
    full_name: 'Dr. Aditi Rao',
    role: 'counsellor',
    language: 'en',
    consent_text: true,
    consent_voice: true,
    consent_video: true,
    emergency_contact_opt_in: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'counsellor-id-2',
    full_name: 'Prof. Rajesh Kumar',
    role: 'counsellor',
    language: 'hi',
    consent_text: true,
    consent_voice: true,
    consent_video: true,
    emergency_contact_opt_in: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'admin-id-1',
    full_name: 'Vikram Singh',
    role: 'admin',
    language: 'en',
    consent_text: true,
    consent_voice: true,
    consent_video: true,
    emergency_contact_opt_in: false,
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Generate last 30 days of mock distress scores for Rahul Sharma
const generateMockScores = (userId: string): DistressScore[] => {
  const scores: DistressScore[] = [];
  const baseDate = Date.now();
  
  // High distress 2 weeks ago, recovering now
  for (let i = 29; i >= 0; i--) {
    const timestamp = new Date(baseDate - i * 24 * 60 * 60 * 1000).toISOString();
    let score = 30; // base low score
    
    // Simulate a peak in distress around day 12-16
    if (i >= 12 && i <= 17) {
      score = 75 - (i - 12) * 5 + Math.floor(Math.random() * 8); // Moderate/High distress
    } else if (i > 17) {
      score = 45 + Math.floor(Math.random() * 15); // Moderate recovery period
    } else {
      score = 25 + Math.floor(Math.random() * 10); // low distress lately
    }
    
    let tier: 'low' | 'moderate' | 'high' = 'low';
    if (score >= 75) tier = 'high';
    else if (score >= 40) tier = 'moderate';

    scores.push({
      id: `score-mock-${i}`,
      user_id: userId,
      score,
      tier,
      explanation: tier === 'high' 
        ? 'Significantly elevated distress indicators based on expressive content' 
        : tier === 'moderate' 
          ? 'Mild signs of stress and fatigue in messages' 
          : 'Low indicators of emotional distress detected',
      computed_at: timestamp
    });
  }
  return scores;
};

const generateMockEntries = (userId: string): Entry[] => {
  const entries: Entry[] = [];
  const baseDate = Date.now();
  
  const sampleTexts = [
    { content: "Had a great walk outside today. Felt refreshing.", score: 0.8 },
    { content: "A bit tired but mostly doing okay with tasks.", score: 0.2 },
    { content: "Feeling extremely overwhelmed with tests coming up. Too much work.", score: -0.6 },
    { content: "I feel very lonely today. Nobody is answering my calls. I just want to sleep.", score: -0.8 },
    { content: "Spoke with my dad. Feeling slightly better but still anxious.", score: -0.1 },
    { content: "Did a breathing session, it helped calm my heart rate.", score: 0.5 },
  ];

  sampleTexts.forEach((item, index) => {
    entries.push({
      id: `entry-mock-${index}`,
      user_id: userId,
      type: index % 2 === 0 ? 'chat' : 'journal',
      content: item.content,
      sentiment_score: item.score,
      created_at: new Date(baseDate - (5 - index) * 2 * 24 * 60 * 60 * 1000).toISOString()
    });
  });

  return entries;
};

const DEFAULT_ESCALATIONS: Escalation[] = [
  {
    id: 'esc-mock-1',
    user_id: 'user-id-2',
    tier: 'moderate',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Helper to initialize local storage data if empty
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize localStorage DB
export const initMockDb = () => {
  if (typeof window === 'undefined') return;
  
  // Seed profiles if missing
  getStorageItem(MOCK_PROFILES_KEY, DEFAULT_PROFILES);
  
  // Seed entries & scores for Rahul Sharma (user-id-1)
  const existingEntries = localStorage.getItem(MOCK_ENTRIES_KEY);
  if (!existingEntries) {
    const entries = [...generateMockEntries('user-id-1')];
    setStorageItem(MOCK_ENTRIES_KEY, entries);
  }
  
  const existingScores = localStorage.getItem(MOCK_SCORES_KEY);
  if (!existingScores) {
    const scores = [...generateMockScores('user-id-1')];
    setStorageItem(MOCK_SCORES_KEY, scores);
  }

  // Seed escalations
  getStorageItem(MOCK_ESCALATIONS_KEY, DEFAULT_ESCALATIONS);
};

// Database API router
export const db = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isMockMode) {
      initMockDb();
      const profiles = getStorageItem<UserProfile[]>(MOCK_PROFILES_KEY, DEFAULT_PROFILES);
      return profiles.find(p => p.id === userId) || null;
    }
    try {
      const { data, error } = await supabase!
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.warn('getProfile notice:', error.message);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    if (isMockMode) {
      initMockDb();
      const profiles = getStorageItem<UserProfile[]>(MOCK_PROFILES_KEY, DEFAULT_PROFILES);
      const index = profiles.findIndex(p => p.id === userId);
      if (index === -1) return null;
      profiles[index] = { ...profiles[index], ...data };
      setStorageItem(MOCK_PROFILES_KEY, profiles);
      return profiles[index];
    }
    try {
      const { data: updated, error } = await supabase!
        .from('users_profile')
        .update(data)
        .eq('id', userId)
        .select()
        .maybeSingle();
      if (error) {
        console.warn('updateProfile notice:', error.message);
        return null;
      }
      return updated;
    } catch {
      return null;
    }
  },

  async createProfile(profile: UserProfile): Promise<UserProfile> {
    if (isMockMode) {
      initMockDb();
      const profiles = getStorageItem<UserProfile[]>(MOCK_PROFILES_KEY, DEFAULT_PROFILES);
      if (!profiles.some(p => p.id === profile.id)) {
        profiles.push(profile);
        setStorageItem(MOCK_PROFILES_KEY, profiles);
      }
      return profile;
    }
    try {
      const { data, error } = await supabase!
        .from('users_profile')
        .upsert(profile, { onConflict: 'id' })
        .select()
        .maybeSingle();
      if (error) {
        // If RLS prevents client insertion, don't crash the user session; return the valid in-memory profile
        console.warn('Profile upsert RLS warning (fallback to session profile):', error.message);
        return profile;
      }
      return data || profile;
    } catch (err: any) {
      console.warn('createProfile exception (fallback to session profile):', err?.message);
      return profile;
    }
  },

  // Entries
  async getEntries(userId: string, type?: 'chat' | 'journal' | 'voice'): Promise<Entry[]> {
    if (isMockMode) {
      initMockDb();
      const entries = getStorageItem<Entry[]>(MOCK_ENTRIES_KEY, []);
      let filtered = entries.filter(e => e.user_id === userId);
      if (type) {
        filtered = filtered.filter(e => e.type === type);
      }
      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    let query = supabase!
      .from('entries')
      .select('*')
      .eq('user_id', userId);
    if (type) {
      query = query.eq('type', type);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  async createEntry(userId: string, type: 'chat' | 'journal' | 'voice', content: string, sentimentScore: number): Promise<Entry> {
    const newEntry: Entry = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      user_id: userId,
      type,
      content,
      sentiment_score: sentimentScore,
      created_at: new Date().toISOString()
    };

    if (isMockMode) {
      initMockDb();
      const entries = getStorageItem<Entry[]>(MOCK_ENTRIES_KEY, []);
      entries.push(newEntry);
      setStorageItem(MOCK_ENTRIES_KEY, entries);
      return newEntry;
    }

    const { data, error } = await supabase!
      .from('entries')
      .insert(newEntry)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Distress Scores
  async getDistressScores(userId: string): Promise<DistressScore[]> {
    if (isMockMode) {
      initMockDb();
      const scores = getStorageItem<DistressScore[]>(MOCK_SCORES_KEY, []);
      return scores
        .filter(s => s.user_id === userId)
        .sort((a, b) => new Date(a.computed_at).getTime() - new Date(b.computed_at).getTime()); // chronological for chart
    }
    const { data, error } = await supabase!
      .from('distress_scores')
      .select('*')
      .eq('user_id', userId)
      .order('computed_at', { ascending: true });
    if (error) return [];
    return data || [];
  },

  async getLatestDistressScore(userId: string): Promise<DistressScore> {
    const scores = await this.getDistressScores(userId);
    if (scores.length > 0) {
      return scores[scores.length - 1];
    }
    // For new users with no history, baseline distress index is strictly 0
    return {
      id: 'default-zero-' + userId,
      user_id: userId,
      score: 0,
      tier: 'low',
      explanation: 'Initial emotional baseline: 0% distress. Ready for first scan or check-in.',
      computed_at: new Date().toISOString()
    };
  },

  async createDistressScore(userId: string, score: number, tier: 'low' | 'moderate' | 'high', explanation: string): Promise<DistressScore> {
    const newScore: DistressScore = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      user_id: userId,
      score: Math.max(0, Math.min(100, Math.round(score))),
      tier,
      explanation,
      computed_at: new Date().toISOString()
    };

    // Cache latest score locally for instantaneous multi-tab and multi-page linking
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`saathi_latest_distress_${userId}`, JSON.stringify(newScore));
        window.dispatchEvent(new CustomEvent('saathi-distress-updated', { detail: newScore }));
      } catch (e) {}
    }

    if (isMockMode) {
      initMockDb();
      const scores = getStorageItem<DistressScore[]>(MOCK_SCORES_KEY, []);
      scores.push(newScore);
      setStorageItem(MOCK_SCORES_KEY, scores);

      // On moderate/high, auto-trigger escalation in mock
      if (tier === 'moderate' || tier === 'high') {
        await this.createEscalation(userId, tier);
      }

      return newScore;
    }

    const { data, error } = await supabase!
      .from('distress_scores')
      .insert(newScore)
      .select()
      .single();
    if (error) throw error;

    // Trigger escalation row insertion
    if (tier === 'moderate' || tier === 'high') {
      await this.createEscalation(userId, tier);
    }

    return data;
  },

  // Escalations
  async getEscalations(): Promise<Escalation[]> {
    if (isMockMode) {
      initMockDb();
      const escalations = getStorageItem<Escalation[]>(MOCK_ESCALATIONS_KEY, DEFAULT_ESCALATIONS);
      const profiles = getStorageItem<UserProfile[]>(MOCK_PROFILES_KEY, DEFAULT_PROFILES);
      
      // Map user names for convenience
      return escalations.map(esc => {
        const user = profiles.find(p => p.id === esc.user_id);
        return {
          ...esc,
          user_name: user ? user.full_name : 'Anonymous User'
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const { data, error } = await supabase!
      .from('escalations')
      .select(`
        *,
        users_profile!user_id ( full_name )
      `)
      .order('created_at', { ascending: false });

    if (error) return [];
    
    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      tier: item.tier,
      status: item.status,
      assigned_counsellor: item.assigned_counsellor,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user_name: item.users_profile ? item.users_profile.full_name : 'Anonymous User'
    }));
  },

  async createEscalation(userId: string, tier: 'moderate' | 'high'): Promise<Escalation> {
    const newEsc: Escalation = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      user_id: userId,
      tier,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isMockMode) {
      initMockDb();
      const escalations = getStorageItem<Escalation[]>(MOCK_ESCALATIONS_KEY, DEFAULT_ESCALATIONS);
      // Check if there is already a pending escalation for this user
      const existing = escalations.find(e => e.user_id === userId && e.status === 'pending');
      if (existing) {
        existing.tier = tier; // upgrade if necessary
        existing.updated_at = new Date().toISOString();
        setStorageItem(MOCK_ESCALATIONS_KEY, escalations);
        return existing;
      }
      escalations.push(newEsc);
      setStorageItem(MOCK_ESCALATIONS_KEY, escalations);
      return newEsc;
    }

    // Check existing pending escalations
    const { data: existing } = await supabase!
      .from('escalations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase!
        .from('escalations')
        .update({ tier, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }

    const { data, error } = await supabase!
      .from('escalations')
      .insert(newEsc)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateEscalation(escalationId: string, updates: Partial<Escalation>): Promise<Escalation | null> {
    if (isMockMode) {
      initMockDb();
      const escalations = getStorageItem<Escalation[]>(MOCK_ESCALATIONS_KEY, []);
      const index = escalations.findIndex(e => e.id === escalationId);
      if (index === -1) return null;
      escalations[index] = { 
        ...escalations[index], 
        ...updates, 
        updated_at: new Date().toISOString() 
      };
      setStorageItem(MOCK_ESCALATIONS_KEY, escalations);
      return escalations[index];
    }

    const { data, error } = await supabase!
      .from('escalations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', escalationId)
      .select()
      .single();
    if (error) return null;
    return data;
  },

  // Admin aggregates
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsersThisWeek: number;
    tier2PlusPercent: number;
    counsellorCount: number;
  }> {
    if (isMockMode) {
      initMockDb();
      const profiles = getStorageItem<UserProfile[]>(MOCK_PROFILES_KEY, DEFAULT_PROFILES);
      const escalations = getStorageItem<Escalation[]>(MOCK_ESCALATIONS_KEY, DEFAULT_ESCALATIONS);
      
      const totalUsers = profiles.filter(p => p.role === 'user').length;
      const activeUsersThisWeek = totalUsers; // all mock users
      const pendingEscCount = new Set(escalations.filter(e => e.status === 'pending').map(e => e.user_id)).size;
      const tier2PlusPercent = totalUsers > 0 ? Math.round((pendingEscCount / totalUsers) * 100) : 0;
      const counsellorCount = profiles.filter(p => p.role === 'counsellor').length;

      return {
        totalUsers,
        activeUsersThisWeek,
        tier2PlusPercent,
        counsellorCount
      };
    }

    // Direct aggregates from database
    const { count: totalUsers } = await supabase!
      .from('users_profile')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    const { count: activeCount } = await supabase!
      .from('users_profile')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user'); // demo simplifier

    const { count: pendingEsc } = await supabase!
      .from('escalations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: counsellorCount } = await supabase!
      .from('users_profile')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'counsellor');

    const total = totalUsers || 0;
    const esc = pendingEsc || 0;
    const tier2PlusPercent = total > 0 ? Math.round((esc / total) * 100) : 0;

    return {
      totalUsers: total,
      activeUsersThisWeek: activeCount || 0,
      tier2PlusPercent,
      counsellorCount: counsellorCount || 0
    };
  },

  async getCounsellors(): Promise<UserProfile[]> {
    if (isMockMode) {
      initMockDb();
      const profiles = getStorageItem<UserProfile[]>(MOCK_PROFILES_KEY, DEFAULT_PROFILES);
      return profiles.filter(p => p.role === 'counsellor');
    }
    const { data, error } = await supabase!
      .from('users_profile')
      .select('*')
      .eq('role', 'counsellor');
    if (error) return [];
    return data || [];
  }
};
