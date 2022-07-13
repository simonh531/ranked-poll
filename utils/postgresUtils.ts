import { Pool } from 'pg';
// import crypto from 'crypto';
// import { pgSettings } from './encrypted';

// the reason we keep this in a separate file is because it needs to be
// accessible by multiple APIs

// let decrypted;
// if (
//   process.env.NODE_ENV === 'production'
//   && process.env.ENCRYPTION_KEY
//   && process.env.ENCRYPTION_IV
// ) {
//   const decipher = crypto.createDecipheriv(
//     'aes-128-cbc', // algorithm,
//     process.env.ENCRYPTION_KEY,
//     process.env.ENCRYPTION_IV,
//   );
//   let temp = decipher.update(pgSettings, 'base64', 'utf8');
//   temp += decipher.final('utf8');
//   decrypted = JSON.parse(temp);
// }

const pgConfig = {
  max: parseInt(process.env.PGPOOLCONNECTIONS, 10) - 5,
  // ssl: decrypted,
};

const pool = new Pool(pgConfig);
export default pool;

export const clientSettings = {
  maxConnections: parseInt(process.env.PGPOOLCONNECTIONS, 10),
};
