import styled from 'styled-components';
import { useReactiveVar } from '@apollo/client';
import { themeColorVar } from '../components/layout';
import { toSecondary, toTertiary } from './colors';

export const Card = styled.div`
  margin: 20px 0;
  width: 60%;
  padding: 20px;
  min-width: 320px;
  background-color: white;
  border-radius: 2px;
  box-shadow: 0 0 2px 2px ${() => toTertiary(useReactiveVar(themeColorVar))};
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
  background-color: ${() => toSecondary(useReactiveVar(themeColorVar))};
  color: white;
  box-shadow: 0 0 1px rgba(0,0,0,0.5);
  letter-spacing: 1px;

  ${(props) => {
    if (!props.disabled) {
      return `
      cursor: pointer;

      :hover {
        box-shadow: 0 0 1px 1px rgba(0,0,0,0.5);
      }

      :active {
        filter: brightness(80%);
      }
      `;
    }
    return 'opacity: 0.3;';
  }}
`;
