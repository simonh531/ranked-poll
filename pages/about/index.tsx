/* eslint-disable max-len */
import React from 'react';
import Head from 'next/head';
import { Typography } from '@mui/material';
import { createClient } from 'contentful';
import { Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import AboutLayout from '../../components/aboutLayout';
import options from '../../style/richTextStyles';

// const Title = styled.h1`
//   margin: 0;
//   font-family: Righteous, cursive;
//   font-size: 2.8em;
//   text-align: center;
//   color: black;
// `;

// const Text = styled.div`
//   font-family: Open Sans, sans-serif;
//   line-height: 1.4;
//   font-size: 1.2em;
//   text-align: justify;
// `;

function AboutHome({ pages = [], text }:{ pages: string[], text: Document }) {
  return (
    <AboutLayout pages={pages}>
      <Head>
        <title key="title">About | Ranked Poll</title>
        {/* <meta name="description" key="description" content={description} /> */}
        <meta property="og:url" content="rankedpoll.com/about" key="ogurl" />
        <meta property="og:title" content="About" key="ogtitle" />
        {/* <meta property="og:description" content={description} key="ogdesc" /> */}
        <link rel="canonical" href="https://rankedpoll.com/about" key="canonical" />
      </Head>
      <Typography sx={{
        fontFamily: 'Righteous, cursive',
        fontSize: '2.6em',
        textAlign: 'center',
      }}
      >
        Ranked Poll
      </Typography>
      {documentToReactComponents(text, options)}
    </AboutLayout>
  );
}

export const getStaticProps = async () => {
  if (
    !process.env.CONTENTFUL_SPACE
    || !process.env.CONTENTFUL_ACCESS_TOKEN
    || !process.env.CONTENTFUL_HOST
  ) {
    return {
      props: {
        pages: ['Calculation'],
        text: '',
      },
    };
  }

  const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    host: process.env.CONTENTFUL_HOST,
  });

  const entries = await client.getEntries<{title:string, priority:number}>({
    content_type: 'aboutPage',
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

  const intro = await client.getEntry<{content:string}>(introId, {
    content_type: 'aboutPage',
    select: 'fields.content',
  });

  const text = intro.fields.content;

  return {
    props: {
      pages: [...pages, 'Calculation'], text,
    },
  };
};

export default AboutHome;
