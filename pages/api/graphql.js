import { ApolloServer } from 'apollo-server-micro';
import { Pool } from 'pg';
import typeDefs from '../../apollo/type-defs';
import resolvers from '../../apollo/resolvers';
import PostgresDB from '../../datasource/postgres';

const pgConfig = {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: process.env.SERVER_CA,
    key: process.env.CLIENT_KEY,
    cert: process.env.CLIENT_CERT,
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
