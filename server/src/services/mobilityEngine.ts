import {
  LatLng,
  MobilityOption,
  PriorityType,
  RouteStep,
  ScoreBreakdown,
  TransportMode,
  UserPreferences,
} from '../types/index.js';
import { getCurrentWeather } from './weatherService.js';

// Predefined landmark database for realistic coordinates
const KNOWN_LOCATIONS: Record<string, LatLng> = {
  // Common transit hubs & colleges
  'college': { lat: 12.9352, lng: 77.6245 },
  'railway station': { lat: 12.9784, lng: 77.5694 },
  'central station': { lat: 12.9784, lng: 77.5694 },
  'city center': { lat: 12.9716, lng: 77.5946 },
  'airport': { lat: 13.1986, lng: 77.7066 },
  'tech park': { lat: 12.9255, lng: 77.6835 },
  'indiranagar': { lat: 12.9784, lng: 77.6408 },
  'koramangala': { lat: 12.9352, lng: 77.6245 },
  'whitefield': { lat: 12.9698, lng: 77.7499 },
  'mg road': { lat: 12.9756, lng: 77.6066 },
  'university': { lat: 12.9515, lng: 77.5025 },
  'hospital': { lat: 12.9344, lng: 77.5975 },
  'metro station': { lat: 12.9750, lng: 77.6080 },
  'bus terminal': { lat: 12.9772, lng: 77.5713 },
};

// Calculate Haversine distance in Kilometers
export function calculateDistanceKm(c1: LatLng, c2: LatLng): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.max(0.8, Math.round(dist * 10) / 10);
}

// Generate realistic pseudo-coords for unknown names
export function resolveLocationCoords(name: string, fallbackOffset = 0): LatLng {
  const clean = name.toLowerCase().trim();
  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (clean.includes(key)) {
      return {
        lat: coords.lat + (fallbackOffset * 0.005),
        lng: coords.lng + (fallbackOffset * 0.005),
      };
    }
  }

  // Generate deterministic coordinate in a realistic city metro area (12.97, 77.59 baseline)
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 100) / 1000) * (hash % 2 === 0 ? 1 : -1);
  const lngOffset = ((Math.abs(hash >> 3) % 100) / 1000) * (hash % 3 === 0 ? 1 : -1);

  return {
    lat: Number((12.9716 + latOffset + (fallbackOffset * 0.02)).toFixed(5)),
    lng: Number((77.5946 + lngOffset + (fallbackOffset * 0.02)).toFixed(5)),
  };
}

// Generate polyline steps between two points with realistic curved/transit deviations
function generatePathWaypoints(origin: LatLng, dest: LatLng, mode: TransportMode, segments = 6): LatLng[] {
  const points: LatLng[] = [origin];
  const latStep = (dest.lat - origin.lat) / segments;
  const lngStep = (dest.lng - origin.lng) / segments;

  for (let i = 1; i < segments; i++) {
    const progress = i / segments;
    // Add realistic urban curve jitter based on mode
    let jitter = 0;
    if (mode === 'car' || mode === 'bus') {
      jitter = Math.sin(progress * Math.PI) * 0.006;
    } else if (mode === 'metro' || mode === 'train') {
      jitter = Math.sin(progress * Math.PI) * 0.002; // straighter track
    } else {
      jitter = Math.sin(progress * Math.PI * 2) * 0.004;
    }

    points.push({
      lat: Number((origin.lat + latStep * i + jitter).toFixed(5)),
      lng: Number((origin.lng + lngStep * i - jitter).toFixed(5)),
    });
  }

  points.push(dest);
  return points;
}

// Check traffic conditions based on hour
export function getTrafficMultiplier(departureTimeStr?: string): { multiplier: number; level: 'None' | 'Low' | 'Moderate' | 'Heavy' } {
  const date = departureTimeStr ? new Date(departureTimeStr) : new Date();
  const hour = date.getHours();

  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return { multiplier: 1.6, level: 'Heavy' };
  } else if ((hour >= 11 && hour <= 16) || (hour >= 20 && hour <= 22)) {
    return { multiplier: 1.25, level: 'Moderate' };
  } else {
    return { multiplier: 1.0, level: 'Low' };
  }
}

// Multi-criteria weights configuration
const DEFAULT_WEIGHTS: Record<PriorityType, { time: number; cost: number; co2: number; safety: number; accessibility: number }> = {
  fastest: { time: 0.50, cost: 0.15, co2: 0.10, safety: 0.15, accessibility: 0.10 },
  cheapest: { time: 0.15, cost: 0.50, co2: 0.15, safety: 0.10, accessibility: 0.10 },
  eco: { time: 0.15, cost: 0.15, co2: 0.50, safety: 0.10, accessibility: 0.10 },
  safer: { time: 0.15, cost: 0.10, co2: 0.10, safety: 0.50, accessibility: 0.15 },
  accessible: { time: 0.10, cost: 0.10, co2: 0.10, safety: 0.20, accessibility: 0.50 },
};

// Calculate normalized score breakdown
function calculateScores(
  opt: {
    durationMin: number;
    cost: number;
    co2Grams: number;
    safetyScore: number;
    accessibilityScore: number;
  },
  weights: { time: number; cost: number; co2: number; safety: number; accessibility: number }
): ScoreBreakdown {
  // Normalize Time: 10m -> 95 score, 90m -> 30 score
  const timeScore = Math.max(10, Math.min(100, Math.round(100 - (opt.durationMin / 90) * 80)));

  // Normalize Cost: ₹0 -> 100 score, ₹500 -> 15 score
  const costScore = Math.max(10, Math.min(100, Math.round(100 - (opt.cost / 500) * 85)));

  // Normalize CO2: 0g -> 100 score, 2500g -> 10 score
  const co2Score = Math.max(10, Math.min(100, Math.round(100 - (opt.co2Grams / 2500) * 90)));

  const safetyScore = Math.max(10, Math.min(100, Math.round(opt.safetyScore)));
  const accessibilityScore = Math.max(10, Math.min(100, Math.round(opt.accessibilityScore)));

  const compositeScore = Math.round(
    timeScore * weights.time +
    costScore * weights.cost +
    co2Score * weights.co2 +
    safetyScore * weights.safety +
    accessibilityScore * weights.accessibility
  );

  return {
    timeScore,
    costScore,
    co2Score,
    safetyScore,
    accessibilityScore,
    compositeScore: Math.min(100, Math.max(1, compositeScore)),
  };
}

export interface AnalyzeOptionsParams {
  origin: string;
  destination: string;
  originCoords?: LatLng | null;
  destinationCoords?: LatLng | null;
  departureTime?: string;
  primaryPriority?: PriorityType;
  selectedPriorities?: PriorityType[];
  accessibilityNeeds?: string[];
  maxWalkMeters?: number;
  preferredModes?: TransportMode[];
  userPreferences?: UserPreferences | null;
}

export function generateMobilityOptions(params: AnalyzeOptionsParams): MobilityOption[] {
  const {
    origin,
    destination,
    departureTime,
    primaryPriority = 'fastest',
    userPreferences,
  } = params;

  const oCoords = params.originCoords || resolveLocationCoords(origin, 0);
  const dCoords = params.destinationCoords || resolveLocationCoords(destination, 1);
  const distanceKm = calculateDistanceKm(oCoords, dCoords);

  const traffic = getTrafficMultiplier(departureTime);
  const weather = getCurrentWeather(departureTime);

  // Determine user weights
  const baseWeights = userPreferences?.priorityWeights || DEFAULT_WEIGHTS[primaryPriority] || DEFAULT_WEIGHTS.fastest;

  const options: MobilityOption[] = [];

  // 1. PUBLIC BUS / BRT
  {
    const baseBusTime = Math.round(distanceKm * 3.2 + 8); // ~18-20 km/h average with stops
    const trafficDelay = traffic.level === 'Heavy' ? Math.round(baseBusTime * 0.35) : traffic.level === 'Moderate' ? Math.round(baseBusTime * 0.15) : 0;
    const duration = baseBusTime + trafficDelay;
    const cost = Math.min(60, Math.max(15, Math.round(15 + distanceKm * 2.5)));
    const co2Grams = Math.round(distanceKm * 32); // 32g per passenger km

    const steps: RouteStep[] = [
      {
        id: 'bus-1',
        mode: 'walk',
        instruction: `Walk 350m to nearest Bus Stop (${origin} Junction)`,
        durationMin: 5,
        distanceMeters: 350,
      },
      {
        id: 'bus-2',
        mode: 'bus',
        instruction: `Board City Express Bus Route 335-E towards ${destination}`,
        durationMin: duration - 10,
        distanceMeters: Math.round(distanceKm * 1000 - 600),
        from: `${origin} Bus Stop`,
        to: `${destination} Cross`,
        lineOrRouteNumber: 'Route 335-E',
      },
      {
        id: 'bus-3',
        mode: 'walk',
        instruction: `Walk 250m to final destination ${destination}`,
        durationMin: 5,
        distanceMeters: 250,
      },
    ];

    const busScores = calculateScores({
      durationMin: duration,
      cost,
      co2Grams,
      safetyScore: 83,
      accessibilityScore: 78,
    }, baseWeights);

    options.push({
      id: 'opt-bus',
      mode: 'bus',
      title: 'Public Bus / City BRT',
      subtitle: 'Route 335-E • High frequency low-cost public transit',
      durationMin: duration,
      cost,
      co2Grams,
      co2Level: 'Low',
      trafficImpact: traffic.level,
      trafficDelayMin: trafficDelay,
      safetyScore: 83,
      accessibilityScore: 78,
      weatherSensitivity: 'Low',
      transfers: 0,
      walkingDistanceMeters: 600,
      steps,
      pathCoordinates: generatePathWaypoints(oCoords, dCoords, 'bus'),
      scores: busScores,
    });
  }

  // 2. METRO / SUBWAY
  {
    const metroTravelTime = Math.round(distanceKm * 1.8 + 6); // ~33 km/h commercial speed
    const duration = metroTravelTime + 10; // including station entry/exit
    const cost = Math.min(70, Math.max(20, Math.round(20 + distanceKm * 3.5)));
    const co2Grams = Math.round(distanceKm * 14); // Electrified rapid rail: 14g CO2/p-km

    const steps: RouteStep[] = [
      {
        id: 'metro-1',
        mode: 'walk',
        instruction: `Walk 400m to Metro Station (Elevator access available)`,
        durationMin: 6,
        distanceMeters: 400,
      },
      {
        id: 'metro-2',
        mode: 'metro',
        instruction: `Board Metro Purple Line towards Station Terminal (Air-conditioned, CCTV secured)`,
        durationMin: metroTravelTime,
        distanceMeters: Math.round(distanceKm * 1000 - 800),
        from: `${origin} Metro`,
        to: `${destination} Metro`,
        lineOrRouteNumber: 'Purple Line M-1',
      },
      {
        id: 'metro-3',
        mode: 'walk',
        instruction: `Exit via Gate 2 and walk 400m to ${destination}`,
        durationMin: 4,
        distanceMeters: 400,
      },
    ];

    const metroScores = calculateScores({
      durationMin: duration,
      cost,
      co2Grams,
      safetyScore: 95,
      accessibilityScore: 94,
    }, baseWeights);

    options.push({
      id: 'opt-metro',
      mode: 'metro',
      title: 'Metro / Subway Rapid Transit',
      subtitle: 'Purple Line • Traffic-immune & zero street congestion',
      durationMin: duration,
      cost,
      co2Grams,
      co2Level: 'Low',
      trafficImpact: 'None',
      trafficDelayMin: 0,
      safetyScore: 95,
      accessibilityScore: 94,
      weatherSensitivity: 'Low',
      transfers: 0,
      walkingDistanceMeters: 800,
      steps,
      pathCoordinates: generatePathWaypoints(oCoords, dCoords, 'metro'),
      scores: metroScores,
    });
  }

  // 3. SUBURBAN TRAIN / RAIL
  {
    const trainTime = Math.round(distanceKm * 1.5 + 12);
    const duration = trainTime + 10;
    const cost = Math.min(35, Math.max(10, Math.round(10 + distanceKm * 1.5)));
    const co2Grams = Math.round(distanceKm * 11);

    const steps: RouteStep[] = [
      {
        id: 'train-1',
        mode: 'walk',
        instruction: `Walk 600m to Suburban Railway Junction`,
        durationMin: 8,
        distanceMeters: 600,
      },
      {
        id: 'train-2',
        mode: 'train',
        instruction: `Board Suburban Express Local 401 toward ${destination}`,
        durationMin: trainTime,
        distanceMeters: Math.round(distanceKm * 1000 - 1100),
        from: `${origin} Rail Platform 2`,
        to: `${destination} Rail Platform 1`,
        lineOrRouteNumber: 'Suburban 401',
      },
      {
        id: 'train-3',
        mode: 'walk',
        instruction: `Walk 500m to destination`,
        durationMin: 6,
        distanceMeters: 500,
      },
    ];

    const trainScores = calculateScores({
      durationMin: duration,
      cost,
      co2Grams,
      safetyScore: 84,
      accessibilityScore: 72,
    }, baseWeights);

    options.push({
      id: 'opt-train',
      mode: 'train',
      title: 'Suburban Rail / Commuter Train',
      subtitle: 'Express Track • Ultra-budget regional transport',
      durationMin: duration,
      cost,
      co2Grams,
      co2Level: 'Low',
      trafficImpact: 'None',
      trafficDelayMin: 0,
      safetyScore: 84,
      accessibilityScore: 72,
      weatherSensitivity: 'Low',
      transfers: 0,
      walkingDistanceMeters: 1100,
      steps,
      pathCoordinates: generatePathWaypoints(oCoords, dCoords, 'train'),
      scores: trainScores,
    });
  }

  // 4. CAR / TAXI / RIDE-HAIL
  {
    const baseCarTime = Math.max(12, Math.round(distanceKm * 2.2));
    const trafficDelay = traffic.level === 'Heavy' ? Math.round(baseCarTime * 0.65) : traffic.level === 'Moderate' ? Math.round(baseCarTime * 0.25) : 0;
    const duration = baseCarTime + trafficDelay;
    const cost = Math.max(120, Math.round(60 + distanceKm * 24)); // ₹60 base + ₹24/km
    const co2Grams = Math.round(distanceKm * 145); // Standard petrol car: 145g CO2/km

    const steps: RouteStep[] = [
      {
        id: 'car-1',
        mode: 'car',
        instruction: `Pick-up at ${origin} doorstep via Ride-Hail / Taxi`,
        durationMin: 3,
        distanceMeters: 50,
      },
      {
        id: 'car-2',
        mode: 'car',
        instruction: `Drive along Main Arterial Road towards ${destination}`,
        durationMin: duration - 3,
        distanceMeters: Math.round(distanceKm * 1000),
      },
    ];

    const carScores = calculateScores({
      durationMin: duration,
      cost,
      co2Grams,
      safetyScore: 86,
      accessibilityScore: 86,
    }, baseWeights);

    options.push({
      id: 'opt-car',
      mode: 'car',
      title: 'Private Car / Taxi / Ride-hail',
      subtitle: 'Door-to-door cab • Direct route subject to peak road congestion',
      durationMin: duration,
      cost,
      co2Grams,
      co2Level: 'High',
      trafficImpact: traffic.level,
      trafficDelayMin: trafficDelay,
      safetyScore: 86,
      accessibilityScore: 86,
      weatherSensitivity: 'Low',
      transfers: 0,
      walkingDistanceMeters: 50,
      steps,
      pathCoordinates: generatePathWaypoints(oCoords, dCoords, 'car'),
      scores: carScores,
    });
  }

  // 5. WALKING (Active Travel)
  {
    const duration = Math.round(distanceKm * 13); // ~4.6 km/h pace
    const cost = 0;
    const co2Grams = 0;
    const caloriesBurned = Math.round(distanceKm * 58);

    const steps: RouteStep[] = [
      {
        id: 'walk-1',
        mode: 'walk',
        instruction: `Walk via pedestrian footpaths and sidewalk avenues directly to ${destination}`,
        durationMin: duration,
        distanceMeters: Math.round(distanceKm * 1000),
      },
    ];

    const walkScores = calculateScores({
      durationMin: duration,
      cost: 0,
      co2Grams: 0,
      safetyScore: distanceKm > 6 ? 70 : 88,
      accessibilityScore: 76,
    }, baseWeights);

    options.push({
      id: 'opt-walk',
      mode: 'walk',
      title: 'Pedestrian Walking',
      subtitle: 'Zero carbon • Active wellness & pedestrian trails',
      durationMin: duration,
      cost,
      co2Grams,
      co2Level: 'Zero',
      trafficImpact: 'None',
      trafficDelayMin: 0,
      safetyScore: distanceKm > 6 ? 70 : 88,
      accessibilityScore: 76,
      weatherSensitivity: weather.condition.includes('Rain') ? 'High' : 'Moderate',
      caloriesBurned,
      transfers: 0,
      walkingDistanceMeters: Math.round(distanceKm * 1000),
      steps,
      pathCoordinates: generatePathWaypoints(oCoords, dCoords, 'walk'),
      scores: walkScores,
    });
  }

  // 6. CYCLING / E-SCOOTER
  {
    const duration = Math.round(distanceKm * 4.2 + 2); // ~14-16 km/h pace
    const cost = Math.min(45, Math.max(15, Math.round(15 + distanceKm * 3))); // Micromobility rental
    const co2Grams = 0;
    const caloriesBurned = Math.round(distanceKm * 32);

    const steps: RouteStep[] = [
      {
        id: 'cycle-1',
        mode: 'cycle',
        instruction: `Unlock Smart Cycle / E-Scooter at ${origin} Station Dock`,
        durationMin: 2,
        distanceMeters: 50,
      },
      {
        id: 'cycle-2',
        mode: 'cycle',
        instruction: `Ride through designated cycle paths and calm urban boulevards to ${destination}`,
        durationMin: duration - 4,
        distanceMeters: Math.round(distanceKm * 1000 - 100),
      },
      {
        id: 'cycle-3',
        mode: 'cycle',
        instruction: `Park and lock at ${destination} Smart Dock`,
        durationMin: 2,
        distanceMeters: 50,
      },
    ];

    const cycleScores = calculateScores({
      durationMin: duration,
      cost,
      co2Grams,
      safetyScore: 80,
      accessibilityScore: 70,
    }, baseWeights);

    options.push({
      id: 'opt-cycle',
      mode: 'cycle',
      title: 'Cycling / Smart E-Scooter',
      subtitle: 'Shared micromobility • Swift, zero emissions & calorie burn',
      durationMin: duration,
      cost,
      co2Grams,
      co2Level: 'Zero',
      trafficImpact: 'Low',
      trafficDelayMin: 0,
      safetyScore: 80,
      accessibilityScore: 70,
      weatherSensitivity: weather.condition.includes('Rain') ? 'High' : 'Moderate',
      caloriesBurned,
      transfers: 0,
      walkingDistanceMeters: 100,
      steps,
      pathCoordinates: generatePathWaypoints(oCoords, dCoords, 'cycle'),
      scores: cycleScores,
    });
  }

  // 7. SMART MULTI-MODAL (Cycle/Walk + Metro + Feeder)
  {
    const duration = Math.round(distanceKm * 2.0 + 8);
    const cost = Math.min(65, Math.max(30, Math.round(25 + distanceKm * 3.0)));
    const co2Grams = Math.round(distanceKm * 12);

    const steps: RouteStep[] = [
      {
        id: 'multi-1',
        mode: 'cycle',
        instruction: `Quick 5-min E-Scooter / brisk walk to ${origin} Metro Station`,
        durationMin: 5,
        distanceMeters: 600,
      },
      {
        id: 'multi-2',
        mode: 'metro',
        instruction: `Board Metro Line to Hub Interchange (Bypass road gridlock)`,
        durationMin: duration - 12,
        distanceMeters: Math.round(distanceKm * 1000 - 1000),
        from: `${origin} Metro`,
        to: `${destination} Interchange`,
      },
      {
        id: 'multi-3',
        mode: 'bus',
        instruction: `Board Electric Feeder Shuttle directly to ${destination}`,
        durationMin: 7,
        distanceMeters: 400,
      },
    ];

    const multiScores = calculateScores({
      durationMin: duration,
      cost,
      co2Grams,
      safetyScore: 92,
      accessibilityScore: 90,
    }, baseWeights);

    options.push({
      id: 'opt-multimodal',
      mode: 'multimodal',
      title: 'Smart Multi-Modal (Metro + E-Feeder)',
      subtitle: 'Synced active & transit hops • Fastest & cleanest balance',
      durationMin: duration,
      cost,
      co2Grams,
      co2Level: 'Low',
      trafficImpact: 'None',
      trafficDelayMin: 0,
      safetyScore: 92,
      accessibilityScore: 90,
      weatherSensitivity: 'Low',
      transfers: 1,
      walkingDistanceMeters: 400,
      steps,
      pathCoordinates: generatePathWaypoints(oCoords, dCoords, 'multimodal'),
      scores: multiScores,
    });
  }

  // Filter out walking if distance is too large (> 10 km) or user maxWalkMeters is strictly exceeded
  const filtered = options.filter(opt => {
    if (opt.mode === 'walk' && distanceKm > 8) return false;
    if (params.maxWalkMeters && opt.walkingDistanceMeters > params.maxWalkMeters * 1.5) {
      if (opt.mode === 'walk') return false;
    }
    if (params.preferredModes && params.preferredModes.length > 0) {
      // If user strictly selected modes, check if option mode is in list
      if (!params.preferredModes.includes(opt.mode) && opt.mode !== 'multimodal') {
        // deprioritize rather than completely delete
      }
    }
    return true;
  });

  // Rank options based on composite score descending
  filtered.sort((a, b) => b.scores.compositeScore - a.scores.compositeScore);

  // Assign 1-based ranks
  filtered.forEach((opt, idx) => {
    opt.rank = idx + 1;
  });

  return filtered;
}
