import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import {
  AiRecommendation,
  MobilityOption,
  PriorityType,
  TransportMode,
  UserPreferences,
  ChatMessage,
  ChatResponse,
} from '../types/index.js';
import { getCurrentWeather } from './weatherService.js';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI | null {
  const key = config.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];

async function executeGeminiPrompt(promptText: string): Promise<string> {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key is not configured');

  let lastError: any = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });
      const res = await model.generateContent(promptText);
      return res.response.text();
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Failover] Model ${modelName} returned: ${err.message?.slice(0, 70)}. Falling to next...`);
    }
  }
  throw lastError;
}

async function executeGeminiChat(contents: any[]): Promise<string> {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key is not configured');

  let lastError: any = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });
      const res = await model.generateContent({ contents });
      return res.response.text();
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Failover] Model ${modelName} returned: ${err.message?.slice(0, 70)}. Falling to next...`);
    }
  }
  throw lastError;
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

  try {
    const ai = getGenAI();
    if (!ai) return fallback;
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

    const text = (await executeGeminiPrompt(prompt)).trim();

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
  try {
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
    const res = await executeGeminiPrompt(prompt);
    const cleaned = res.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
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

  return {
    origin: origin || 'College',
    destination: destination || 'Railway Station',
    primaryPriority,
    selectedPriorities: selectedPriorities.length > 0 ? selectedPriorities : [primaryPriority],
    accessibilityNeeds,
  };
}

// ----------------- INTELLIGENT LOCAL COPILOT FALLBACK ----------------- //

function generateLocalCopilotResponse(
  message: string,
  context?: {
    origin?: string;
    destination?: string;
    activePriority?: PriorityType;
    currentRouteTitle?: string;
  },
  weather?: any
): ChatResponse {
  const lower = message.toLowerCase();

  const fromToMatch = message.match(/(?:from|between)\s+([^,]+?)\s+(?:to|and)\s+([^,?.!]+)/i);
  if (fromToMatch) {
    const orig = fromToMatch[1].trim();
    const dest = fromToMatch[2].trim();
    return {
      reply: `I would love to help you travel from **${orig}** to **${dest}**! 🚇

Here is a quick multi-modal assessment:
• 🚇 **Metro Line**: Best if you are traveling during rush hours to avoid surface road bottlenecks.
• 🚕 **EV Ride-hail / Cab**: Door-to-door comfort, though typically 3-5x the cost of rail transit.
• 🚶 **Last-Mile & Micro-mobility**: Great for the initial or final 1 km connection.

I can run an immediate multi-modal comparison with live safety indices, carbon footprint, and fare breakdown!`,
      suggestedPrompts: [
        `Plan route from ${orig} to ${dest}`,
        'Show lowest fare options',
        'Check well-lit & high CCTV routes',
      ],
      quickAction: {
        type: 'PLAN_ROUTE',
        origin: orig,
        destination: dest,
        priority: 'fastest',
      },
    };
  }

  if (lower.includes('rain') || lower.includes('weather') || lower.includes('monsoon') || lower.includes('umbrella')) {
    return {
      reply: `Live Weather Status: **${weather?.condition || 'Partly Cloudy'}** at **${weather?.temperatureC || 27}°C** (${weather?.advisory || 'Smooth travel conditions'}).

**Rain & Monsoon Commute Advisory:**
• 🚇 **Metro Rail**: 100% sheltered boarding and grade-separated tracks—completely unaffected by road waterlogging!
• 🚌 **AC City Buses**: Good alternative, though anticipate a 10-15 minute traffic delay on ring roads.
• 🚲 **Micro-mobility**: Recommend pausing open two-wheeler / cycle usage during active heavy showers.`,
      suggestedPrompts: [
        'Find 100% sheltered routes',
        'Compare Metro vs Cabs in rain',
        'Check station elevator access',
      ],
    };
  }

  if (lower.includes('safe') || lower.includes('night') || lower.includes('cctv') || lower.includes('women') || lower.includes('secure')) {
    return {
      reply: `Passenger safety is our top priority! MobiMind AI's dynamic **Safety Index** monitors:
1. 📹 **CCTV & Platform Surveillance**: Monitored corridors and transit stations.
2. 💡 **Street Lighting & Visibility**: Verified well-lit pedestrian pathways.
3. 👥 **Commuter Footfall**: Routes with active foot traffic and station security staff.

**Late-Night Tip:** Choose Metro stations with active customer care kiosks or verified EV cabs over unmonitored road shortcuts.`,
      suggestedPrompts: [
        'Show routes with Safety Index > 85',
        'Safest transit mode late at night',
        'CCTV coverage around city hubs',
      ],
    };
  }

  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('cost') || lower.includes('fare') || lower.includes('save money')) {
    return {
      reply: `Here is how typical urban transit fares compare:
• 🚌 **City Bus**: ₹10 – ₹25 (Unbeatable budget, lowest overall expense)
• 🚇 **Metro Rail**: ₹20 – ₹50 (Top value: high speed + comfort at 80% discount vs cabs)
• 🛺 **Shared Auto / Feeder**: ₹30 – ₹60
• 🚕 **Private Cab / Auto**: ₹180 – ₹450+ (Premium convenience with surge pricing)

Combining **Metro + 5 min walking** saves the average commuter over ₹4,000 every month!`,
      suggestedPrompts: [
        'Calculate my monthly savings',
        'Show cheapest route available',
        'Smart transit pass discounts',
      ],
    };
  }

  if (lower.includes('wheelchair') || lower.includes('accessible') || lower.includes('ramp') || lower.includes('elevator')) {
    return {
      reply: `MobiMind AI is fully committed to barrier-free accessibility:
• 🛗 **Elevators & Level Ingress**: Primary Metro stations feature street-to-platform step-free elevators.
• 🟡 **Tactile Paving**: Installed across station concourses and platform safety edges.
• 🦽 **Priority Spaces**: Dedicated wheelchair areas in coaches 1 & 4 of Metro trains.

You can select the **Accessible First** priority filter anytime in our route planner!`,
      suggestedPrompts: [
        'Filter routes with step-free elevators',
        'Low-floor feeder bus routes',
        'Station wheelchair assistance contacts',
      ],
    };
  }

  if (lower.includes('eco') || lower.includes('carbon') || lower.includes('green') || lower.includes('co2')) {
    return {
      reply: `Every smart transit choice reduces urban emissions! 🌱
• 🚶 **Walking / Cycling**: 0g CO₂ emissions (Zero footprint + burns 150+ kcal)
• 🚇 **Metro Rail**: ~18g CO₂/km (Over 85% cleaner than private petrol cars)
• 🚌 **Electric / CNG Bus**: ~35g CO₂/km per passenger
• 🚗 **Single-Occupant Cab**: ~190g - 240g CO₂/km

Switching just 3 car trips a week to Metro saves approximately 18 kg of CO₂ per month!`,
      suggestedPrompts: [
        'Show zero-emission commute routes',
        'Calculate my carbon footprint',
        'Eco-friendly travel tips',
      ],
    };
  }

  return {
    reply: `Hello! I'm **MobiMind AI**, your Intelligent Smart Mobility Copilot. ✨

I can assist you with:
• 🗺️ **Multi-Modal Route Optimization**: Balancing speed, cost, safety, and carbon footprint.
• ⚡ **Traffic & Bottleneck Avoidance**: Helping you bypass peak-hour gridlocks.
• 🌧️ **Weather-Aware Transit**: Real-time advice for rain and changing weather.
• ♿ **Accessibility & Step-Free Ingress**: Elevators, ramps, and barrier-free routes.

Tell me where you want to go (e.g. *"Plan a trip from MG Road to Airport"*) or ask any transit question!`,
    suggestedPrompts: [
      '⚡ How do I beat peak-hour traffic?',
      '🌱 Find the lowest carbon route',
      '☔ Commute advice if it rains today',
      '♿ Show wheelchair accessible transit',
    ],
  };
}

// ----------------- GEMINI AI CONVERSATIONAL ASSISTANT ----------------- //

export async function chatWithMobiMind(
  message: string,
  history: ChatMessage[] = [],
  context?: {
    origin?: string;
    destination?: string;
    activePriority?: PriorityType;
    currentRouteTitle?: string;
  }
): Promise<ChatResponse> {
  const weather = getCurrentWeather();
  try {
    const systemInstruction = `
You are MobiMind AI, the world's premier Intelligent Smart Mobility Copilot.
You are warm, friendly, helpful, concise, and deeply knowledgeable about urban mobility.

Live Urban Mobility Context:
- Current Weather: ${weather.condition}, ${weather.temperatureC}°C (${weather.advisory})
${context?.origin && context?.destination ? `- Active Trip in planner: "${context.origin}" to "${context.destination}"` : ''}
${context?.activePriority ? `- Preferred Priority: ${context.activePriority}` : ''}
${context?.currentRouteTitle ? `- Selected Route: ${context.currentRouteTitle}` : ''}

Key Responsibilities:
1. Provide practical, accurate, real-world multi-modal transit advice (Metro, City Buses, EV Cabs, Shared Autos, Micro-mobility/Cycles, Walking).
2. Help users weigh trade-offs (Time vs Cost vs Carbon Footprint vs Safety Score vs Accessibility).
3. Keep answers concise, visually appealing (using bullet points and friendly transit emojis).
4. At the very end of your response, ALWAYS include 2 to 3 relevant follow-up suggestion chips formatted strictly on the last line like:
[SUGGESTIONS: suggestion 1 | suggestion 2 | suggestion 3]
5. If the user mentions wanting to plan or travel between two places (e.g. "from A to B"), append on a new line:
[ACTION: PLAN_ROUTE | origin | destination | priority]
`;

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent history (up to last 6 turns)
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.role,
        parts: [{ text: h.text }],
      });
    }

    // Add current turn with system instructions
    contents.push({
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nUser Question:\n${message}` }],
    });

    const rawText = (await executeGeminiChat(contents)).trim();

      let cleanReply = rawText;
      let suggestedPrompts: string[] = [
        'Compare Metro vs Cabs for this journey',
        'Find the lowest carbon option 🌱',
        'Show wheelchair accessible stations ♿',
      ];
      let quickAction: ChatResponse['quickAction'] = undefined;

      const suggestionsMatch = cleanReply.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
      if (suggestionsMatch) {
        cleanReply = cleanReply.replace(suggestionsMatch[0], '').trim();
        const extracted = suggestionsMatch[1].split('|').map(s => s.trim()).filter(Boolean);
        if (extracted.length > 0) {
          suggestedPrompts = extracted;
        }
      }

      const actionMatch = cleanReply.match(/\[ACTION:\s*PLAN_ROUTE\s*\|\s*([^|]+)\s*\|\s*([^|]+)(?:\s*\|\s*([^\]]+))?\]/i);
      if (actionMatch) {
        cleanReply = cleanReply.replace(actionMatch[0], '').trim();
        const rawOrig = actionMatch[1].trim();
        const rawDest = actionMatch[2].trim();
        const rawPrio = actionMatch[3]?.trim();

        const cleanOrig = rawOrig.replace(/\s+(in rush hour|during peak hours|right now|today|at night|in the morning|please)$/i, '').trim();
        const cleanDest = rawDest.replace(/\s+(in rush hour|during peak hours|right now|today|at night|in the morning|please)$/i, '').trim();
        
        let normalizedPrio: PriorityType = 'fastest';
        if (rawPrio) {
          const l = rawPrio.toLowerCase();
          if (l.includes('cheap') || l.includes('budget') || l.includes('cost')) normalizedPrio = 'cheapest';
          else if (l.includes('eco') || l.includes('green') || l.includes('carbon')) normalizedPrio = 'eco';
          else if (l.includes('safe') || l.includes('night') || l.includes('secure')) normalizedPrio = 'safer';
          else if (l.includes('access') || l.includes('wheelchair')) normalizedPrio = 'accessible';
        }

        quickAction = {
          type: 'PLAN_ROUTE',
          origin: cleanOrig,
          destination: cleanDest,
          priority: normalizedPrio,
        };
      }

      return {
        reply: cleanReply,
        suggestedPrompts,
        quickAction,
      };
    } catch (err: any) {
      console.warn('[Gemini Chat Error]:', err.message);
    }

  // Fallback to intelligent local reasoning if API key issues or offline
  return generateLocalCopilotResponse(message, context, weather);
}

