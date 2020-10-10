import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5em 0;
`;

const Box = styled.span`
  font-size: 1em;
  margin-right: 0.2ch;
  cursor: ${(props) => (props.active ? 'pointer' : 'default')};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
`;

const Rank = styled.div`
  font-size: 1.6em;
  margin-right: 1ch;
`;

const Name = styled.span`
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
  background-color: skyblue;
  width: ${(props) => props.percent};
  height: calc(100% - 12px);
  margin: 6px 0;
  box-shadow: 0 0 2px 2px rgba(0,0,0,0.5);
  filter: saturate(200%);
`;

const PollOption = ({
  name, value, onChange, upClick, downClick, onCancel, lastOne, boxClick = () => {}, rank, disabled,
  percent,
}) => (
  <div>
    <Container>
      {rank ? <Rank>{rank}</Rank> : (
        <Box className="material-icons" active={!onChange} onClick={boxClick} disabled={disabled}>
          check_box_outline_blank
        </Box>
      )}
      {onChange
        ? <Input type="text" placeholder="Enter an answer" value={value} onChange={onChange} />
        : <Name>{name}</Name>}
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
