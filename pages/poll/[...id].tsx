import React, {
  useState, useEffect,
} from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  gql, useLazyQuery,
} from '@apollo/client';
import {
  Container, Paper, Box, Skeleton, Typography, Divider,
} from '@mui/material';
import { Client } from 'pg';
import { themeColorVar } from '../../components/layout';
import PollVote from '../../components/pollVote';
import PollResult from '../../components/pollResult';

// const Results = ({ pairs, votes }) => (
//   <div>
//     <Section title="Advanced" headerSize="1.4">
//       <Section title="Votes" headerSize="1.2">
//         <table>
//           <thead>
//             <tr>
//               <th>Count</th>
//               <PreferenceHeader>Preferences</PreferenceHeader>
//             </tr>
//           </thead>
//           <tbody>
//             {votes.map((datum) => (
//               <tr key={datum.vote}>
//                 <TableNumber>{datum.count}</TableNumber>
//                 <td>
//                   {datum.vote.join(' > ')}
//                   {datum.lowVote.length ? ` >>> ${datum.lowVote.join(' > ')}` : ''}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </Section>
//       <Section title="Pair Results" headerSize="1.2">
//         <PairTable>
//           {pairs.map((pairData, index) => {
//             const order = Object.entries(pairData).sort(
//               // eslint-disable-next-line no-unused-vars
//               ([_, score1], [__, score2]) => score2 - score1,
//             );
//             return (
//               // eslint-disable-next-line react/no-array-index-key
//               <Fragment key={index}>
//                 <tbody>
//                   <tr>
//                     <PairBox winner={order[0][1] > order[1][1]}>{order[0][1]}</PairBox>
//                     <PairBox winner={order[0][1] > order[1][1]}>{order[0][0]}</PairBox>
//                   </tr>
//                   <tr>
//                     <PairBox>{order[1][1]}</PairBox>
//                     <PairBox>{order[1][0]}</PairBox>
//                   </tr>
//                 </tbody>
//                 <tbody>
//                   <PairSpacing />
//                 </tbody>
//               </Fragment>
//             );
//           })}
//         </PairTable>
//       </Section>
//     </Section>
//   </div>
// );

export function toHex(number:number) {
  const hex = number.toString(16);
  if (hex.length === 1) {
    return `0${hex}`;
  }
  return hex;
}

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

  const [results, setResults] = useState(false);
  useEffect(() => {
    setResults(window.location.search.slice(1, 8) === 'results');
  }, [router.query]);

  const [id, setId] = useState(() => {
    if (router.query && router.query.id) {
      if (Array.isArray(router.query.id)) {
        return router.query.id[0];
      }
      return router.query.id;
    }
    return '';
  });
  useEffect(() => {
    if (!id) {
      const paths = window.location.pathname.split('/');
      setId(paths[2]);
    }
  }, []);

  useEffect(() => {
    if (id && title) {
      router.replace(
        `/poll/${id}/${
          title.replace(/[^\w\d\s]/g, '').replace(/\s/g, '_')
        }${results ? '?results' : ''}`,
        undefined,
        { shallow: true },
      );
    }
  }, [title]);

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
      const historyString = localStorage.getItem('history');
      if (!historyString) {
        localStorage.setItem('history', JSON.stringify([{ id, title }]));
      } else {
        const history = JSON.parse(historyString);
        const index = history.findIndex(({ id: itemId }) => itemId === id);
        if (index !== -1) {
          history.splice(index, 1);
        }
        if (history.unshift({ id, title }) > 10) {
          history.pop();
        }
        localStorage.setItem('history', JSON.stringify(history));
      }
    }
  }, [id]);

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
          <Paper sx={{ padding: 4 }}>
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
