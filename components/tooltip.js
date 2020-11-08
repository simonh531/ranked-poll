import React, { useState } from 'react';
import styled from 'styled-components';
import {
  useReactiveVar,
} from '@apollo/client';

import { themeColorVar } from './layout';
import { toTertiary } from '../style/colors';

const TooltipArea = styled.label`
  font-family: Open Sans, sans-serif;
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const HelpButton = styled.button`
  padding: 0;
  display: inline-block;
  text-align: center;
  line-height: 0.9em;
  border: 1px solid black;
  border-radius: 50%;
  height: 1.1em;
  width: 1.1em;
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  background-color: transparent;

  :hover {
    text-shadow: 0 0 2px ${() => toTertiary(useReactiveVar(themeColorVar))};
    box-shadow: 0 0 2px ${() => toTertiary(useReactiveVar(themeColorVar))};
  }
`;

const HintText = styled.div`
  position: absolute;
  font-size: 0.9em;
  color: white;
  background-color: #666666;
  border-radius: 2px;
  padding: 2px 4px;
  cursor: pointer;
  white-space: nowrap;
  left: calc(100% + 8px);

  @media (max-width: 768px) {
    left: auto;
    right: 0;
    bottom: calc(100% + 8px);
    border-radius: 2px 2px 0 2px;
  }
`;

const Arrow = styled.div`
  position: absolute;
  right: 100%;
  top: calc(50% - 6px);
  border: 6px solid transparent;
  border-left-width: 0;
  border-right-color: #666666;
  cursor: pointer;
  
  @media (max-width: 768px) {
    right: 0;
    top: 100%;
    border-left-width: 6px;
    border-bottom-width: 0;
    border-right-color: transparent;
    border-top-color: #666666
  }
`;

const Tooltip = ({ children }) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);

  return (
    <TooltipArea>
      <HelpButton type="button" onClick={toggleShow}>?</HelpButton>
      {show && (
        <HintText>
          <Arrow />
          {children}
        </HintText>
      )}
    </TooltipArea>
  );
};

export default Tooltip;
