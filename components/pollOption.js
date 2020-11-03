import React from 'react';
import styled from 'styled-components';
import { useReactiveVar } from '@apollo/client';
import { themeColorVar } from './layout';
import { toSecondary, toTertiary } from '../style/colors';

const Container = styled.div`
  height: 2.4em;
  display: flex;
  align-items: center;
`;

const Rank = styled.span`
  width: 2ch;
  font-size: 1.6em;
  text-align: center;
`;

const Name = styled.span`
  font-family: Open Sans, sans-serif;
  margin-left: 1ch;
  flex: 1;
`;

const InputLabel = styled.label`
  flex: 2;
`;

const Input = styled.input`
  padding: 4px 0;
  margin-left: 1ch;
  font-family: Open Sans, sans-serif;
  border: 0;
  border-bottom: 1px solid black;
  width: calc(100% - 1ch);

  :focus {
    outline: none;
  }
`;

const Delete = styled.button`
  font-size: 1.2em;
  border: 0;
  background-color: transparent;
  cursor: pointer;
  opacity: ${(props) => (props.invisible ? '0' : '1')};
  pointer-events: ${(props) => (props.invisible ? 'none' : 'auto')};

  &:hover > span {
    text-shadow: 0 0 2px ${() => toTertiary(useReactiveVar(themeColorVar))};
  }
`;

const MoveButton = styled.button`
  height: 1.6em;
  width: 1.6em;
  margin: 0 4px;
  border-radius: 4px;
  text-shadow: 0 0 1px black;
  border: 0;
  background-color: ${() => toSecondary(useReactiveVar(themeColorVar))};
  color: white;
  box-shadow: 0 0 1px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;

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
    return 'opacity: 0.3';
  }}

  ${(props) => props.smaller && `
    & > span {
      font-size: 1em;
    }
  `}
`;

const GraphContainer = styled.div`
  display: flex;
  height: 2em;
  align-items: center;
`;

const BarPercent = styled.div`
  width: 8ch;
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
  background-color: ${() => toSecondary(useReactiveVar(themeColorVar))};
  width: ${(props) => props.percent};
  height: calc(100% - 12px);
  margin: 6px 0;
  box-shadow: 0 0 2px 2px rgba(0,0,0,0.5);
`;

const HiddenText = styled.span`
  display: block;
  height: 0;
  overflow: hidden;
  user-select: none;
  color: transparent;
`;

const PollOption = ({
  name, value, onChange, upClick, downClick, onCancel,
  rank, id, percent, disabled,
}) => (
  <div>
    <Container>
      {onChange ? (
        <>
          <span className="material-icons">check_box_outline_blank</span>
          <InputLabel htmlFor={id}>
            <HiddenText>Answer</HiddenText>
            <Input type="text" id={id} placeholder="Enter an answer" value={value} onChange={onChange} />
          </InputLabel>
        </>
      ) : (
        <>
          <Rank>{rank}</Rank>
          {disabled ? null : (
            <>
              <MoveButton onClick={upClick} smaller={!rank} disabled={!upClick}>
                <span className="material-icons">
                  {rank ? 'arrow_upward' : 'thumb_up'}
                </span>
              </MoveButton>
              <MoveButton onClick={downClick} smaller={!rank} disabled={!downClick}>
                <span className="material-icons">
                  {rank ? 'arrow_downward' : 'thumb_down'}
                </span>
              </MoveButton>
            </>
          )}
          <Name>{name}</Name>
        </>
      )}
      {disabled ? null : (
        <Delete onClick={onCancel} invisible={!onCancel}>
          <span className="material-icons">
            close
          </span>
        </Delete>
      )}
    </Container>
    {percent && (
      <GraphContainer>
        <BarPercent>{percent}</BarPercent>
        <BarContainer>
          <Bar percent={percent} />
        </BarContainer>
      </GraphContainer>
    )}
  </div>
);

export default PollOption;
