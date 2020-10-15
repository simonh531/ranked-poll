import React from 'react';
import styled from 'styled-components';
import { useReactiveVar } from '@apollo/client';
import { themeColorVar } from './layout';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5em 0;
`;

const Box = styled.input`
  margin-right: 1ch;
  pointer-events: ${(props) => (props.clickThrough ? 'none' : 'auto')};
`;

const Rank = styled.div`
  font-size: 1.6em;
  margin-right: 1ch;
`;

const Name = styled.label`
  font-family: Open Sans, sans-serif;
`;

const Input = styled.input`
  font-family: Open Sans, sans-serif;
  flex: 1;
  border: 0;
  border-bottom: 1px solid black;

  :focus {
    outline: none;
  }
`;

const Toolbar = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const Icon = styled.span`
  margin: 0 1ch;
  font-size: 1.2em;
  cursor: pointer;
  opacity: ${(props) => (props.invisible ? '0' : '1')};
  pointer-events: ${(props) => (props.invisible ? 'none' : 'auto')};
`;

const GraphContainer = styled.div`
  display: flex;
  height: 2em;
  align-items: center;
`;

const BarPercent = styled.div`
  width: 7ch;
  padding-right: 1ch;
  font-family: Open Sans, sans-serif;
  text-align: right;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 100%;
  border-left: 2px solid black;
`;

const Bar = styled.div`
  background-color: rgb(${() => useReactiveVar(themeColorVar).join(',')});
  width: ${(props) => props.percent};
  height: calc(100% - 12px);
  margin: 6px 0;
  box-shadow: 0 0 2px 2px rgba(0,0,0,0.5);
  filter: saturate(300%);
`;

const PollOption = ({
  name, value, onChange, upClick, downClick, onCancel, lastOne,
  boxClick = () => {}, rank, disabled, id,
  percent,
}) => (
  <div>
    <Container>
      {rank ? <Rank>{rank}</Rank> : (
        <Box type="checkbox" tabIndex="-1" id={id} active={false} onClick={boxClick} clickThrough={disabled} />
      )}
      {onChange
        ? <Input type="text" placeholder="Enter an answer" value={value} onChange={onChange} />
        : <Name htmlFor={id}>{name}</Name>}
      <Toolbar>
        {onChange && !lastOne ? (
          <Icon className="material-icons" onClick={onCancel}>
            close
          </Icon>
        ) : null}
        {rank ? (
          <>
            <Icon className="material-icons" onClick={upClick} invisible={rank === 1 || disabled}>
              arrow_upward
            </Icon>
            <Icon className="material-icons" onClick={downClick} invisible={lastOne || disabled}>
              arrow_downward
            </Icon>
            <Icon className="material-icons" onClick={onCancel} invisible={disabled}>
              close
            </Icon>
          </>
        ) : null}
      </Toolbar>
    </Container>
    {percent ? (
      <GraphContainer>
        <BarPercent>{percent}</BarPercent>
        <BarContainer>
          <Bar percent={percent} />
        </BarContainer>
      </GraphContainer>
    ) : null}
  </div>
);

export default PollOption;
