import React from 'react';
import {
  ApolloProvider, ApolloClient, InMemoryCache,
} from '@apollo/client';
import { Provider } from 'next-auth/client';

import Layout from '../components/layout';
import '../style/style.css';

const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache(),
});

export default function App({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <ApolloProvider client={client}>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Layout>
      </ApolloProvider>
    </Provider>
  );
}
