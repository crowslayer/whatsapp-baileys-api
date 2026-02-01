import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-api',
  },
  app: {
    name: process.env.APP_NAME || 'WhatsApp Baileys API',
    version: process.env.APP_VERSION || '1.0.0',
  },
};