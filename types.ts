
export enum MoodType {
  Happy = 'Happy',
  Calm = 'Calm',
  Tired = 'Tired',
  Sad = 'Sad',
  Anxious = 'Anxious'
}

export type UserRole = 'protected' | 'protector';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  joinedDate: number;
  role: UserRole;
  pairId?: string; // Links two users together
}

export interface PairingSession {
  id: string; // The shared Code
  userA: string; // ID of creator
  userB?: string; // ID of joiner
  created: number;
}

export interface LocationData {
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  batteryLevel?: number;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  type: 'General' | 'Allergy' | 'Prescription' | 'Doctor';
  attachmentUrl?: string;
}

export interface UserSettings {
  name: string;
  partnerName: string;
  emergencyContact: string;
  pin: string;
  darkMode: boolean;
  cycleLength: number;
  lastPeriodDate: string;
  isPeriodTrackingEnabled: boolean;
}

export interface DailyLog {
  userId: string;
  date: string;
  waterIntake: number;
  mood: MoodType | null;
  sleepHours: number;
  medicationsTaken: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  sender: 'user' | 'partner';
  timestamp: number;
  isReal: boolean; // True if from human partner, False if AI
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: number;
  content: string;
  mood: MoodType;
  title: string;
}

export interface Moment {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  date: number;
}
