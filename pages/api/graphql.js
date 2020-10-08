import { ApolloServer } from 'apollo-server-micro';
import { Pool } from 'pg';
import crypto from 'crypto';
import typeDefs from '../../apollo/type-defs';
import resolvers from '../../apollo/resolvers';
import PostgresDB from '../../datasource/postgres';
import { clientCert, clientKey, serverCa } from '../../encrypted';

const getDecrypted = (string) => {
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc', // algorithm,
    process.env.ENCRYPTION_KEY,
    process.env.ENCRYPTION_IV,
  );
  let decrypted = decipher.update(string, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

const pgConfig = {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: getDecrypted(serverCa),
    key: getDecrypted(clientKey),
    cert: getDecrypted(clientCert),
  } : null,
};

const postgres = new PostgresDB({ pool: new Pool(pgConfig) });

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({ postgres }),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
