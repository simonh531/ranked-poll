import { Pool } from 'pg';
import crypto from 'crypto';
import { pgSettings } from './encrypted';

let decrypted;
if (process.env.NODE_ENV === 'production' && process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_IV) {
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc', // algorithm,
    process.env.ENCRYPTION_KEY,
    process.env.ENCRYPTION_IV,
  );
  decrypted = decipher.update(pgSettings, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  decrypted = JSON.parse(decrypted);
}

const pgConfig = {
  ssl: decrypted,
};

export default new Pool(pgConfig);
