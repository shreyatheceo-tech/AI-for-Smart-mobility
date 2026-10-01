import { Router, Request, Response } from 'express';
import { getUserPreferences } from '../db/index.js';
import { optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  generateAiDecision,
  parseNaturalLanguageIntent,
  chatWithMobiMind,
} from '../services/geminiService.js';
import {
  generateMobilityOptions,
  resolveLocationCoords,
} from '../services/mobilityEngine.js';
import { getCurrentWeather } from '../services/weatherService.js';
import { mobilitySearchSchema, naturalLanguageSearchSchema, chatMessageSchema } from '../types/index.js';

const router = Router();

// POST /api/mobility/analyze
router.post(
  '/analyze',
  optionalAuth,
  validateBody(mobilitySearchSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        origin,
        destination,
        originCoords,
        destinationCoords,
        departureTime,
        primaryPriority = 'fastest',
        selectedPriorities,
        accessibilityNeeds,
        maxWalkMeters,
        preferredModes,
      } = req.body;

      // Check if logged in user has persistent preferences
      let userPrefs = null;
      if (req.user?.userId) {
        userPrefs = await getUserPreferences(req.user.userId);
      }

      // Resolve coordinates
      const resolvedOriginCoords = originCoords || resolveLocationCoords(origin, 0);
      const resolvedDestCoords = destinationCoords || resolveLocationCoords(destination, 1);

      // Generate all 7 multi-modal options with scoring
      const options = generateMobilityOptions({
        origin,
        destination,
        originCoords: resolvedOriginCoords,
        destinationCoords: resolvedDestCoords,
        departureTime,
        primaryPriority,
        selectedPriorities,
        accessibilityNeeds,
        maxWalkMeters,
        preferredModes,
        userPreferences: userPrefs,
      });

      // Generate Gemini AI recommendation & explanation
      const aiRecommendation = await generateAiDecision(
        origin,
        destination,
        primaryPriority,
        options,
        userPrefs
      );

      // Get weather context
      const weather = getCurrentWeather(departureTime);

      res.json({
        success: true,
        origin,
        destination,
        originCoords: resolvedOriginCoords,
        destinationCoords: resolvedDestCoords,
        departureTime: departureTime || new Date().toISOString(),
        primaryPriority,
        weather,
        options,
        recommendation: aiRecommendation,
      });
    } catch (err: any) {
      console.error('[Mobility Analyze Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to analyze mobility routes: ' + err.message });
    }
  }
);

// POST /api/mobility/parse-intent
router.post(
  '/parse-intent',
  validateBody(naturalLanguageSearchSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.body;
      const parsed = await parseNaturalLanguageIntent(query);
      res.json({
        success: true,
        parsed,
      });
    } catch (err: any) {
      console.error('[Mobility Parse Intent Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to parse natural language intent.' });
    }
  }
);

// GET /api/mobility/weather
router.get('/weather', (req: Request, res: Response): void => {
  const time = req.query.departureTime as string | undefined;
  const weather = getCurrentWeather(time);
  res.json({
    success: true,
    weather,
  });
});

// POST /api/mobility/chat
router.post(
  '/chat',
  validateBody(chatMessageSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, history = [], context } = req.body;
      const response = await chatWithMobiMind(message, history, context);
      res.json({
        success: true,
        ...response,
      });
    } catch (err: any) {
      console.error('[Mobility Chat Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to process chat message.' });
    }
  }
);

export default router;
