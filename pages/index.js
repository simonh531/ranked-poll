import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { gql, useMutation } from '@apollo/client';
import styled from 'styled-components';

import PollOption from '../components/pollOption';

import { Card, Description, SubmitButton } from '../style/card';

const Main = styled.main`
  min-height: calc(100vh - 40px);
  background-color: ${(props) => props.backgroundColor};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  margin: 20px;
  width: 50%;
  font-family: Merriweather, serif;
  font-size: 2.4em;
  text-align: center;
  color: white;
  text-shadow: 0 0 8px black;
`;

const Why = styled.a`
  margin: 0 0.5ch;
  font-size: 0.9em;
  background-color: skyblue;
  filter: saturate(200%);
  padding: 8px;
  border-radius: 4px;
  text-shadow: 0 0 2px black;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
  cursor: pointer;
  color: white;
  text-decoration: none;

  :hover {
    text-decoration: underline;
    box-shadow: 0 0 1px 1px rgba(0,0,0,0.5);
  }
`;

const Question = styled.input`
  font-family: Merriweather, serif;
  border: 0;
  border-bottom: 1px solid black;
  margin-bottom: 8px;
  width: 100%;
  padding: 4px;

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
  padding: 4px;
  border: 0;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  resize: none;
`;

const CREATE_POLL = gql`
  mutation createPoll($input: CreatePollInput!) {
    createPoll(input: $input) {
      id
    }
  }
`;

const Index = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createPoll, { data }] = useMutation(CREATE_POLL);
  const [options, setOptions] = useState({
    [new Date().valueOf()]: '',
    [new Date().valueOf() + 1]: '',
  });

  const router = useRouter();

  useEffect(() => {
    const id = data?.createPoll?.id;
    if (id) {
      router.push(`/poll/${id}`);
    }
  }, [data]);

  return (
    <Main backgroundColor="skyblue">
      <Title>
        Instantly create ranked choice polls!
        <Link href="/about/" passHref><Why>Why?</Why></Link>
      </Title>
      <Card>
        <div>
          <Question type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your question" />
        </div>
        <div>
          <DescriptionBox>
            {description || 'Enter any clarifying details. Feel free to leave blank'}
            <DescriptionTextarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter any clarifying details. Feel free to leave blank" />
          </DescriptionBox>
        </div>
        <div>
          {Object.entries(options).map(([id, pollOption]) => {
            let lastOne = false;
            const ids = Object.keys(options);
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
                onCancel={onCancel}
                lastOne={lastOne}
              />
            );
          })}
        </div>
        <SubmitButton
          type="button"
          onClick={() => createPoll({
            variables: {
              input: {
                title,
                description,
                owner: null,
                options: [...new Set(Object.values(options).filter((value) => value.replace(/\s/g, '')))],
              },
            },
          })}
          disabled={!title || Object.values(options).join('') === ''}
        >
          Submit
        </SubmitButton>
      </Card>
    </Main>
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
