import React, {
  useState, useEffect,
} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { HexColorPicker } from 'react-colorful';
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import {
  Box, Container, Paper, IconButton, FormControl, Button,
  Typography, TextField, Checkbox, ClickAwayListener,
  FormControlLabel, RadioGroup, Radio,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
// import PollOption from '../components/pollOption';
import { DataLayerArgs } from 'react-gtm-module';
import { themeColorVar } from '../components/layout';
import { mainColor } from '../style/colors';

const CREATE_POLL = gql`
  mutation createPoll($input: CreatePollInput!) {
    createPoll(input: $input) {
      id
    }
  }
`;

const matcher = /^#?([0-9A-F]{3,8})$/i;
const validHex = (value: string) => {
  const match = matcher.exec(value);
  const length = match ? match[1].length : 0;

  return (
    length === 3 // '#rgb' format
    || length === 6 // '#rrggbb' format
  );
};

function MUIColorInput({ color, setColor }:{
  color: string,
  // eslint-disable-next-line no-unused-vars
  setColor: (newColor: string) => void
}) {
  const [value, setValue] = useState(color);
  const [showPicker, setShowPicker] = useState(false);
  useEffect(() => {
    setValue(color);
  }, [color]);
  return (
    <ClickAwayListener onClickAway={() => setShowPicker(false)}>
      <Box sx={{ width: '200px', position: 'relative' }}>
        <TextField
          label="Color"
          size="small"
          value={value}
          onChange={(event) => {
            const input = `#${event.target.value.replace(/([^0-9A-F]+)/gi, '').substr(0, 6)}`;
            setValue(input);
            if (validHex(input)) {
              setColor(input);
            }
          }}
          onFocus={() => setShowPicker(true)}
          onBlur={(event) => {
            if (validHex(event.target.value)) {
              setColor((value.charAt(0) === '#' ? '' : '#') + value);
            } else {
              setColor(color);
            }
          }}
        />
        <Box sx={{
          position: 'absolute',
          height: '16px',
          width: '16px',
          right: '12px',
          top: '12px',
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          pointerEvents: 'none',
        }}
        />
        {showPicker && (
          <HexColorPicker
            color={color}
            onChange={(newColor) => setColor(newColor)}
          />
        )}
      </Box>
    </ClickAwayListener>
  );
}

// eslint-disable-next-line no-unused-vars
function Home({ dataLayer }:{ dataLayer: (dataLayerArgs: DataLayerArgs) => void}) {
  const [title, setTitle] = useState('');
  const [description, setdescription] = useState('');
  const [randomize, setRandomize] = useState(true);
  const [options, setOptions] = useState<[number, string][]>([
    [new Date().valueOf() - 2, ''],
    [new Date().valueOf() - 1, ''],
    [new Date().valueOf(), ''],
  ]);
  const [protection, setProtection] = useState('cookie_id');
  const themeColor = useReactiveVar(themeColorVar);
  useEffect(() => {
    if (themeColor === '#bbb') {
      themeColorVar(mainColor);
    }
  }, []);

  // const [history, setHistory] = useState([]);
  // useEffect(() => {
  //   const historyItem = localStorage.getItem('history');
  //   if (historyItem) {
  //     setHistory(JSON.parse(historyItem));
  //   }
  // }, []);

  const optionValues = options.map((idValuePair) => idValuePair[1].replace(/\s/g, ''));
  let invalid = false;
  const filteredOptions = optionValues.filter((option) => option);
  const [createPoll, { data, loading }] = useMutation(CREATE_POLL, {
    variables: {
      input: {
        title,
        description,
        owner: null,
        options: optionValues.filter((option) => option),
        color: [
          parseInt(themeColor.slice(1, 3), 16),
          parseInt(themeColor.slice(3, 5), 16),
          parseInt(themeColor.slice(5, 7), 16),
        ],
        randomize,
        protection,
      },
    },
  });

  const router = useRouter();

  useEffect(() => {
    const id = data?.createPoll?.id;
    if (id) {
      router.push(`/poll/${id}`);
    }
  }, [data]);

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '3em',
          color: 'rgba(255,255,255,0.87)',
          textShadow: 'black 0 0 8px',
          marginBottom: 4,
        }}
      >
        Share ranked polls!
        {' '}
        <Link href="/about" passHref>
          <Button
            color="info"
            variant="contained"
            component="a"
            sx={{
              verticalAlign: 'bottom',
              fontFamily: 'Merriweather, serif',
              textTransform: 'none',
              textShadow: 'none',
              fontSize: '0.5em',
            }}
          >
            Why?
          </Button>
        </Link>
      </Typography>
      <Container>
        <Paper sx={{ padding: 4 }}>
          <TextField
            label="Question"
            variant="filled"
            required
            fullWidth
            margin="dense"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextField
            label="Details"
            variant="filled"
            fullWidth
            multiline
            margin="dense"
            value={description}
            onChange={(event) => setdescription(event.target.value)}
          />
          {options.map(([id, pollOption], index) => {
            let lastOne = false;
            if (index === options.length - 1) {
              lastOne = true;
            }
            const onChange = (e) => {
              setOptions((prevOptions) => {
                const newOptions = [...prevOptions];
                newOptions[index] = [id, e.target.value];
                if (lastOne) {
                  newOptions.push([new Date().valueOf(), '']);
                }
                return newOptions;
              });
            };
            const cancel = () => {
              setOptions((prevOptions) => {
                prevOptions.splice(index, 1);
                return [...prevOptions];
              });
            };
            let helperText = '';
            const optionNoWhitespace = pollOption.replace(/\s/g, '');
            if (
              index !== optionValues.length - 1
              && optionNoWhitespace
            ) { // no errors on last one
              if (
                optionValues.indexOf(optionNoWhitespace) !== index
              ) {
                helperText = 'Option cannot be a duplicate';
                invalid = true;
              }
            }
            return (
              <Box sx={{ display: 'flex', alignItems: 'baseline' }} key={id}>
                <Checkbox sx={{ pointerEvents: 'none' }} tabIndex={-1} />
                <TextField
                  required={index === 0 || index === 1}
                  error={helperText !== ''}
                  helperText={helperText}
                  id="filled-basic"
                  label="Answer"
                  variant="filled"
                  fullWidth
                  margin="dense"
                  sx={{ marginRight: 1 }}
                  size="small"
                  value={pollOption}
                  onChange={onChange}
                />
                <IconButton
                  aria-label="delete"
                  onClick={cancel}
                  sx={lastOne ? {
                    pointerEvents: 'none', visibility: 'hidden',
                  } : {}}
                >
                  <span className="material-icons">close</span>
                </IconButton>
              </Box>
            );
          })}
          <FormControl>
            <RadioGroup
              row
              value={protection}
              onChange={(event) => setProtection(event.target.value)}
            >
              <FormControlLabel value="ip" control={<Radio />} label="One vote per IP" />
              <FormControlLabel value="cookie_id" control={<Radio />} label="One vote per browser" />
              <FormControlLabel value="none" control={<Radio />} label="Unlimited Votes" />
            </RadioGroup>
          </FormControl>
          <Box>
            <MUIColorInput
              color={themeColor}
              setColor={(newColor) => themeColorVar(newColor)}
            />
          </Box>
          <FormControlLabel
            sx={{ display: 'block' }}
            control={(
              <Checkbox
                checked={randomize}
                onChange={(event) => setRandomize(event.target.checked)}
              />
            )}
            label="Shuffle option order"
          />
          <LoadingButton
            disabled={invalid || !title || filteredOptions.length < 2}
            type="submit"
            size="large"
            onClick={(e) => {
              e.preventDefault();
              if (!loading) {
                createPoll();
                dataLayer({
                  dataLayer: { event: 'poll-submit-clicked' },
                });
              }
            }}
            endIcon={<span className="material-icons">send</span>}
            loading={loading}
            loadingPosition="end"
            variant="contained"
          >
            Submit
          </LoadingButton>
        </Paper>
      </Container>
    </Box>
  );
}

export default Home;
