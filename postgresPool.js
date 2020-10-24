import { Pool } from 'pg';
import crypto from 'crypto';
import { pgSettings } from './encrypted';

const decipher = crypto.createDecipheriv(
  'aes-128-cbc', // algorithm,
  process.env.ENCRYPTION_KEY,
  process.env.ENCRYPTION_IV,
);
let decrypted = decipher.update(pgSettings, 'base64', 'utf8');
decrypted += decipher.final('utf8');

const pgConfig = {
  ssl: process.env.NODE_ENV === 'production' ? JSON.parse(decrypted) : null,
};

export default new Pool(pgConfig);
