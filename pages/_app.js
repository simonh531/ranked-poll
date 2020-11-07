import React, { useEffect } from 'react';
import {
  ApolloProvider, ApolloClient, InMemoryCache,
} from '@apollo/client';
import { Provider } from 'next-auth/client';

import TagManager from 'react-gtm-module';

import Layout from '../components/layout';
import '../style/style.css';

const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache(),
});

const tagManagerArgs = {
  gtmId: 'GTM-5655TMW', // is public information
};

export default function App({ Component, pageProps }) {
  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
  }, []);

  return (
    <Provider session={pageProps.session}>
      <ApolloProvider client={client}>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} dataLayer={TagManager.dataLayer} />
        </Layout>
      </ApolloProvider>
    </Provider>
  );
}
