import {
  Journey,
  MobilityAnalysisResponse,
  ParsedTravelIntent,
  PriorityType,
  User,
  UserPreferences,
  ChatResponse,
} from '../types/index.js';

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  ((import.meta as any).env?.VITE_API_URL as string) ||
  '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('mobimind_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('mobimind_auth_token', token);
  } else {
    localStorage.removeItem('mobimind_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    const text = await response.text().catch(() => '');
    data = { message: text || `Request failed with status ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async register(fullName: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  logout() {
    setAuthToken(null);
  },

  // Preferences
  async getPreferences(): Promise<{ preferences: UserPreferences }> {
    return request<{ preferences: UserPreferences }>('/preferences');
  },

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<{ preferences: UserPreferences }> {
    return request<{ preferences: UserPreferences }>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  },

  // Mobility
  async analyze(params: {
    origin: string;
    destination: string;
    departureTime?: string;
    primaryPriority: PriorityType;
    selectedPriorities?: PriorityType[];
    accessibilityNeeds?: string[];
    maxWalkMeters?: number;
    preferredModes?: string[];
  }): Promise<MobilityAnalysisResponse> {
    return request<MobilityAnalysisResponse>('/mobility/analyze', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async parseIntent(query: string): Promise<{ parsed: ParsedTravelIntent }> {
    return request<{ parsed: ParsedTravelIntent }>('/mobility/parse-intent', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  async getWeather(departureTime?: string): Promise<{ weather: any }> {
    const query = departureTime ? `?departureTime=${encodeURIComponent(departureTime)}` : '';
    return request<{ weather: any }>(`/mobility/weather${query}`);
  },

  // Journeys
  async saveJourney(journeyData: {
    origin: string;
    destination: string;
    originCoords?: any;
    destinationCoords?: any;
    departureTime: string;
    primaryPriority: PriorityType;
    rawOptions: any[];
    aiRecommendation: any;
    explanation: string;
  }): Promise<{ journey: Journey }> {
    return request<{ journey: Journey }>('/journeys', {
      method: 'POST',
      body: JSON.stringify(journeyData),
    });
  },

  async getJourneys(): Promise<{ journeys: Journey[] }> {
    return request<{ journeys: Journey[] }>('/journeys');
  },

  async getJourneyById(id: string): Promise<{ journey: Journey }> {
    return request<{ journey: Journey }>(`/journeys/${id}`);
  },

  async deleteJourney(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/journeys/${id}`, {
      method: 'DELETE',
    });
  },

  // AI Assistant Chat
  async chat(params: {
    message: string;
    history?: { role: 'user' | 'model'; text: string }[];
    context?: {
      origin?: string;
      destination?: string;
      activePriority?: string;
      currentRouteTitle?: string;
    };
  }): Promise<ChatResponse> {
    return request<ChatResponse>('/mobility/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
