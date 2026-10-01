import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  getUserPreferences,
  upsertUserPreferences,
} from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../types/index.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName } = req.body;

      const existing = await findUserByEmail(email);
      if (existing) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await createUser(email, passwordHash, fullName);

      // Create default user preferences
      const defaultPrefs = await upsertUserPreferences({
        userId: user.id,
        primaryPriority: 'fastest',
        priorityWeights: { time: 0.35, cost: 0.25, co2: 0.2, safety: 0.1, accessibility: 0.1 },
        accessibilityNeeds: [],
        preferredModes: ['bus', 'metro', 'train', 'car', 'walk', 'cycle', 'multimodal'],
        maxWalkMeters: 800,
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: '7d',
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          preferences: defaultPrefs,
        },
      });
    } catch (err: any) {
      console.error('[Auth Register Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to create user account.' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await findUserByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const preferences = await getUserPreferences(user.id);
      const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: '7d',
      });

      res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          preferences,
        },
      });
    } catch (err: any) {
      console.error('[Auth Login Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to authenticate user.' });
    }
  }
);

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await findUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const preferences = await getUserPreferences(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        preferences,
      },
    });
  } catch (err: any) {
    console.error('[Auth Me Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

export default router;
