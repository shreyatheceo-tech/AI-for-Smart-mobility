import { Router, Request, Response } from 'express';
import { getUserPreferences, upsertUserPreferences } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updatePreferencesSchema } from '../types/index.js';

const router = Router();

// GET /api/preferences
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    let prefs = await getUserPreferences(userId);
    if (!prefs) {
      prefs = {
        userId,
        primaryPriority: 'fastest',
        priorityWeights: { time: 0.35, cost: 0.25, co2: 0.2, safety: 0.1, accessibility: 0.1 },
        accessibilityNeeds: [],
        preferredModes: ['bus', 'metro', 'train', 'car', 'walk', 'cycle', 'multimodal'],
        maxWalkMeters: 800,
      };
      await upsertUserPreferences(prefs);
    }

    res.json({ success: true, preferences: prefs });
  } catch (err: any) {
    console.error('[Get Preferences Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve preferences.' });
  }
});

// PUT /api/preferences
router.put(
  '/',
  requireAuth,
  validateBody(updatePreferencesSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const current = (await getUserPreferences(userId)) || {
        userId,
        primaryPriority: 'fastest',
        priorityWeights: { time: 0.35, cost: 0.25, co2: 0.2, safety: 0.1, accessibility: 0.1 },
        accessibilityNeeds: [],
        preferredModes: ['bus', 'metro', 'train', 'car', 'walk', 'cycle', 'multimodal'],
        maxWalkMeters: 800,
      };

      const updated = await upsertUserPreferences({
        userId,
        primaryPriority: req.body.primaryPriority || current.primaryPriority,
        priorityWeights: req.body.priorityWeights || current.priorityWeights,
        accessibilityNeeds: req.body.accessibilityNeeds || current.accessibilityNeeds,
        preferredModes: req.body.preferredModes || current.preferredModes,
        maxWalkMeters: req.body.maxWalkMeters || current.maxWalkMeters,
      });

      res.json({
        success: true,
        message: 'Travel preferences updated successfully.',
        preferences: updated,
      });
    } catch (err: any) {
      console.error('[Update Preferences Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to update preferences.' });
    }
  }
);

export default router;
