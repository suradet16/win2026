// ============================================
// Win 2026 Life OS - Domain Types
// ============================================

// User Profile (Strategy Layer)
export interface UserProfile {
  id: string;
  user_id: string;
  vision: string | null;
  win_metrics: string | null;
  primary_skill: string | null;
  non_negotiables: string | null;
  created_at: string;
  updated_at: string;
}

// Daily Execution Record
export interface DailyExecution {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  deep_work: boolean;
  ship: boolean;
  health_min: boolean;
  bad_day: boolean;
  output_name: string | null;
  noise: string | null;
  tomorrow_focus: string | null;
  relates_to_one_thing: boolean;
  created_at: string;
  updated_at: string;
}

// Weekly Review Record
export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start_date: string; // YYYY-MM-DD (Monday)
  one_thing: string | null;
  win_condition: string | null;
  win_reason: string | null;
  lose_reason: string | null;
  cut_next: string | null;
  outputs: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Computed/Derived Types
// ============================================

// Today's Status (for Dashboard)
export interface TodayStats {
  deep_work: boolean;
  ship: boolean;
  health_min: boolean;
  tomorrow_focus: string | null;
}

// Week Stats (for Dashboard Win Rate)
export interface WeekStats {
  deepWorkRate: number;
  shipCount: number;
  healthRate: number;
  // Win Rate breakdown
  totalDays: number;
  activeDays: number; // days that are not bad_day
  shipDays: number;
  deepWorkDays: number;
  healthDays: number;
}

// Warning Signals (consecutive days without action)
export interface WarningSignals {
  shipStreak: number;
  deepWorkStreak: number;
  healthStreak: number;
  badDayStreak: number;
}

// ============================================
// Form Types (for UI state)
// ============================================

export interface DailyForm {
  deep_work: boolean;
  ship: boolean;
  health_min: boolean;
  bad_day: boolean;
  output_name: string;
  noise: string;
  tomorrow_focus: string;
  relates_to_one_thing: boolean;
}

export interface WeeklyForm {
  one_thing: string;
  win_condition: string;
  win_reason: string;
  lose_reason: string;
  cut_next: string;
  outputs: string;
}

export interface ProfileForm {
  vision: string;
  win_metrics: string;
  primary_skill: string;
  non_negotiables: string;
}

// ============================================
// Alert/Message Types
// ============================================

export type AlertTone = 'success' | 'error' | 'info';

export interface AlertMessage {
  tone: AlertTone;
  text: string;
}

// ============================================
// Navigation Types
// ============================================

export type NavKey = 'dashboard' | 'daily' | 'weekly' | 'history' | 'profile' | 'settings';

export interface NavItem {
  key: NavKey;
  label: string;
  to: string;
  icon: string;
}
