import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';
import {
  Journey,
  MobilityAnalysisResponse,
  MobilityOption,
  ParsedTravelIntent,
  PriorityType,
} from '../types/index.js';

interface JourneyContextType {
  currentAnalysis: MobilityAnalysisResponse | null;
  selectedOption: MobilityOption | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  runAnalysis: (params: {
    origin: string;
    destination: string;
    departureTime?: string;
    primaryPriority: PriorityType;
    selectedPriorities?: PriorityType[];
    accessibilityNeeds?: string[];
    maxWalkMeters?: number;
    preferredModes?: string[];
  }) => Promise<MobilityAnalysisResponse>;
  parseNaturalLanguage: (query: string) => Promise<ParsedTravelIntent>;
  setSelectedOption: (option: MobilityOption | null) => void;
  saveCurrentJourney: () => Promise<Journey | null>;
  loadSavedJourneyToAnalysis: (journey: Journey) => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<MobilityAnalysisResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<MobilityOption | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const runAnalysis = async (params: {
    origin: string;
    destination: string;
    departureTime?: string;
    primaryPriority: PriorityType;
    selectedPriorities?: PriorityType[];
    accessibilityNeeds?: string[];
    maxWalkMeters?: number;
    preferredModes?: string[];
  }): Promise<MobilityAnalysisResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.analyze(params);
      setCurrentAnalysis(data);
      // Auto-select the top recommended option
      const topOpt = data.options.find(o => o.id === data.recommendation.recommendedOptionId) || data.options[0];
      setSelectedOption(topOpt || null);
      return data;
    } catch (err: any) {
      const msg = err.message || 'Failed to analyze routes';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const parseNaturalLanguage = async (query: string): Promise<ParsedTravelIntent> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.parseIntent(query);
      return res.parsed;
    } catch (err: any) {
      setError(err.message || 'Failed to parse natural language intent');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentJourney = async (): Promise<Journey | null> => {
    if (!currentAnalysis) return null;
    setIsSaving(true);
    try {
      const res = await api.saveJourney({
        origin: currentAnalysis.origin,
        destination: currentAnalysis.destination,
        originCoords: currentAnalysis.originCoords,
        destinationCoords: currentAnalysis.destinationCoords,
        departureTime: currentAnalysis.departureTime,
        primaryPriority: currentAnalysis.primaryPriority,
        rawOptions: currentAnalysis.options,
        aiRecommendation: currentAnalysis.recommendation,
        explanation: currentAnalysis.recommendation.explanation,
      });
      return res.journey;
    } catch (err: any) {
      setError(err.message || 'Failed to save journey');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedJourneyToAnalysis = (journey: Journey) => {
    const analysis: MobilityAnalysisResponse = {
      success: true,
      origin: journey.origin,
      destination: journey.destination,
      originCoords: journey.originCoords || { lat: 12.9352, lng: 77.6245 },
      destinationCoords: journey.destinationCoords || { lat: 12.9784, lng: 77.5694 },
      departureTime: journey.departureTime,
      primaryPriority: journey.primaryPriority,
      weather: {
        condition: 'Partly Cloudy',
        temperatureC: 26,
        humidityPercent: 60,
        precipitationChance: 10,
        windSpeedKmh: 12,
        advisory: 'Fair atmospheric conditions across urban corridors.',
      },
      options: journey.rawOptions,
      recommendation: journey.aiRecommendation,
    };
    setCurrentAnalysis(analysis);
    const topOpt = journey.rawOptions.find(o => o.id === journey.aiRecommendation?.recommendedOptionId) || journey.rawOptions[0];
    setSelectedOption(topOpt || null);
  };

  return (
    <JourneyContext.Provider
      value={{
        currentAnalysis,
        selectedOption,
        isLoading,
        error,
        isSaving,
        runAnalysis,
        parseNaturalLanguage,
        setSelectedOption,
        saveCurrentJourney,
        loadSavedJourneyToAnalysis,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = (): JourneyContextType => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
