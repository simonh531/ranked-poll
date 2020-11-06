/* eslint-disable max-len */
import React from 'react';
import styled from 'styled-components';
import { createClient } from 'contentful';
import marked from 'marked';

import AboutLayout from '../../components/aboutLayout';

const Title = styled.h1`
  margin: 0;
  font-family: Merriweather, serif;
  font-size: 2em;
  color: black;
`;

const Text = styled.div`
  font-family: Open Sans, sans-serif;
  line-height: 1.4;
  font-size: 1.2em;
  text-align: justify;
`;

const About = ({ pages = ['Intro'], title, text = '' }) => (
  <AboutLayout pages={pages}>
    <Title>{title}</Title>
    {/* eslint-disable-next-line react/no-danger */}
    <Text dangerouslySetInnerHTML={{ __html: marked(text) }} />
  </AboutLayout>
);

export const getStaticPaths = async () => ({
  paths: [
    { params: { title: 'Intro' } },
    { params: { title: 'Method' } },
    { params: { title: 'Double Voting' } },
  ],
  fallback: true,
});

export const getStaticProps = async ({ params }) => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    host: process.env.CONTENTFUL_HOST,
  });
  try {
    const entries = await client.getEntries({
      content_type: 'page',
      select: 'fields.title,fields.priority',
    });

    let id;
    const pages = entries.items.sort(
      (entry1, entry2) => entry1.fields.priority - entry2.fields.priority,
    ).map(({ fields, sys }) => {
      if (fields.title === params.title) {
        id = sys.id;
      }
      return fields.title;
    });

    const content = await client.getEntry(id, {
      content_type: 'page',
      select: 'fields.content',
    });

    const text = content.fields.content;

    if (text) {
      return {
        props: {
          pages: [...pages, 'Calculation'],
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
    console.log(err);
    return null;
  }
};

export default About;
