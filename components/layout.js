import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Head from 'next/head';
import { makeVar, useReactiveVar } from '@apollo/client';
import { toPrimary, toTertiary } from '../style/colors';

export const themeColorVar = makeVar([0, 110, 110]);

const Nav = styled.nav`
  position: relative;
  height: 40px;
  box-shadow: 0 0 2px 2px ${() => toTertiary(useReactiveVar(themeColorVar))};
  display: flex;
  align-items: center;
  background-color: rgba(255,255,255,0.9);
`;

const A = styled.a`
  font-family: Open Sans, sans-serif;
  font-size: 1.6em;
  color: black;
  text-decoration: none;
  cursor: pointer;
`;

const MainA = styled(A)`
  font-family: Righteous, cursive;
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
  background-color: ${() => toPrimary(useReactiveVar(themeColorVar))};
`;

const Footer = styled.footer`
  background-color: rgba(0,0,0,0.5);
  padding: 8px 0;
  display: flex;
  justify-content: center;
  color: white;
`;

const FooterCenter = styled.div`
  font-family: Open Sans, sans-serif;
  line-height: 1.4;
  padding: 8px;
  width: 60%;
  min-width: 320px;
  display: flex;
  flex-wrap: wrap;
`;

const FooterA = styled.a`
  color: white;
  text-decoration: none;
  margin-right: 1ch;

  :hover {
    text-decoration: underline;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const Grid = styled.main`
  padding: 8px;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr minmax(304px, 60%) 1fr;
  grid-template-rows: max-content min-content max-content;
  gap: 8px;
  grid-template-areas: 
  ". title ." 
  "center-left center center-right"
  ". bottom .";
`;

const Copyright = styled.div`
  /* white-space: nowrap; */
`;

const description = 'Instantly create and share ranked vote polls! Learn about ranked voting and its uses. Free and no sign up needed! Open Source!';

const structuredData = {
  __html: `{
    "@context" : "http://schema.org",
    "@type" : "Organization",
    "logo" : "https://rankedpoll.com/android-chrome-512x512.png",
    "url" : "https://rankedpoll.com",
    "name" : "Ranked Poll",
    "description" : "${description}",
    "email" : "contact@rankedpoll.com"
  }`,
};

export default function Layout({ children }) {
  return (
    <Screen>
      <Head>
        <title>Ranked Poll | Share Ranked Vote Polls</title>
        <meta charSet="UTF-8" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="stylesheet" type="text/css" href="https://necolas.github.io/normalize.css/8.0.1/normalize.css" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather&family=Open+Sans:wght@400;700&family=Righteous&display=swap" rel="stylesheet" />
        <meta property="og:site_name" content="Ranked Poll" key="ogsitename" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="description" key="description" content={description} />
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={structuredData} />
        {/* <meta property="og:image" content={previewImage} key="ogimage" /> */}
        <meta property="og:url" content="rankedpoll.com" key="ogurl" />
        <meta property="og:title" content="Ranked Poll" key="ogtitle" />
        <meta property="og:description" content={description} key="ogdesc" />
        <link rel="canonical" href="https://rankedpoll.com" key="canonical" />
      </Head>
      <Nav>
        <Link href="/" passHref><MainA>Ranked Poll</MainA></Link>
        <Link href="/about" passHref><A>About</A></Link>
        <CenterSpace />
        {/* <Account className="material-icons">account_circle</Account> */}
      </Nav>
      <Grid>
        {children}
      </Grid>
      <Footer>
        <FooterCenter>
          <Link href="/" passHref><FooterA>Home</FooterA></Link>
          <Link href="/about" passHref><FooterA>About</FooterA></Link>
          <FooterA href="https://github.com/shuang5531/ranked-poll">GitHub</FooterA>
          <div>contact@rankedpoll.com</div>
          <Spacer />
          <Copyright>
            &copy;
            {` ${new Date(Date.now()).getFullYear()} `}
            Ranked Poll
          </Copyright>
        </FooterCenter>
      </Footer>
    </Screen>
  );
}
