import styled from 'styled-components';
import { useReactiveVar } from '@apollo/client';
import { themeColorVar } from '../components/layout';

export const Card = styled.div`
  margin: 20px 0;
  width: 60%;
  padding: 20px;
  min-width: 320px;
  background-color: white;
  border-radius: 2px;
  box-shadow: 0 0 2px 2px rgba(0,0,0,0.1);
`;

export const Description = styled.div`
  position: relative;
  font-family: Open Sans, sans-serif;
  width: 100%;
  padding: 4px 0;
  white-space: pre-wrap;
`;

export const SubmitButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  font-family: Open Sans, sans-serif;
  font-weight: 700;
  font-size: 1.2em;
  text-shadow: 0 0 1px black;
  border: 0;
  background-color: rgb(${() => useReactiveVar(themeColorVar).join(',')});;
  color: white;
  filter: hue-rotate(30deg) contrast(1.5);
  cursor: pointer;
  box-shadow: 0 0 1px rgba(0,0,0,0.5);
  letter-spacing: 1px;

  :hover {
    box-shadow: 0 0 1px 1px rgba(0,0,0,0.5);
  }

  :active {
    filter: hue-rotate(30deg) contrast(1.5) brightness(80%);
  }
`;
