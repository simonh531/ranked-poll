import React, {
  useState, useEffect, Fragment, useMemo,
} from 'react';
import { useRouter } from 'next/router';
import { gql, useMutation } from '@apollo/client';
import {
  Box, Typography, Divider, FormGroup, FormControlLabel, IconButton, Switch, Button,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { RankedOption, UnrankedOption, SkeletonOption } from './pollOption';

const VOTE = gql`
  mutation vote($input: VoteInput!) {
    vote(input: $input)
  }
`;

function randomizeArray(array) {
  if (!array.length) {
    return [];
  }
  const arrayCopy = [...array];
  let targetIndex = array.length - 1;
  let temp;
  let randomIndex;

  while (targetIndex) {
    randomIndex = Math.floor(Math.random() * (targetIndex + 1));

    temp = arrayCopy[randomIndex];
    arrayCopy[randomIndex] = arrayCopy[targetIndex];
    arrayCopy[targetIndex] = temp;

    targetIndex -= 1;
  }

  return arrayCopy;
}

function DragTarget({ area, action }:{
  area: string,
  // eslint-disable-next-line no-unused-vars
  action:(event:React.DragEvent<HTMLDivElement>) => void
}) {
  const [isTarget, setIsTarget] = useState(false);
  return (
    <Box
      sx={{ height: '8px', position: 'relative' }}
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={() => setIsTarget(true)}
      onDragLeave={() => setIsTarget(false)}
      onDrop={(event) => {
        setIsTarget(false);
        action(event);
      }}
    >
      <Box sx={{
        [area]: '-1px',
        position: 'absolute',
        height: '2px',
        width: '100%',
        backgroundColor: isTarget ? 'text.primary' : 'transparent',
        pointerEvents: 'none', // interferes with the drag area
      }}
      />
    </Box>
  );
}

function PollVote({
  id, options, randomize, actualCount, // dataLayer,
}:{
  id: string,
  options: string[],
  randomize: boolean,
  actualCount: number,
}) {
  const router = useRouter();
  const orderedOptions = useMemo(() => {
    if (randomize) {
      return randomizeArray(options);
    }
    return options;
  }, [options, randomize]);

  const [rank, setRank] = useState<{ up: string[], down: string[]}>({ up: [], down: [] });
  const reset = () => {
    setRank({ up: [], down: [] });
  };

  const [submitted, setSubmitted] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  const [outlineNeutral, setOutlineNeutral] = useState(false);
  const [isDragging, setIsDragging] = useState('');

  const [vote, { data: voteData, loading }] = useMutation(VOTE, {
    refetchQueries: ['poll'], // use to refresh count. Only server knows if it went up
    variables: {
      input: {
        user: null,
        pollId: id,
        vote: rank.up,
        lowVote: rank.down,
      },
    },
  });

  useEffect(() => {
    if (voteData?.vote) {
      setSubmitted(true);
    }
  }, [voteData?.vote]);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.8em', flex: '1' }}>
          Select any number of options:
        </Typography>
        <IconButton size="small" onClick={reset} disabled={submitted}>
          <span className="material-icons">refresh</span>
        </IconButton>
      </Box>
      <Box sx={submitted ? { pointerEvents: 'none', opacity: '0.6' } : null}>
        <FormGroup>
          {rank.up.map((option, index) => (
            <RankedOption
              rank={index + 1}
              label={option}
              key={option}
              setIsDragging={setIsDragging}
              isDragging={isDragging}
              rankKey="up"
              setRank={setRank}
              index={index}
              last={index === rank.up.length - 1}
            />
          ))}
        </FormGroup>
        <DragTarget
          area="top"
          action={(event) => setRank(
            (prevValue) => {
              const filter = (label) => label !== event.dataTransfer.getData('text/plain');
              const up = prevValue.up.filter(filter);
              up.unshift(event.dataTransfer.getData('text/plain'));
              setIsDragging('');
              return {
                up,
                down: prevValue.down.filter(filter),
              };
            },
          )}
        />
        {rank.up.length ? <Divider /> : null}
        <FormGroup
          sx={{ paddingTop: 1, paddingBottom: 1, position: 'relative' }}
        >
          {options ? orderedOptions.filter(
            (option) => !rank.up.includes(option) && !rank.down.includes(option),
          ).map((option) => (
            <UnrankedOption
              label={option}
              key={option}
              setRank={setRank}
              advanced={advanced}
              setIsDragging={setIsDragging}
            />
          )) : (
            <>
              <SkeletonOption />
              <SkeletonOption />
              <SkeletonOption />
            </>
          )}
          <Box
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => setOutlineNeutral(true)}
            onDragLeave={() => setOutlineNeutral(false)}
            onDrop={(event) => {
              setOutlineNeutral(false);
              setIsDragging('');
              setRank((prevValue) => {
                const filter = (label) => label !== event.dataTransfer.getData('text/plain');
                return {
                  up: prevValue.up.filter(filter),
                  down: prevValue.down.filter(filter),
                };
              });
            }}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              pointerEvents: isDragging === 'ranked' ? '' : 'none',
              outline: outlineNeutral ? '2px solid rgba(0,0,0,0.87)' : '',
            }}
          />
        </FormGroup>
        {rank.down.length ? <Divider /> : null}
        <FormGroup>
          <DragTarget
            area="bottom"
            action={(event) => setRank(
              (prevValue) => {
                const filter = (label) => label !== event.dataTransfer.getData('text/plain');
                const down = prevValue.down.filter(filter);
                down.unshift(event.dataTransfer.getData('text/plain'));
                setIsDragging('');
                return {
                  up: prevValue.up.filter(filter),
                  down,
                };
              },
            )}
          />
          {rank.down.map((option, index) => (
            <RankedOption
              rank={orderedOptions.length - rank.down.length + index + 1}
              label={option}
              key={option}
              setIsDragging={setIsDragging}
              isDragging={isDragging}
              rankKey="down"
              setRank={setRank}
              index={index}
              last={index === rank.down.length - 1}
            />
          ))}
        </FormGroup>
      </Box>
      <FormControlLabel
        control={(
          <Switch
            checked={advanced}
            onChange={(event) => setAdvanced(event.target.checked)}
          />
          )}
        label="Advanced"
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        { submitted ? (
          <Button
            variant="contained"
            sx={{ textTransform: 'none' }}
            disabled
          >
            Vote Submitted
          </Button>
        ) : (
          <LoadingButton
            variant="contained"
            sx={{ textTransform: 'none' }}
            loading={loading}
            endIcon={<span className="material-icons">how_to_vote</span>}
            onClick={() => vote()}
          >
            Vote
          </LoadingButton>
        )}
        <Typography sx={{ flex: '1', marginLeft: 1 }}>
          {(actualCount || 0) + (actualCount === 1 ? ' vote' : ' votes')}
        </Typography>
        <Button
          variant="text"
          sx={{ textTransform: 'none', color: 'text.primary' }}
          onClick={() => router.push(
            `${router.asPath}/?results`,
            undefined,
            { shallow: true },
          )}
        >
          See Results
        </Button>
        <Button
          onClick={() => navigator.clipboard.writeText(`rnkd.pl/${id}`)}
          variant="contained"
          startIcon={<span className="material-icons">content_copy</span>}
          sx={{ textTransform: 'none' }}
        >
          {`rnkd.pl/${id}`}
        </Button>
      </Box>
    </>
  );
}

export default PollVote;
