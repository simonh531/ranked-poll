import { Pool } from 'pg';
import crypto from 'crypto';
import { pgSettings } from './encrypted';

let decrypted;
if (
  process.env.NODE_ENV === 'production'
  && process.env.ENCRYPTION_KEY
  && process.env.ENCRYPTION_IV
) {
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc', // algorithm,
    process.env.ENCRYPTION_KEY,
    process.env.ENCRYPTION_IV,
  );
  let temp = decipher.update(pgSettings, 'base64', 'utf8');
  temp += decipher.final('utf8');
  decrypted = JSON.parse(temp);
}

const pgConfig = {
  ssl: decrypted,
};

export default new Pool(pgConfig);
