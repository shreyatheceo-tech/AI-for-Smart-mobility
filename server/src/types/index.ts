import { z } from 'zod';

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
  timeScore: number;         // 0 - 100 (higher = faster)
  costScore: number;         // 0 - 100 (higher = cheaper)
  co2Score: number;          // 0 - 100 (higher = greener)
  safetyScore: number;       // 0 - 100 (higher = safer)
  accessibilityScore: number;// 0 - 100 (higher = more accessible)
  compositeScore: number;    // Weighted combination 0 - 100
}

export interface MobilityOption {
  id: string;
  mode: TransportMode;
  title: string;
  subtitle: string;
  durationMin: number;
  cost: number;              // In INR (₹)
  co2Grams: number;          // Total grams CO2 emitted
  co2Level: 'Zero' | 'Low' | 'Moderate' | 'High';
  trafficImpact: 'None' | 'Low' | 'Moderate' | 'Heavy';
  trafficDelayMin: number;
  safetyScore: number;       // 1 - 100
  accessibilityScore: number;// 1 - 100
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
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
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

// ------------------- ZOD SCHEMAS ------------------- //

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const priorityWeightsSchema = z.object({
  time: z.number().min(0).max(1),
  cost: z.number().min(0).max(1),
  co2: z.number().min(0).max(1),
  safety: z.number().min(0).max(1),
  accessibility: z.number().min(0).max(1),
});

export const updatePreferencesSchema = z.object({
  primaryPriority: z.enum(['fastest', 'cheapest', 'eco', 'safer', 'accessible']),
  priorityWeights: priorityWeightsSchema.optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
  preferredModes: z.array(z.enum(['bus', 'metro', 'train', 'car', 'walk', 'cycle', 'multimodal'])).optional(),
  maxWalkMeters: z.number().int().min(100).max(10000).optional(),
});

export const mobilitySearchSchema = z.object({
  origin: z.string().min(2, 'Origin location is required'),
  destination: z.string().min(2, 'Destination location is required'),
  originCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  destinationCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  departureTime: z.string().optional(),
  primaryPriority: z.enum(['fastest', 'cheapest', 'eco', 'safer', 'accessible']).default('fastest'),
  selectedPriorities: z.array(z.enum(['fastest', 'cheapest', 'eco', 'safer', 'accessible'])).optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
  maxWalkMeters: z.number().optional(),
  preferredModes: z.array(z.enum(['bus', 'metro', 'train', 'car', 'walk', 'cycle', 'multimodal'])).optional(),
});

export const naturalLanguageSearchSchema = z.object({
  query: z.string().min(3, 'Search query must be at least 3 characters'),
});

export const saveJourneySchema = z.object({
  origin: z.string(),
  destination: z.string(),
  originCoords: z.object({ lat: z.number(), lng: z.number() }).optional().nullable(),
  destinationCoords: z.object({ lat: z.number(), lng: z.number() }).optional().nullable(),
  departureTime: z.string(),
  primaryPriority: z.enum(['fastest', 'cheapest', 'eco', 'safer', 'accessible']),
  rawOptions: z.array(z.any()),
  aiRecommendation: z.any(),
  explanation: z.string(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        text: z.string(),
      })
    )
    .optional(),
  context: z
    .object({
      origin: z.string().optional(),
      destination: z.string().optional(),
      activePriority: z.string().optional(),
    })
    .optional(),
});

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatResponse {
  reply: string;
  suggestedPrompts: string[];
  quickAction?: {
    type: 'PLAN_ROUTE';
    origin: string;
    destination: string;
    priority?: PriorityType;
  };
}

