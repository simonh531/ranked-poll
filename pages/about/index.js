/* eslint-disable max-len */
import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { createClient } from 'contentful';
import marked from 'marked';

import AboutLayout from '../../components/aboutLayout';

const Title = styled.h1`
  margin: 0;
  font-family: Righteous, cursive;
  font-size: 2.8em;
  text-align: center;
  color: black;
`;

const Text = styled.div`
  font-family: Open Sans, sans-serif;
  line-height: 1.4;
  font-size: 1.2em;
  text-align: justify;
`;

const About = ({ pages = [], text = '' }) => {
  const description = text.split('\n')[0].replace(/\[(.*?)\]\(.*?\)/g, '$1');
  return (
    <AboutLayout pages={pages}>
      <Head>
        <title>About | Ranked Poll</title>
        <meta name="description" key="description" content={description} />
        <meta property="og:url" content="rankedpoll.com/about" key="ogurl" />
        <meta property="og:title" content="About" key="ogtitle" />
        <meta property="og:description" content={description} key="ogdesc" />
        <link rel="canonical" href="https://rankedpoll.com/about" key="canonical" />
      </Head>
      <Title>Ranked Poll</Title>
      {/* eslint-disable-next-line react/no-danger */}
      <Text dangerouslySetInnerHTML={{ __html: marked(text) }} />
    </AboutLayout>
  );
};

export const getStaticProps = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    host: process.env.CONTENTFUL_HOST,
  });

  const entries = await client.getEntries({
    content_type: 'page',
    select: 'fields.title,fields.priority',
  });

  let introId;
  const pages = entries.items.sort(
    (entry1, entry2) => entry1.fields.priority - entry2.fields.priority,
  ).map(({ fields, sys }) => {
    if (fields.title === 'Intro') {
      introId = sys.id;
    }
    return fields.title;
  });

  const intro = await client.getEntry(introId, {
    content_type: 'page',
    select: 'fields.content',
  });

  const text = intro.fields.content;

  return {
    props: {
      pages: [...pages, 'Calculation'], text,
    },
  };
};

export default About;
