import { Router, Request, Response } from 'express';
import { createJourney, deleteJourney, getJourneyById, getJourneysByUserId } from '../db/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { saveJourneySchema } from '../types/index.js';

const router = Router();

// POST /api/journeys - Save journey to history
router.post(
  '/',
  requireAuth,
  validateBody(saveJourneySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const {
        origin,
        destination,
        originCoords,
        destinationCoords,
        departureTime,
        primaryPriority,
        rawOptions,
        aiRecommendation,
        explanation,
      } = req.body;

      const journey = await createJourney({
        userId,
        origin,
        destination,
        originCoords: originCoords || null,
        destinationCoords: destinationCoords || null,
        departureTime,
        primaryPriority,
        rawOptions,
        aiRecommendation,
        explanation,
      });

      res.status(201).json({
        success: true,
        message: 'Journey saved successfully',
        journey,
      });
    } catch (err: any) {
      console.error('[Save Journey Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to save journey.' });
    }
  }
);

// GET /api/journeys - List all journeys for authenticated user
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const journeys = await getJourneysByUserId(userId);
    res.json({
      success: true,
      journeys,
    });
  } catch (err: any) {
    console.error('[Get Journeys Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to load journey history.' });
  }
});

// GET /api/journeys/:id - Get specific journey
router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.userId;
    const journey = await getJourneyById(id, userId);

    if (!journey) {
      res.status(404).json({ success: false, message: 'Journey not found' });
      return;
    }

    res.json({
      success: true,
      journey,
    });
  } catch (err: any) {
    console.error('[Get Journey By Id Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch journey details.' });
  }
});

// DELETE /api/journeys/:id - Delete journey
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.userId;

    const deleted = await deleteJourney(id, userId);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Journey not found or unauthorized' });
      return;
    }

    res.json({
      success: true,
      message: 'Journey removed from history',
    });
  } catch (err: any) {
    console.error('[Delete Journey Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to delete journey.' });
  }
});

export default router;
