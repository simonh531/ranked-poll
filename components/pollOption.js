import React, { useState } from 'react';
import styled from 'styled-components';
import { useReactiveVar } from '@apollo/client';
import { themeColorVar } from './layout';
import { toSecondary, toTertiary } from '../style/colors';

const Container = styled.div`
  height: 2.4em;
  display: flex;
  align-items: center;
  position: relative;
  opacity: ${(props) => (props.dragging ? '0.6' : '1')};
`;

const ContainerBorder = styled.div`
  border-width: 1px 0;
  border-style: solid;
  border-color: transparent;
  ${(props) => (props.topBorder ? `
    border-top-color: black;
    box-shadow: 0 -1px black;
  ` : '')}
  ${(props) => (props.bottomBorder ? `
    border-bottom-color: black;
    box-shadow: 0 1px black;
  ` : '')}
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
  flex: 1;
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

const CheckButton = styled.button`
  border: 0;
  padding: 0;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover > span {
    text-shadow: 0 0 2px ${() => toTertiary(useReactiveVar(themeColorVar))};
  }
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

const DragTop = styled.div`
  width: 100%;
  height: calc(50% + 1px);
  position: absolute;
  top: -1px;
`;

const DragBottom = styled.div`
  width: 100%;
  height: calc(50% + 1px);
  position: absolute;
  bottom: -1px;
`;

const PollOption = ({
  name, value, onChange, upClick, downClick, onCancel,
  rank, id, percent, disabled, allowDown, index,
  draggingIndex, dragStart, dragEnd, drop,
}) => {
  const [topBorder, setTopBorder] = useState(false);
  const [bottomBorder, setBottomBorder] = useState(false);
  const [isDragged, setIsDragged] = useState(false);

  const onDragStart = () => {
    setIsDragged(true);
    dragStart();
  };

  const onDragEnd = () => {
    setIsDragged(false);
    dragEnd();
  };

  if (onChange) {
    return (
      <Container>
        <span className="material-icons">check_box_outline_blank</span>
        <InputLabel htmlFor={id}>
          <HiddenText>Answer</HiddenText>
          <Input type="text" id={id} placeholder="Enter an answer" value={value} onChange={onChange} />
        </InputLabel>
        <Delete onClick={onCancel} invisible={!onCancel}>
          <span className="material-icons">
            close
          </span>
        </Delete>
      </Container>
    );
  }
  if (disabled) {
    return (
      <Container>
        <Rank>{rank}</Rank>
        <Name>{name}</Name>
      </Container>
    );
  }
  if (percent) {
    return (
      <div>
        <Container>
          <Rank>{rank}</Rank>
          <Name>{name}</Name>
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
  }
  if (rank) {
    return (
      <ContainerBorder
        draggable={rank && !disabled}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        topBorder={topBorder}
        bottomBorder={bottomBorder}
      >
        <Container dragging={isDragged}>
          <Rank>{rank}</Rank>
          <MoveButton type="button" onClick={upClick} disabled={!upClick}>
            <span className="material-icons">arrow_upward</span>
          </MoveButton>
          <MoveButton type="button" onClick={downClick} disabled={!downClick}>
            <span className="material-icons">arrow_downward</span>
          </MoveButton>
          <Name>{name}</Name>
          <Delete onClick={onCancel} invisible={!onCancel}>
            <span className="material-icons">
              close
            </span>
          </Delete>
          {draggingIndex !== null ? (
            <>
              <DragTop
                onDragOver={(event) => {
                  event.preventDefault();
                  setTopBorder(true);
                }}
                onDragLeave={() => setTopBorder(false)}
                onDrop={() => {
                  setTopBorder(false);
                  drop(index - (draggingIndex < index ? 1 : 0));
                }}
              />
              <DragBottom
                onDragOver={(event) => {
                  event.preventDefault();
                  setBottomBorder(true);
                }}
                onDragLeave={() => setBottomBorder(false)}
                onDrop={() => {
                  setBottomBorder(false);
                  drop(index + 1 - (draggingIndex <= index ? 1 : 0));
                }}
              />
            </>
          ) : null}
        </Container>
      </ContainerBorder>
    );
  }
  let buttons;
  if (allowDown) {
    buttons = (
      <>
        <MoveButton type="button" onClick={upClick} disabled={!upClick} smaller>
          <span className="material-icons">thumb_up</span>
        </MoveButton>
        <MoveButton type="button" onClick={downClick} disabled={!downClick} smaller>
          <span className="material-icons">thumb_down</span>
        </MoveButton>
      </>
    );
  } else {
    buttons = (
      <CheckButton type="button" onClick={upClick}>
        <span className="material-icons">check_box_outline_blank</span>
      </CheckButton>
    );
  }
  return (
    <Container>
      <Rank>{rank}</Rank>
      {buttons}
      <Name>{name}</Name>
      <Delete onClick={onCancel} invisible={!onCancel}>
        <span className="material-icons">
          close
        </span>
      </Delete>
    </Container>
  );
};

export default PollOption;
