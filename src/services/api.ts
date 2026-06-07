// ─── Centralized API Service ────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem('trendvision_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Auth ───────────────────────────────────────────────────
export async function login(email: string, password: string) {
  return request<{ token: string; user: any }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(username: string, email: string, password: string) {
  return request<{ token: string; user: any }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function fetchCurrentUser() {
  return request<{ user: any }>('/api/auth/me');
}

// ─── Profile ────────────────────────────────────────────────
export async function updateProfile(data: {
  username?: string;
  profilePicture?: string;
  themePreference?: string;
}) {
  return request<{ success: boolean; user: any }>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Predictions ────────────────────────────────────────────
export async function createPrediction(query: string, category: string, model: string) {
  return request<{ prediction: any; notice?: string }>('/api/predict', {
    method: 'POST',
    body: JSON.stringify({ query, category, model }),
  });
}

export async function comparePredictions(queryA: string, queryB: string, category: string, model: string) {
  return request<{ predictionA: any; predictionB: any; notice?: string }>('/api/predict/compare', {
    method: 'POST',
    body: JSON.stringify({ queryA, queryB, category, model }),
  });
}

export async function fetchPredictions(category?: string, search?: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (category && category !== 'all') params.set('category', category);
  if (search) params.set('search', search);
  return request<{ predictions: any[], total: number, page: number, totalPages: number }>(`/api/predictions?${params.toString()}`);
}

export async function deletePrediction(id: string) {
  return request<{ success: boolean }>(`/api/predictions/${id}`, { method: 'DELETE' });
}

// ─── Dashboard Stats ────────────────────────────────────────
export async function fetchDashboardStats() {
  return request<any>('/api/stats');
}

export async function fetchHeatmap() {
  return request<{ heatmap: any[]; mostActiveDay: any }>('/api/stats/heatmap');
}
export async function fetchModels() {
  return request<{ models: { name: string; description: string; autoSelectable: boolean; supported: boolean }[] }>('/api/models');
}

export async function validateInput(query: string) {
  return request<{ valid: boolean; message: string; warnings: string[] }>('/api/validate-input', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

export async function validateDataset(rows: any[]) {
  return request<{ valid: boolean; rowCount: number; columnCount: number; missingRate: number; duplicateCount: number; warnings: string[]; qualityScore: number; metadata: any }>('/api/datasets/validate', {
    method: 'POST',
    body: JSON.stringify({ rows }),
  });
}
// ─── Watchlist ──────────────────────────────────────────────
export async function fetchWatchlist() {
  return request<{ watchlist: any[] }>('/api/watchlist');
}

export async function addToWatchlist(query: string, category: string) {
  return request<{ watchlistItem: any }>('/api/watchlist', {
    method: 'POST',
    body: JSON.stringify({ query, category }),
  });
}

export async function removeFromWatchlist(id: string) {
  return request<{ success: boolean }>(`/api/watchlist/${id}`, { method: 'DELETE' });
}
