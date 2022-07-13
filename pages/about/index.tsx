/* eslint-disable max-len */
import React from 'react';
import Head from 'next/head';
import { Typography } from '@mui/material';
import { createClient } from 'contentful';
import { Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import AboutLayout from '../../components/aboutLayout';
import { getAboutPages } from '../../utils/contentfulUtils';
import options from '../../style/richTextStyles';

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
    !process.env.CONTENTFUL_SPACE_ID
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
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    host: process.env.CONTENTFUL_HOST,
  });

  const [pages, id] = await getAboutPages(client, 'Intro');

  const intro = await client.getEntry<{content:string}>(id, {
    content_type: 'aboutPage',
    select: 'fields.content',
  });
  const text = intro.fields.content;

  return {
    props: {
      pages,
      text,
    },
  };
};

export default AboutHome;
