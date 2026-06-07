import type { DomainCategory } from '../types';

// ─── Domain Categories ─────────────────────────────────────
export const DOMAIN_CATEGORIES: DomainCategory[] = [
  { id: 'Technology',  label: 'Technology',      icon: '💻', description: 'AI, Software, Hardware & Digital' },
  { id: 'Climate',     label: 'Climate Change',  icon: '🌍', description: 'Environment, Energy & Sustainability' },
  { id: 'Society',     label: 'Society & Culture', icon: '👥', description: 'Demographics, Trends & Lifestyle' },
  { id: 'Business',    label: 'Business',        icon: '💼', description: 'Innovation, Finance & Markets' },
  { id: 'Healthcare',  label: 'Health & Med',     icon: '🏥', description: 'Medicine, Biotech & Wellness' },
];

// ─── Avatar Presets ─────────────────────────────────────────
export const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Trendexplorer',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Archimedes',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Lovelace',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Newton',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Curie',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Tesla',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Darwin',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Hawking',
];

// ─── Loading Stages ─────────────────────────────────────────
export const LOADING_STAGES = [
  { duration: 1500, message: '🔍 Scanning market signals...',  pct: 15 },
  { duration: 2000, message: '🧠 Running AI analysis...',      pct: 40 },
  { duration: 1500, message: '📊 Building projections...',     pct: 70 },
  { duration: 1000, message: '✨ Preparing your report...',    pct: 90 },
  { duration: 500,  message: '✅ Almost done!',                pct: 100 },
];

// ─── Chart Colors ───────────────────────────────────────────
export const CHART_COLORS = ['#0EA5E9', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// ─── Suggested Topics ───────────────────────────────────────
export const SUGGESTED_TOPICS = [
  'Sovereign AI Labs',
  'Virtual Workspace Haptics',
  'DeFi Yield Auditing',
  'Carbon Capture Scaling',
  'Sodium-ion Grid Battery',
];
