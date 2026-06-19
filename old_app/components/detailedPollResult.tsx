import React, {
  useState,
} from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box, Popover, Pagination, Stack, Card, Chip, Typography, useMediaQuery,
  TableContainer, Paper, Table, TableBody, TableHead, TableRow, TableCell,
  Tabs, Tab,
} from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import {
  PairMapping, Pair, Nodes, makeRanks,
} from '../utils/rankedPairsCalc';
import { themeColorVar } from './layout';

function ComparisonCell({
  option1, option2, votes1, votes2,
}:{
  option1: string,
  option2: string,
  votes1: number,
  votes2: number
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <TableCell
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {votes1 - votes2}
      </TableCell>
      <Popover
        sx={{
          pointerEvents: 'none',
        }}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <TableContainer
          // eslint-disable-next-line react/no-array-index-key
          component={Paper}
          sx={{ backgroundColor: '#ffffff' }}
        >
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>
                  {option1}
                </TableCell>
                <TableCell>
                  {votes1}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {option2}
                </TableCell>
                <TableCell>
                  {votes2}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Popover>
    </>
  );
}

const borderRight = {
  borderRight: '2px solid rgba(224,224,224,1)',
};

function DetailedPollResult({
  pairs,
  options,
  rankedPairs,
  detailStep,
  history,
}:{
  pairs: PairMapping,
  options: string[],
  rankedPairs: Pair[],
  detailStep: string,
  history: Nodes[],
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [tab, setTab] = useState(0);

  const [step, setStep] = useState(1);
  const { rankings } = makeRanks(history[step - 1], pairs, options);
  const themeColor = useReactiveVar(themeColorVar);
  if (detailStep === 'grid') {
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <Box sx={{ display: 'flex' }}>
        <TableContainer
          component={Paper}
          sx={{ backgroundColor: '#ffffff' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={borderRight}>&mdash;</TableCell>
                {options.map((option) => (
                  <TableCell key={option}>{option}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {options.map((option1) => (
                <TableRow key={option1}>
                  <TableCell variant="head" sx={borderRight}>
                    {option1}
                  </TableCell>
                  {options.map((option2) => {
                    if (option1 === option2) {
                      return (<TableCell key={option2}>&mdash;</TableCell>);
                    }
                    const alphabeticalOrder = [option1, option2].sort();
                    const option1First = alphabeticalOrder[0] === option1;
                    const match = pairs[JSON.stringify(alphabeticalOrder)];
                    return (
                      <ComparisonCell
                        key={option2}
                        option1={option1}
                        option2={option2}
                        votes1={option1First ? match[0] : match[1]}
                        votes2={option1First ? match[1] : match[0]}
                      />
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  } if (detailStep === 'sort') {
    const pairList = (
      <Box>
        <TableContainer sx={{ paddingBottom: '4px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  Pair Matchup
                </TableCell>
                <TableCell>
                  Strength of Victory
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rankedPairs.map((pair, index) => (
                <TableRow
                      // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  sx={{
                    opacity: step - 1 > index ? '0.4' : '1',
                    outline: step - 1 === index ? `4px solid ${themeColor}` : '',
                    cursor: step - 1 === index ? '' : 'pointer',
                    '&:hover': {
                      boxShadow: step - 1 === index ? '' : `inset 0 0 4px 1px ${themeColor}`,
                    },
                  }}
                  onClick={() => setStep(index + 1)}
                >
                  <TableCell>
                    <TableContainer
                      component={Paper}
                      sx={{ backgroundColor: '#ffffff' }}
                    >
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              {pair.winner.name}
                            </TableCell>
                            <TableCell>
                              {pair.winner.votes}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              {pair.loser.name}
                            </TableCell>
                            <TableCell>
                              {pair.loser.votes}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TableCell>
                  <TableCell>
                    {pair.winner.votes / (pair.winner.votes + pair.loser.votes + 1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
    const rankingStack = (
      <Stack spacing={1} sx={{ width: { xs: '100%', sm: '400px' } }}>
        {rankings.map((rank, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Card key={index} sx={{ padding: 1, display: 'flex', backgroundColor: '#ffffff' }}>
            <Typography variant="h4">
              {index + 1}
            </Typography>
            <Box sx={{
              display: 'flex', flex: '1', alignItems: 'center', justifyContent: 'space-evenly',
            }}
            >
              {rank.map((option) => (
                <Chip
                  label={option}
                  key={option}
                  color={
                    option === rankedPairs[step - 1].winner.name
                    || option === rankedPairs[step - 1].loser.name
                      ? 'primary' : 'default'
                  }
                />
              ))}
            </Box>
          </Card>
        ))}
      </Stack>
    );

    if (isXs) {
      return (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 1 }}>
            <Pagination
              size="small"
              count={history.length}
              page={step}
              onChange={(_, value) => setStep(value)}
            />
          </Box>
          <Tabs
            variant="fullWidth"
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{ marginBottom: 1 }}
          >
            <Tab label="Rankings" sx={{ textTransform: 'none' }} />
            <Tab label="Ranked Pairs" sx={{ textTransform: 'none' }} />
          </Tabs>
          {tab === 0 ? (
            <>
              <TableContainer
                component={Paper}
                sx={{ backgroundColor: '#ffffff', marginBottom: 1 }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {rankedPairs[step - 1].winner.name}
                      </TableCell>
                      <TableCell>
                        {rankedPairs[step - 1].winner.votes}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {rankedPairs[step - 1].loser.name}
                      </TableCell>
                      <TableCell>
                        {rankedPairs[step - 1].loser.votes}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {rankingStack}
            </>
          ) : pairList}
        </>
      );
    }

    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 1 }}>
          <Pagination
            count={history.length}
            page={step}
            onChange={(_, value) => setStep(value)}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
          {pairList}
          {rankingStack}
        </Box>
      </>
    );
  }
}

export default DetailedPollResult;
