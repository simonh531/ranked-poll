/* eslint-disable max-len */
import React from 'react';
import Head from 'next/head';
import { Typography } from '@mui/material';
import { createClient } from 'contentful';
import { Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import AboutLayout from '../../components/aboutLayout';
import options from '../../style/richTextStyles';
import { getAboutPages } from '../../utils/contentfulUtils';

function AboutPage({ pages = ['Intro'], title, text }:{ pages:string[], title: string, text: Document}) {
  return (
    <AboutLayout pages={pages}>
      <Head>
        <title>
          {`${title} | Ranked Poll About`}
        </title>
        {/* <meta name="description" key="description" content={description} /> */}
        <meta property="og:url" content={`rankedpoll.com/about/${title}`} key="ogurl" />
        <meta property="og:title" content={title} key="ogtitle" />
        {/* <meta property="og:description" content={description} key="ogdesc" /> */}
        <link rel="canonical" href={`https://rankedpoll.com/about/${title}`} key="canonical" />
      </Head>
      <Typography
        variant="h1"
        sx={{
          fontSize: '2.6em',
          textAlign: 'center',
        }}
      >
        {title}
      </Typography>
      {documentToReactComponents(text, options)}
    </AboutLayout>
  );
}

export const getStaticPaths = async () => ({
  paths: [
    { params: { title: 'Intro' } },
    { params: { title: 'Method' } },
    { params: { title: 'Double Voting' } },
    // { params: { title: 'Open Source' } },
  ],
  fallback: true,
});

export const getStaticProps = async ({ params }) => {
  if (
    !process.env.CONTENTFUL_SPACE
    || !process.env.CONTENTFUL_ACCESS_TOKEN
    || !process.env.CONTENTFUL_HOST
  ) {
    return {
      props: {
        pages: ['Calculation'],
        title: params.title,
        text: '',
      },
    };
  }

  const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    host: process.env.CONTENTFUL_HOST,
  });
  try {
    const [pages, id] = await getAboutPages(client, params.title);

    const content = await client.getEntry<{content:string}>(id, {
      content_type: 'aboutPage',
      select: 'fields.content',
    });
    const text = content.fields.content;

    if (text) {
      return {
        props: {
          pages,
          title: params.title,
          text,
        },
      };
    }

    return {
      redirect: {
        destination: '/about',
        permanent: false,
      },
    };
  } catch (err) {
    return null;
  }
};

export default AboutPage;
