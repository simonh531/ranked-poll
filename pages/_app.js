import React from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { Provider } from 'next-auth/client';
import Link from 'next/link';
import styled from 'styled-components';
import Head from 'next/head';

import '../style/style.css';

const Nav = styled.nav`
  position: relative;
  height: 40px;
  box-shadow: 0 0 2px 2px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  z-index: 1;
`;

const A = styled.a`
  font-family: Open Sans, sans-serif;
  font-size: 1.6em;
  margin: 0 8px;
  color: black;
  text-decoration: none;
  cursor: pointer;
`;

const MainA = styled(A)`
  font-family: Merriweather, serif;
  font-size: 2em;
  margin: 0 16px;
`;

const CenterSpace = styled.div`
  flex: 1;
`;

const Account = styled.span`
  font-size: 2.4em;
  margin-right: 8px;
  color: grey;
`;

const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache(),
});

export default function App({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <ApolloProvider client={client}>
        <Head>
          <title>Ranked Poll</title>
          <link rel="stylesheet" type="text/css" href="https://necolas.github.io/normalize.css/8.0.1/normalize.css" />
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Merriweather&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
        </Head>
        <Nav>
          <Link href="/" passHref><MainA>Ranked Poll</MainA></Link>
          <Link href="/about" passHref><A>About</A></Link>
          <CenterSpace />
          <Account className="material-icons">account_circle</Account>
        </Nav>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
        <footer>
          I'm a footer
        </footer>
      </ApolloProvider>
    </Provider>
  );
}
