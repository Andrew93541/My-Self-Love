
import { DailyLog, MedicalRecord, UserSettings, ChatMessage, DiaryEntry, Moment, PairingSession, LocationData } from '../types';

const KEYS = {
  SETTINGS: 'mysafelove_settings_',
  MEDICAL: 'mysafelove_medical_',
  LOGS: 'mysafelove_logs_',
  CHAT: 'mysafelove_chat_',
  DIARY: 'mysafelove_diary_',
  MOMENTS: 'mysafelove_moments_',
  PAIRS: 'mysafelove_pairs',
  LOCATION: 'mysafelove_location_',
};

// --- Real-time Simulation Helper ---
// This triggers an event so other tabs/windows update immediately
const triggerUpdate = (key: string) => {
  window.dispatchEvent(new Event('storage'));
  // Also manually trigger for the same tab
  window.dispatchEvent(new CustomEvent('localDataUpdated', { detail: { key } }));
};

// --- Pairing System ---
export const createPairingCode = (userId: string): string => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const pairs = getPairs();
  pairs[code] = { id: code, userA: userId, created: Date.now() };
  localStorage.setItem(KEYS.PAIRS, JSON.stringify(pairs));
  triggerUpdate(KEYS.PAIRS);
  return code;
};

export const joinPair = (userId: string, code: string): boolean => {
  const pairs = getPairs();
  const session = pairs[code];
  if (session && !session.userB && session.userA !== userId) {
    session.userB = userId;
    localStorage.setItem(KEYS.PAIRS, JSON.stringify(pairs));
    triggerUpdate(KEYS.PAIRS);
    return true;
  }
  return false;
};

export const getPairs = (): Record<string, PairingSession> => {
  const stored = localStorage.getItem(KEYS.PAIRS);
  return stored ? JSON.parse(stored) : {};
};

export const getMyPair = (userId: string): PairingSession | null => {
  const pairs = getPairs();
  return Object.values(pairs).find(p => p.userA === userId || p.userB === userId) || null;
};

// --- Location Sharing ---
export const updateLocation = (userId: string, lat: number, lng: number) => {
  const data: LocationData = {
    userId,
    latitude: lat,
    longitude: lng,
    timestamp: Date.now(),
    batteryLevel: (navigator as any).getBattery ? 100 : undefined // simplified
  };
  localStorage.setItem(KEYS.LOCATION + userId, JSON.stringify(data));
  triggerUpdate(KEYS.LOCATION + userId);
};

export const getPartnerLocation = (partnerId: string): LocationData | null => {
  const stored = localStorage.getItem(KEYS.LOCATION + partnerId);
  return stored ? JSON.parse(stored) : null;
};

// --- Settings ---
export const getSettings = (userId: string): UserSettings => {
  const stored = localStorage.getItem(KEYS.SETTINGS + userId);
  return stored ? JSON.parse(stored) : { 
    name: 'My Love', 
    partnerName: 'My Protector',
    emergencyContact: '', 
    pin: '', 
    darkMode: false,
    cycleLength: 28,
    lastPeriodDate: '',
    isPeriodTrackingEnabled: true
  };
};

export const saveSettings = (userId: string, settings: UserSettings) => {
  localStorage.setItem(KEYS.SETTINGS + userId, JSON.stringify(settings));
  triggerUpdate(KEYS.SETTINGS + userId);
};

// --- Medical ---
export const getMedicalRecords = (userId: string): MedicalRecord[] => {
  const stored = localStorage.getItem(KEYS.MEDICAL + userId);
  return stored ? JSON.parse(stored) : [];
};

export const addMedicalRecord = (userId: string, record: MedicalRecord) => {
  const records = getMedicalRecords(userId);
  localStorage.setItem(KEYS.MEDICAL + userId, JSON.stringify([record, ...records]));
  triggerUpdate(KEYS.MEDICAL + userId);
};

// --- Daily Logs ---
export const getTodayLog = (userId: string): DailyLog => {
  const today = new Date().toISOString().split('T')[0];
  const logsRaw = localStorage.getItem(KEYS.LOGS + userId);
  const logs: Record<string, DailyLog> = logsRaw ? JSON.parse(logsRaw) : {};
  
  if (!logs[today]) {
    return {
      userId,
      date: today,
      waterIntake: 0,
      mood: null,
      sleepHours: 0,
      medicationsTaken: false
    };
  }
  return logs[today];
};

export const saveTodayLog = (userId: string, log: DailyLog) => {
  const logsRaw = localStorage.getItem(KEYS.LOGS + userId);
  const logs: Record<string, DailyLog> = logsRaw ? JSON.parse(logsRaw) : {};
  logs[log.date] = log;
  localStorage.setItem(KEYS.LOGS + userId, JSON.stringify(logs));
  triggerUpdate(KEYS.LOGS + userId);
};

// --- Chat (Shared) ---
// If paired, we store chat under the PAIR ID, not User ID, so both see it.
const getChatKey = (userId: string) => {
    const pair = getMyPair(userId);
    return pair ? KEYS.CHAT + pair.id : KEYS.CHAT + userId;
};

export const getChatHistory = (userId: string): ChatMessage[] => {
  const key = getChatKey(userId);
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const addChatMessage = (userId: string, message: ChatMessage) => {
  const key = getChatKey(userId);
  const history = getChatHistory(userId);
  const newHistory = [...history, message].slice(-50);
  localStorage.setItem(key, JSON.stringify(newHistory));
  triggerUpdate(key);
};

// --- Diary ---
export const getDiaryEntries = (userId: string): DiaryEntry[] => {
    const stored = localStorage.getItem(KEYS.DIARY + userId);
    return stored ? JSON.parse(stored) : [];
};

export const addDiaryEntry = (userId: string, entry: DiaryEntry) => {
    const entries = getDiaryEntries(userId);
    localStorage.setItem(KEYS.DIARY + userId, JSON.stringify([entry, ...entries]));
    triggerUpdate(KEYS.DIARY + userId);
};

// --- Moments (Shared if paired) ---
// If paired, store moments under Pair ID
const getMomentsKey = (userId: string) => {
    const pair = getMyPair(userId);
    return pair ? KEYS.MOMENTS + pair.id : KEYS.MOMENTS + userId;
}

export const getMoments = (userId: string): Moment[] => {
    const key = getMomentsKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

export const addMoment = (userId: string, moment: Moment) => {
    const key = getMomentsKey(userId);
    const moments = getMoments(userId);
    localStorage.setItem(key, JSON.stringify([moment, ...moments]));
    triggerUpdate(key);
};
