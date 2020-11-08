import React, { useState } from 'react';
import styled from 'styled-components';
import {
  useReactiveVar,
} from '@apollo/client';

import { themeColorVar } from './layout';
import { toTertiary } from '../style/colors';

const TooltipArea = styled.label`
  font-family: Open Sans, sans-serif;
`;

const HelpIcon = styled.button`
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

  :hover {
    text-shadow: 0 0 2px ${() => toTertiary(useReactiveVar(themeColorVar))};
    box-shadow: 0 0 2px ${() => toTertiary(useReactiveVar(themeColorVar))};
  }
`;

const HintText = styled.span`
  margin-left: 8px;
  font-size: 0.9em;
  color: white;
  background-color: #666666;
  border-radius: 2px;
  padding: 0 4px;
  position: relative;
  cursor: pointer;
`;

const LeftArrow = styled.div`
  position: absolute;
  right: 100%;
  top: calc(50% - 6px);
  border: 6px solid transparent;
  border-left-width: 0;
  border-right-color: #666666;
  cursor: pointer;
`;

const Tooltip = ({ children }) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);

  return (
    <TooltipArea>
      <HelpIcon type="button" onClick={toggleShow}>?</HelpIcon>
      {show && (
        <HintText>
          <LeftArrow />
          {children}
        </HintText>
      )}
    </TooltipArea>
  );
};

export default Tooltip;
