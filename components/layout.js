import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Head from 'next/head';
import { makeVar, useReactiveVar } from '@apollo/client';

export const themeColorVar = makeVar([255, 255, 255]);

const Nav = styled.nav`
  position: relative;
  height: 40px;
  box-shadow: 0 0 2px 2px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  background-color: rgba(255,255,255,0.9);
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

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: rgb(${() => useReactiveVar(themeColorVar).join(',')});
`;

const Footer = styled.footer`
  background-color: rgba(255,255,255,0.9);
  padding: 8px 0;
  display: flex;
  justify-content: center;
`;

const FooterCenter = styled.div`
  font-family: Open Sans, sans-serif;
  width: 60%;
  min-width: 320px;
  display: flex;
`;

const FooterA = styled.a`
  color: black;
  text-decoration: none;
  margin-right: 1ch;

  :hover {
    text-decoration: underline;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

export default function Layout({ children }) {
  return (
    <Screen>
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
        {/* <Account className="material-icons">account_circle</Account> */}
      </Nav>
      {children}
      <Footer>
        <FooterCenter>
          <Link href="/" passHref><FooterA>Home</FooterA></Link>
          <Link href="/about" passHref><FooterA>About</FooterA></Link>
          <Spacer />
          <div>
            &copy; Copyright
            {' '}
            {new Date(Date.now()).getFullYear()}
            {' '}
            Ranked Poll
          </div>
        </FooterCenter>
      </Footer>
    </Screen>
  );
}
