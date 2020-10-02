import { ApolloServer } from 'apollo-server-micro';
import { Pool } from 'pg';
import typeDefs from '../../apollo/type-defs';
import resolvers from '../../apollo/resolvers';
import PostgresDB from '../../datasource/postgres';

const postgres = new PostgresDB({ pool: new Pool() });

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
