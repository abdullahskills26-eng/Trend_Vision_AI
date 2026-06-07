// ─── View & Navigation Types ────────────────────────────────
export type ViewName = 'dashboard' | 'predictor' | 'archive' | 'profile' | 'watchlist';
export type ThemeName = 'light' | 'dark' | 'gradient';

// ─── Toast ──────────────────────────────────────────────────
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ─── Domain Categories ─────────────────────────────────────
export interface DomainCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
}

// ─── Trend Prediction Types ─────────────────────────────────
export type Direction = 'rising' | 'falling' | 'stable';

export interface KeywordTrend {
  word: string;
  trend: Direction;
  weight: number;
}

export interface ForecastPoint {
  month: string;
  value: number;
  confidenceLower?: number;
  confidenceUpper?: number;
}

export interface ConfidenceIntervalPoint {
  month: string;
  lower: number;
  upper: number;
}

export interface ResidualPoint {
  month: string;
  residual: number;
}

export interface HistoricalPoint {
  year: string;
  interest: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export type ChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'scatter'
  | 'histogram'
  | 'heatmap'
  | 'box'
  | 'treemap'
  | 'radar'
  | 'confidence'
  | 'residual';

export interface TrendPrediction {
  id: string;
  userId?: string;
  query: string;
  category: string;
  direction: Direction;
  confidence: number;
  confidenceLower?: number;
  confidenceUpper?: number;
  riskLevel?: string;
  modelReason?: string;
  autoSelected?: boolean;
  summary: string;
  insights: string[];
  keywords: KeywordTrend[];
  forecastData: ForecastPoint[];
  historicalData: HistoricalPoint[];
  modelUsed: string;
  featureImportance?: FeatureImportanceItem[];
  forecastHorizon?: string;
  confidenceInterval?: ConfidenceIntervalPoint[];
  residuals?: ResidualPoint[];
  createdAt: string;
}

// ─── User Profile ───────────────────────────────────────────
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
  badges: string[];
  streak: number;
  predictionCount: number;
  themePreference: ThemeName;
}

// ─── Dashboard Stats ────────────────────────────────────────
export interface DashboardStats {
  predictionCount: number;
  streak: number;
  badges: string[];
  categorySplit: { name: string; count: number }[];
  modelUsage: { name: string; value: number; confidence: number }[];
  directionStats: { rising: number; falling: number; stable: number };
  recentActivities: ActivityLog[];
}

// ─── Activity Log ───────────────────────────────────────────
export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
}

// ─── Watchlist ──────────────────────────────────────────────
export interface WatchlistItem {
  id: string;
  userId: string;
  query: string;
  category: string;
  addedAt: string;
  lastChecked: string | null;
}

// ─── Heatmap ────────────────────────────────────────────────
export interface HeatmapEntry {
  date: string;
  count: number;
}
