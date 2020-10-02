import { ApolloServer } from 'apollo-server-micro';
import { Pool } from 'pg';
import fs from 'fs';
import typeDefs from '../../apollo/type-defs';
import resolvers from '../../apollo/resolvers';
import PostgresDB from '../../datasource/postgres';

const pgConfig = {
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('/googleSQLSSL/server-ca.pem').toString(),
    key: fs.readFileSync('/googleSQLSSL/client-key.pem').toString(),
    cert: fs.readFileSync('/googleSQLSSL/client-cert.pem').toString(),
  },
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
