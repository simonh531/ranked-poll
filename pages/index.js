import React, {
  useState, useEffect, useMemo, useRef,
} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import styled from 'styled-components';
import PollOption from '../components/pollOption';
import { themeColorVar } from '../components/layout';

import { Card, Description, SubmitButton } from '../style/card';
import Colors, { toSecondary } from '../style/colors';

const TooltipArea = styled.button`
  padding: 0;
  border: 0;
  cursor: pointer;
  background-color: transparent;
`;

const HelpIcon = styled.span`
  display: inline-block;
  text-align: center;
  line-height: 1em;
  border: 1px solid black;
  border-radius: 50%;
  height: 1.1em;
  width: 1.1em;
  font-size: 0.9em;
`;

const HintText = styled.span`
  margin-left: 8px;
  font-size: 0.9em;
  color: white;
  background-color: #666666;
  border-radius: 2px;
  padding: 0 4px;
  position: relative;
`;

const LeftArrow = styled.div`
  position: absolute;
  right: 100%;
  top: calc(50% - 6px);
  border: 6px solid transparent;
  border-left-width: 0;
  border-right-color: #666666;
`;

const Tooltip = ({ children }) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);

  return (
    <TooltipArea onClick={toggleShow}>
      <HelpIcon>?</HelpIcon>
      {show && (
      <HintText>
        <LeftArrow />
        {children}
      </HintText>
      )}
    </TooltipArea>
  );
};

const Top = styled.div`
  grid-area: title;
`;

const Title = styled.h1`
  margin: 16px 0 4px;
  font-family: Righteous, cursive;
  font-size: 3.2em;
  text-align: center;
  color: white;
  text-shadow: 0 0 8px black;
  font-weight: 400;
`;

const Subtitle = styled.h2`
  margin: 0 0 16px;
  font-family: Merriweather, serif;
  font-size: 1.6em;
  text-align: center;
  color: white;
  text-shadow: 0 0 8px black;
  font-weight: 400;

  @media (max-width: 768px) {
    line-height: 1.5;
    font-size: 1.4em;
    margin-bottom: 12px;
  }
`;

const Why = styled.a`
  margin: 0 0.5ch;
  background-color: ${() => toSecondary(useReactiveVar(themeColorVar))};
  padding: 4px;
  border-radius: 4px;
  text-shadow: 0 0 2px black;
  box-shadow: 0 0 2px 1px rgba(0,0,0,0.5);
  cursor: pointer;
  color: white;
  text-decoration: none;

  :hover {
    text-decoration: underline;
    box-shadow: 0 0 2px 2px rgba(0,0,0,0.5);
  }

  :active {
    filter: brightness(80%);
  }
`;

const Question = styled.input`
  font-family: Merriweather, serif;
  border: 0;
  border-bottom: 1px solid black;
  margin-bottom: 8px;
  width: 100%;
  padding: 4px 0;
  z-index: 1;
  background-color: white;
  position: relative;

  :focus {
    outline: none;
  }
`;

const DescriptionBox = styled(Description)`
  padding-bottom: 1.4em;
  color: transparent;
`;

const DescriptionTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 4px 0;
  border: 0;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  resize: none;
  outline: 0;
`;

const Options = styled.div`
  margin: 24px 0;
`;

const Option = styled.div`
  margin: 8px 0;
  font-family: Open Sans, sans-serif;
`;

const ColorSelect = styled.select`
  margin: 0 1ch;
`;

const CustomColor = styled.span`
  margin: 0 1ch;
`;

const ColorInput = styled.input`
  margin-left: 0.2ch;
  width: 6ch;
`;

const Label = styled.label`
  display: block;
  position: relative;
  padding-top: 1em;
`;

const LabelText = styled.span`
  position: absolute;
  top: ${(props) => (props.show ? '0' : 'calc(1em + 4px)')};
  font-size: 0.8em;
  color: #444444;
  font-family: Open Sans, sans-serif;
  transition: top 0.1s;
`;

const CREATE_POLL = gql`
  mutation createPoll($input: CreatePollInput!) {
    createPoll(input: $input) {
      id
    }
  }
`;

const createCheckFunc = (value, set) => () => {
  set(!value);
};

const createOnBlur = (set, value) => () => {
  if (value) {
    set(true);
  } else {
    set(false);
  }
};

const createOnFocus = (set) => () => set(true);

const Index = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [randomize, setRandomize] = useState(true);
  const [colorName, setColorName] = useState(Object.keys(Colors)[0]);
  const [customColor, setCustomColor] = useState(false);
  const [options, setOptions] = useState({
    [new Date().valueOf()]: '',
    [new Date().valueOf() + 1]: '',
  });
  const [protection, setProtection] = useState('cookie_id');
  const [showTitleLabel, setShowTitleLabel] = useState(false);
  const [showDescriptionLabel, setShowDescriptionLabel] = useState(false);
  const firstRender = useRef(true);

  const themeColor = useReactiveVar(themeColorVar);
  const [createPoll, { data }] = useMutation(CREATE_POLL, {
    variables: {
      input: {
        title,
        description,
        owner: null,
        options: [...new Set(Object.values(options).filter((value) => value.replace(/\s/g, '')))],
        color: themeColor,
        randomize,
        protection,
      },
    },
  });

  const changeColor = (e) => {
    setColorName(e.target.value);
  };

  const setColor = (index) => (e) => {
    const newThemeColor = [
      ...themeColor,
    ];
    newThemeColor[index] = parseInt(e.target.value, 10) || 0;
    themeColorVar(newThemeColor);
  };

  useEffect(() => {
    if (firstRender.current && !(
      themeColor[0] === 0
      && themeColor[1] === 110
      && themeColor[2] === 110
    )) {
      const colorResult = Object.keys(Colors).find(
        (name) => Colors[name][0] === themeColor[0]
        && Colors[name][1] === themeColor[1]
        && Colors[name][2] === themeColor[2],
      );
      if (colorResult) {
        setColorName(colorResult);
      } else {
        setCustomColor(true);
      }
    } else if (!customColor) {
      themeColorVar(Colors[colorName]);
    }
    firstRender.current = false;
  }, [colorName, customColor]);

  const router = useRouter();

  useEffect(() => {
    const id = data?.createPoll?.id;
    if (id) {
      router.push(`/poll/${id}`);
    }
  }, [data]);

  const optionsElement = useMemo(
    () => Object.entries(options).sort(([timeId1], [timeId2]) => timeId1 - timeId2).map(
      ([id, pollOption]) => {
        let lastOne = false;
        const ids = Object.keys(options).sort((timeId1, timeId2) => timeId1 - timeId2);
        if (id === ids[ids.length - 1]) {
          lastOne = true;
        }
        const onChange = (e) => {
          const newOptions = {
            ...options,
            [id]: e.target.value,
          };
          if (lastOne) {
            newOptions[new Date().valueOf()] = '';
          }
          setOptions(newOptions);
        };
        const onCancel = () => {
          const newoptions = { ...options };
          delete newoptions[id];
          setOptions(newoptions);
        };
        return (
          <PollOption
            key={id}
            value={pollOption.value}
            onChange={onChange}
            onCancel={!lastOne && onCancel}
          />
        );
      },
    ),
    [options],
  );

  return (
    <>
      <Top>
        <Title>Ranked Poll</Title>
        <Subtitle>
          Share ranked vote polls!
          <Link href="/about/" passHref><Why>Why?</Why></Link>
        </Subtitle>
      </Top>
      <Card area="center">
        <Label htmlFor="question">
          <LabelText show={showTitleLabel}>Question</LabelText>
          <Question
            type="text"
            id="question"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={createOnFocus(setShowTitleLabel)}
            onBlur={createOnBlur(setShowTitleLabel, title)}
            placeholder="Enter your question"
          />
        </Label>
        <Label htmlFor="details">
          <LabelText show={showDescriptionLabel}>Details</LabelText>
          <DescriptionBox>
            {description || 'Enter any clarifying details. Feel free to leave blank'}
            <DescriptionTextarea
              id="details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={createOnFocus(setShowDescriptionLabel)}
              onBlur={createOnBlur(setShowDescriptionLabel, description)}
              placeholder="Enter any clarifying details. Feel free to leave blank"
            />
          </DescriptionBox>
        </Label>
        <div>
          {optionsElement}
        </div>
        <Options>
          <Option>
            <label htmlFor="protection">
              Double voting protection:
              {' '}
              <select id="protection" onChange={(e) => setProtection(e.target.value)} value={protection}>
                <option value="cookie_id">Browser cookie</option>
                <option value="ip">IP address</option>
                {/* <option value="user_id">Sign in</option> */}
                <option value="none">None</option>
              </select>
            </label>
          </Option>
          <Option>
            <label htmlFor="randomize">
              <input type="checkbox" id="randomize" checked={randomize} onChange={createCheckFunc(randomize, setRandomize)} />
              {' '}
              Randomize option order
            </label>
            {' '}
            <Tooltip>
              Prevents position bias
            </Tooltip>
          </Option>
          <Option>
            <label htmlFor="color">
              Color:
              {customColor ? (
                <CustomColor>
                  <label htmlFor="colorR">
                    R
                    <ColorInput id="colorR" type="number" max="255" value={themeColor[0]} onChange={setColor(0)} />
                  </label>
                  {' '}
                  <label htmlFor="colorG">
                    G
                    <ColorInput id="colorG" type="number" max="255" value={themeColor[1]} onChange={setColor(1)} />
                  </label>
                  {' '}
                  <label htmlFor="colorB">
                    B
                    <ColorInput id="colorB" type="number" max="255" value={themeColor[2]} onChange={setColor(2)} />
                  </label>
                </CustomColor>
              )
                : (
                  <ColorSelect id="color" onChange={changeColor} value={colorName}>
                    {Object.keys(Colors).map((name) => <option key={name}>{name}</option>)}
                  </ColorSelect>
                )}
              {/* <label htmlFor="customColor">
                <input
                  id="customColor"
                  type="checkbox"
                  checked={customColor}
                  onChange={createCheckFunc(customColor, setCustomColor)}
                />
                {' '}
                Custom
              </label> */}
            </label>
          </Option>
        </Options>
        <SubmitButton
          color={themeColor.join(',')}
          type="button"
          onClick={createPoll}
          disabled={!title || Object.values(options).join('') === ''}
        >
          Submit
        </SubmitButton>
      </Card>
    </>
  );
};

export default Index;

// const ViewerQuery = gql`
//   query ViewerQuery {
//     viewer {
//       id
//       email
//     }
//   }
// `

// const Index = () => {
//   const router = useRouter()
//   const { data, loading, error } = useQuery(ViewerQuery)
//   const viewer = data?.viewer
//   const shouldRedirect = !(loading || error || viewer)

//   useEffect(() => {
//     if (shouldRedirect) {
//       router.push('/signin')
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [shouldRedirect])

//   if (error) {
//     return <p>{error.message}</p>
//   }

//   if (viewer) {
//     return (
//       <div>
//         You're signed in as {viewer.email} goto{' '}
//         <Link href="/about">
//           <a>about</a>
//         </Link>{' '}
//         page. or{' '}
//         <Link href="/signout">
//           <a>signout</a>
//         </Link>
//       </div>
//     )
//   }

//   return <p>Loading...</p>
// }
