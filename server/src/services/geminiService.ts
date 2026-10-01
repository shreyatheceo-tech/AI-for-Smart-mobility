import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import {
  AiRecommendation,
  MobilityOption,
  PriorityType,
  TransportMode,
  UserPreferences,
} from '../types/index.js';
import { getCurrentWeather } from './weatherService.js';

let genAI: GoogleGenerativeAI | null = null;
if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
}

// ----------------- HEURISTIC ADVISORY SYNTHESIS (FALLBACK / BASELINE) ----------------- //

function buildHeuristicRecommendation(
  origin: string,
  destination: string,
  primaryPriority: PriorityType,
  options: MobilityOption[],
  userPreferences?: UserPreferences | null
): AiRecommendation {
  if (options.length === 0) {
    throw new Error('No mobility options available to recommend.');
  }

  // Best option is ranked #1 by composite score
  const best = options[0];
  const carOption = options.find(o => o.mode === 'car') || options[options.length - 1];

  // Calculate comparative trade-offs versus car/taxi
  const costSavings = Math.max(0, carOption.cost - best.cost);
  const timeDifferenceMin = best.durationMin - carOption.durationMin;
  const co2SavingsGrams = Math.max(0, carOption.co2Grams - best.co2Grams);
  const co2SavingsKg = (co2SavingsGrams / 1000).toFixed(1);

  let headline = `Recommended: ${best.title}`;
  let explanation = '';
  let tradeOffSummary = '';
  let priorityAlignment = '';
  const keyAdvantages: string[] = [];
  const watchOuts: string[] = [];

  switch (primaryPriority) {
    case 'fastest':
      priorityAlignment = `Tailored for rapid transit with minimal dwell time and zero traffic bottleneck.`;
      if (best.mode === 'metro' || best.mode === 'multimodal') {
        explanation = `For your priority on speed, ${best.title} is your optimal choice. While road traffic introduces unpredictable congestion, this line runs on dedicated right-of-way, guaranteeing an arrival time of ~${best.durationMin} minutes.`;
      } else {
        explanation = `${best.title} delivers the shortest overall travel time (${best.durationMin} mins) from ${origin} to ${destination}.`;
      }
      break;

    case 'cheapest':
      priorityAlignment = `Engineered to minimize commuting expenses without severe time penalties.`;
      explanation = `At only ₹${best.cost}, ${best.title} provides unmatched value. Compared to cab or private auto, you retain 80-90% of your travel budget while traveling securely.`;
      break;

    case 'eco':
      priorityAlignment = `Maximum carbon efficiency: achieving near-zero footprint mobility.`;
      explanation = `By choosing ${best.title}, you produce merely ${best.co2Grams}g CO₂, preventing over ${co2SavingsKg} kg of greenhouse gas emissions compared to single-occupant road vehicles.`;
      break;

    case 'safer':
      priorityAlignment = `Prioritizing secure, well-monitored, well-lit urban transit corridors.`;
      explanation = `${best.title} holds a safety index of ${best.safetyScore}/100 with active staff surveillance, high footfall, and dedicated passenger emergency protocols.`;
      break;

    case 'accessible':
      priorityAlignment = `Step-free, barrier-free access with level boarding and tactile guidance.`;
      explanation = `${best.title} achieves a top accessibility score of ${best.accessibilityScore}/100, featuring elevator access, tactile paving, wheelchair-priority spaces, and wide boarding gates.`;
      break;
  }

  // Construct concrete trade-off sentence
  if (best.mode === 'car') {
    tradeOffSummary = `You arrive ${Math.abs(timeDifferenceMin)} minutes faster door-to-door, though paying a premium of ₹${carOption.cost} and higher carbon footprint.`;
  } else if (timeDifferenceMin <= 0) {
    tradeOffSummary = `You arrive ${Math.abs(timeDifferenceMin)} minutes faster than a taxi, while saving ₹${costSavings} and avoiding ${co2SavingsKg} kg of CO₂!`;
  } else {
    tradeOffSummary = `You save ₹${costSavings} and eliminate ${co2SavingsKg} kg of CO₂ emissions while arriving just ${timeDifferenceMin} minutes after a cab.`;
  }

  // Key advantages
  if (best.cost < 50) keyAdvantages.push(`Highly affordable fare of ₹${best.cost}`);
  if (best.co2Grams < 50) keyAdvantages.push(`Eco-certified low carbon footprint (${best.co2Grams}g CO₂)`);
  if (best.trafficImpact === 'None') keyAdvantages.push(`Completely immune to peak-hour road gridlock`);
  if (best.safetyScore >= 85) keyAdvantages.push(`High passenger safety index (${best.safetyScore}/100)`);
  if (best.accessibilityScore >= 85) keyAdvantages.push(`Full accessibility compliance with step-free ingress`);

  // Watch outs
  if (best.walkingDistanceMeters > 500) {
    watchOuts.push(`Requires a ${best.walkingDistanceMeters}m walk to/from transit points`);
  }
  if (best.transfers > 0) {
    watchOuts.push(`Includes ${best.transfers} transfer; ensure prompt platform change`);
  }
  if (best.weatherSensitivity === 'High') {
    watchOuts.push(`Active mode sensitive to rain; carry an umbrella or wear weather protection`);
  }

  const weather = getCurrentWeather();

  return {
    recommendedOptionId: best.id,
    recommendedMode: best.mode,
    headline,
    explanation,
    tradeOffSummary,
    priorityAlignmentNote: priorityAlignment,
    weatherAdvisory: weather.advisory,
    accessibilityAdvice: best.accessibilityScore >= 85
      ? 'Fully wheelchair accessible stations and designated boarding areas available.'
      : 'Moderate step climbing required; station assistance recommended if required.',
    keyAdvantages,
    watchOuts: watchOuts.length > 0 ? watchOuts : ['Plan 5 minutes buffer during busy commute windows.'],
  };
}

// ----------------- GEMINI AI GENERATIVE DECISION ENGINE ----------------- //

export async function generateAiDecision(
  origin: string,
  destination: string,
  primaryPriority: PriorityType,
  options: MobilityOption[],
  userPreferences?: UserPreferences | null
): Promise<AiRecommendation> {
  const fallback = buildHeuristicRecommendation(origin, destination, primaryPriority, options, userPreferences);

  // If no Gemini API key configured, seamlessly return the heuristic copilot recommendation
  if (!config.geminiApiKey || !genAI) {
    return fallback;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const weather = getCurrentWeather();

    const prompt = `
You are MobiMind AI, an elite Intelligent Mobility Copilot.
MobiMind AI tagline: "MobiMind AI doesn’t just find the fastest route. It uses AI to balance time, cost, traffic, environmental impact and user preferences to recommend the smartest way to travel."

Origin: "${origin}"
Destination: "${destination}"
User Primary Priority: "${primaryPriority.toUpperCase()}"
Current Weather: ${weather.condition}, ${weather.temperatureC}°C (${weather.advisory})

Mobility Options Analyzed:
${options
  .map(
    o =>
      `- Option ID: "${o.id}" | Mode: ${o.mode} | Title: ${o.title} | Duration: ${o.durationMin} min | Cost: ₹${o.cost} | CO2: ${o.co2Grams}g | Safety: ${o.safetyScore}/100 | Accessibility: ${o.accessibilityScore}/100 | Traffic: ${o.trafficImpact} (+${o.trafficDelayMin}m)`
  )
  .join('\n')}

Task:
Analyze all options and produce a structured JSON decision. Choose the best option that balances the user's primary priority ("${primaryPriority}") with holistic real-world urban practicality.

Return ONLY valid JSON with this exact schema (no markdown fences, no extra text):
{
  "recommendedOptionId": string (one of the Option IDs above),
  "headline": string (e.g. "Smart Commute Pick: Metro Purple Line"),
  "explanation": string (2-3 sentences explaining exactly why this is optimal for the stated priority),
  "tradeOffSummary": string (e.g. "You save ₹120 and reduce 1.4 kg CO2 arriving just 6 mins after a cab"),
  "priorityAlignmentNote": string (1 concise sentence on priority match),
  "weatherAdvisory": string (weather-informed transit advice),
  "accessibilityAdvice": string (barrier-free advice),
  "keyAdvantages": [string, string, string],
  "watchOuts": [string]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown formatting if any
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const chosenOption = options.find(o => o.id === parsed.recommendedOptionId) || options[0];

    return {
      recommendedOptionId: chosenOption.id,
      recommendedMode: chosenOption.mode,
      headline: parsed.headline || fallback.headline,
      explanation: parsed.explanation || fallback.explanation,
      tradeOffSummary: parsed.tradeOffSummary || fallback.tradeOffSummary,
      priorityAlignmentNote: parsed.priorityAlignmentNote || fallback.priorityAlignmentNote,
      weatherAdvisory: parsed.weatherAdvisory || fallback.weatherAdvisory,
      accessibilityAdvice: parsed.accessibilityAdvice || fallback.accessibilityAdvice,
      keyAdvantages: Array.isArray(parsed.keyAdvantages) && parsed.keyAdvantages.length > 0 ? parsed.keyAdvantages : fallback.keyAdvantages,
      watchOuts: Array.isArray(parsed.watchOuts) && parsed.watchOuts.length > 0 ? parsed.watchOuts : fallback.watchOuts,
    };
  } catch (err: any) {
    console.warn('[Gemini AI] Failed to fetch LLM decision, returning robust heuristic recommendation:', err.message);
    return fallback;
  }
}

// ----------------- NATURAL LANGUAGE INTENT PARSER ----------------- //

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

export async function parseNaturalLanguageIntent(query: string): Promise<ParsedTravelIntent> {
  const clean = query.trim();

  // Baseline regex extraction for quick, reliable offline parsing
  let origin = 'College';
  let destination = 'Railway Station';
  let primaryPriority: PriorityType = 'fastest';
  const selectedPriorities: PriorityType[] = [];
  const accessibilityNeeds: string[] = [];

  // Priority detection
  const lower = clean.toLowerCase();
  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('low cost') || lower.includes('affordable')) {
    primaryPriority = 'cheapest';
    selectedPriorities.push('cheapest');
  }
  if (lower.includes('eco') || lower.includes('green') || lower.includes('carbon') || lower.includes('environment')) {
    if (selectedPriorities.length === 0) primaryPriority = 'eco';
    selectedPriorities.push('eco');
  }
  if (lower.includes('safe') || lower.includes('night') || lower.includes('secure')) {
    if (selectedPriorities.length === 0) primaryPriority = 'safer';
    selectedPriorities.push('safer');
  }
  if (lower.includes('wheelchair') || lower.includes('accessible') || lower.includes('ramp') || lower.includes('elevator')) {
    if (selectedPriorities.length === 0) primaryPriority = 'accessible';
    selectedPriorities.push('accessible');
    accessibilityNeeds.push('wheelchair_accessible');
  }
  if (lower.includes('fast') || lower.includes('quick') || lower.includes('urgent') || lower.includes('rush')) {
    primaryPriority = 'fastest';
    selectedPriorities.push('fastest');
  }

  // Extract "from X to Y"
  const fromToMatch = clean.match(/(?:from|starting at|start from)\s+([^,]+?)\s+(?:to|towards|heading to)\s+([^,?.!]+)/i);
  if (fromToMatch) {
    origin = fromToMatch[1].trim();
    // remove trailing noise with word boundaries
    destination = fromToMatch[2].replace(/\b(prefer|want|need|budget|eco|cheap|fast|accessible|by|at)\b.*/i, '').trim();
  } else {
    // Try "X to Y"
    const simpleToMatch = clean.match(/([^,]+?)\s+to\s+([^,?.!]+)/i);
    if (simpleToMatch && !simpleToMatch[1].toLowerCase().includes('need') && !simpleToMatch[1].toLowerCase().includes('want')) {
      origin = simpleToMatch[1].trim();
      destination = simpleToMatch[2].replace(/\b(prefer|want|need|budget|eco|cheap|fast|accessible|by|at)\b.*/i, '').trim();
    }
  }

  // If Gemini API is available, ask Gemini to parse complex ambiguous queries
  if (config.geminiApiKey && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
Extract travel parameters from the following user natural language query:
"${query}"

Output ONLY a JSON object with this format (no markdown fences, no explanation):
{
  "origin": string,
  "destination": string,
  "primaryPriority": "fastest" | "cheapest" | "eco" | "safer" | "accessible",
  "selectedPriorities": string[],
  "accessibilityNeeds": string[]
}
`;
      const res = await model.generateContent(prompt);
      const cleaned = res.response.text().trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.origin && parsed.destination) {
        return {
          origin: parsed.origin,
          destination: parsed.destination,
          primaryPriority: parsed.primaryPriority || primaryPriority,
          selectedPriorities: parsed.selectedPriorities || [primaryPriority],
          accessibilityNeeds: parsed.accessibilityNeeds || accessibilityNeeds,
        };
      }
    } catch {
      // Return heuristic parse on error
    }
  }

  return {
    origin: origin || 'College',
    destination: destination || 'Railway Station',
    primaryPriority,
    selectedPriorities: selectedPriorities.length > 0 ? selectedPriorities : [primaryPriority],
    accessibilityNeeds,
  };
}
