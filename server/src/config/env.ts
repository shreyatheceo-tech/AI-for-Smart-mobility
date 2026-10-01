import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'mobimind-super-secret-jwt-default-key-production-ready',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  dataDir: path.resolve(process.cwd(), 'data'),
};
