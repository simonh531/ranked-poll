import React, {
  useState, useEffect,
} from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  gql, useLazyQuery, useReactiveVar,
} from '@apollo/client';
import {
  Container, Paper, Box, Skeleton, Typography, Divider,
} from '@mui/material';
import { Client } from 'pg';
import { themeColorVar, historyVar } from '../../components/layout';
import PollVote from '../../components/pollVote';
import PollResult from '../../components/pollResult';
import { toHex } from '../../style/colorTools';

const POLL = gql`
  query poll($id: ID!) {
    poll(id: $id) {
      id
      description
      count
      cookieCount
      ipCount
      protection
      createdAt
    }
  }
`;

function Poll({
  title, options, randomize, color, // dataLayer,
}:{
  title: string,
  options: string[],
  randomize: boolean,
  color: number,
}) {
  const router = useRouter();

  const [windowResults, setWindowResults] = useState(false);
  useEffect(() => {
    setWindowResults(window.location.search.slice(1, 8) === 'results');
  }, []);
  const results = windowResults || (router.query && 'results' in router.query);

  const [windowId, setWindowId] = useState('');
  useEffect(() => {
    setWindowId(window.location.pathname.split('/')[2]);
  }, []);

  let id = windowId;
  if (router.query && router.query.id) {
    if (Array.isArray(router.query.id)) {
      [id] = router.query.id;
    } else {
      id = router.query.id;
    }
  }

  useEffect(() => {
    if (id && title) {
      const targetPath = `/poll/${id}/${
        title.replace(/[^\w\d\s]/g, '').replace(/\s/g, '_')
      }${results ? '?results' : ''}`;
      if (router.asPath !== targetPath) {
        router.replace(
          targetPath,
          undefined,
          { shallow: true },
        );
      }
    }
  }, [id, results, router, title]);

  const [
    getPollData,
    { /* loading: pollLoading, */ data: pollData },
  ] = useLazyQuery(POLL, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  });

  const {
    description, count, cookieCount, ipCount, userCount, protection, createdAt,
  } = pollData?.poll || {};

  // initialize
  useEffect(() => {
    if (id) {
      getPollData();
    }
  }, [getPollData, id]);

  const history = useReactiveVar(historyVar);
  useEffect(() => {
    if (id && title) {
      try {
        const newHistory = [...history];
        const index = history.findIndex(({ id: itemId }) => itemId === id);
        if (index !== -1) {
          newHistory.splice(index, 1);
        }
        newHistory.unshift({ id, title });
        historyVar(newHistory);
        window.localStorage.setItem('history', JSON.stringify(newHistory));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, title]);

  useEffect(() => {
    if (color) {
      themeColorVar(`#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`);
    } else {
      themeColorVar('#bbb');
    }
  }, [color]);

  let actualCount;

  if (protection === 'none') {
    actualCount = count;
  } else if (protection === 'cookie_id') {
    actualCount = cookieCount;
  } else if (protection === 'ip') {
    actualCount = ipCount;
  } else if (protection === 'user_id') {
    actualCount = userCount;
  }

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}
    >
      <Head>
        <title>
          {`${title ? `${title} |` : ''} Ranked Poll`}
        </title>
        <meta name="description" key="description" content={`${title} | ${options && options.join('| ')}`} />
        <meta property="og:url" content={`rankedpoll.com/poll/${id}`} key="ogurl" />
        <meta property="og:title" content={title} key="ogtitle" />
        <meta property="og:description" content={options && options.join('| ')} key="ogdesc" />
        <link rel="canonical" href={`https://rankedpoll.com/poll/${id}/${title}`} key="canonical" />
      </Head>
      <Box sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
      >
        <Container>
          <Paper sx={{ padding: { xs: 2, sm: 4 } }}>
            <Typography variant="h1" sx={{ fontSize: '1.6em' }}>
              {title || <Skeleton />}
            </Typography>
            <Divider />
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontSize: '0.8em' }}>
              {(createdAt && new Date(parseInt(createdAt, 10)).toLocaleString(undefined, {
                dateStyle: 'medium', timeStyle: 'short',
              })) || <Skeleton />}
            </Typography>
            <Typography>
              {title ? description : <Skeleton />}
            </Typography>
            {results ? (
              <PollResult
                id={id}
                options={options}
                protection={protection}
                actualCount={actualCount}
              />
            ) : (
              <PollVote
                id={id}
                options={options}
                randomize={randomize}
                actualCount={actualCount}
              />
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export const getStaticPaths = async () => ({
  paths: [],
  fallback: true,
});

export const getStaticProps = async ({ params }) => {
  const client = new Client();
  await client.connect();
  const text = 'SELECT title, options, randomize, color FROM poll WHERE id = $1';
  // title shouldn't change because changing question can be misleading after the fact
  // options shouldn't change because late options can be forced to have a disadvantage
  const values = [params.id[0]];
  try {
    const res = await client.query(text, values);
    if (res.rows.length) {
      const {
        title, options, randomize, color,
      } = res.rows[0];

      return {
        props: {
          title, options, randomize, color,
        },
      };
    }

    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  } catch (err) {
    return null;
  }
};

export default Poll;
