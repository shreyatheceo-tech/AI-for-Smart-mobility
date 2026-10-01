export type PriorityType = 'fastest' | 'cheapest' | 'eco' | 'safer' | 'accessible';

export type TransportMode = 'bus' | 'metro' | 'train' | 'car' | 'walk' | 'cycle' | 'multimodal';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteStep {
  id: string;
  mode: TransportMode;
  instruction: string;
  durationMin: number;
  distanceMeters: number;
  from?: string;
  to?: string;
  lineOrRouteNumber?: string;
}

export interface ScoreBreakdown {
  timeScore: number;
  costScore: number;
  co2Score: number;
  safetyScore: number;
  accessibilityScore: number;
  compositeScore: number;
}

export interface MobilityOption {
  id: string;
  mode: TransportMode;
  title: string;
  subtitle: string;
  durationMin: number;
  cost: number;
  co2Grams: number;
  co2Level: 'Zero' | 'Low' | 'Moderate' | 'High';
  trafficImpact: 'None' | 'Low' | 'Moderate' | 'Heavy';
  trafficDelayMin: number;
  safetyScore: number;
  accessibilityScore: number;
  weatherSensitivity: 'Low' | 'Moderate' | 'High';
  caloriesBurned?: number;
  transfers: number;
  walkingDistanceMeters: number;
  steps: RouteStep[];
  pathCoordinates: LatLng[];
  scores: ScoreBreakdown;
  rank?: number;
}

export interface AiRecommendation {
  recommendedOptionId: string;
  recommendedMode: TransportMode;
  headline: string;
  explanation: string;
  tradeOffSummary: string;
  priorityAlignmentNote: string;
  weatherAdvisory?: string;
  accessibilityAdvice?: string;
  keyAdvantages: string[];
  watchOuts: string[];
}

export interface WeatherData {
  condition: 'Clear' | 'Partly Cloudy' | 'Light Rain' | 'Heavy Rain' | 'Sunny';
  temperatureC: number;
  humidityPercent: number;
  precipitationChance: number;
  windSpeedKmh: number;
  advisory: string;
}

export interface UserPreferences {
  userId: string;
  primaryPriority: PriorityType;
  priorityWeights: {
    time: number;
    cost: number;
    co2: number;
    safety: number;
    accessibility: number;
  };
  accessibilityNeeds: string[];
  preferredModes: TransportMode[];
  maxWalkMeters: number;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  preferences?: UserPreferences;
}

export interface Journey {
  id: string;
  userId?: string | null;
  origin: string;
  destination: string;
  originCoords?: LatLng | null;
  destinationCoords?: LatLng | null;
  departureTime: string;
  primaryPriority: PriorityType;
  rawOptions: MobilityOption[];
  aiRecommendation: AiRecommendation;
  explanation: string;
  createdAt: string;
}

export interface MobilityAnalysisResponse {
  success: boolean;
  origin: string;
  destination: string;
  originCoords: LatLng;
  destinationCoords: LatLng;
  departureTime: string;
  primaryPriority: PriorityType;
  weather: WeatherData;
  options: MobilityOption[];
  recommendation: AiRecommendation;
}

export interface ParsedTravelIntent {
  origin: string;
  destination: string;
  primaryPriority: PriorityType;
  selectedPriorities: PriorityType[];
  accessibilityNeeds: string[];
  departureTime?: string;
  preferredModes?: TransportMode[];
  clarification?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
  quickAction?: {
    type: 'PLAN_ROUTE';
    origin: string;
    destination: string;
    priority?: PriorityType;
  };
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  suggestedPrompts: string[];
  quickAction?: {
    type: 'PLAN_ROUTE';
    origin: string;
    destination: string;
    priority?: PriorityType;
  };
}

