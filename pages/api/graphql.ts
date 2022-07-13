import { ApolloServer } from 'apollo-server-micro';
import requestIp from 'request-ip';
import Cookies from 'cookies';
import shortid from 'shortid';
import typeDefs from '../../apollo/type-defs';
import resolvers from '../../apollo/resolvers';
import PostgresDB from '../../datasource/postgres';
// import Pool from '../../utils/postgresUtils';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    postgres: new PostgresDB(),
  }),
  context: ({ req, res }) => {
    const cookies = new Cookies(req, res);
    let cookieId = cookies.get('id');
    if (!cookieId) {
      cookieId = shortid.generate();
      cookies.set('id', cookieId, { sameSite: true });
    }
    return ({
      ip: requestIp.getClientIp(req),
      cookieId,
    });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

let serverStarted = false;
async function handler(req, res) {
  if (!serverStarted) {
    await apolloServer.start();
    serverStarted = true;
  }
  return apolloServer.createHandler({ path: '/api/graphql' })(req, res);
}

export default handler;
