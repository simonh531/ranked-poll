import React, { useState, ReactNode } from 'react';
import {
  FormControlLabel, IconButton, Card, Typography, Box, Skeleton,
} from '@mui/material';

function DraggableArea({ area, action }:{
  area:string,
  // eslint-disable-next-line no-unused-vars
  action:(event:React.DragEvent<HTMLDivElement>) => void
}) {
  const [isTarget, setIsTarget] = useState(false);
  return (
    <Box
      sx={{
        position: 'absolute',
        [area.toLowerCase()]: '-5px',
        height: 'calc(50% + 5px)',
        left: '0',
        width: '100%',
        [`border${area}`]: '2px solid transparent',
        [`border${area}Color`]: isTarget ? 'text.primary' : '',
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={() => setIsTarget(true)}
      onDragLeave={() => setIsTarget(false)}
      onDrop={(event) => {
        setIsTarget(false);
        action(event);
      }}
    />
  );
}

function Option({
  children, onDragStart, onDragEnd, sx,
}:{
  children: ReactNode,
  // eslint-disable-next-line no-unused-vars
  onDragStart?: (event: React.DragEvent<HTMLElement>) => void,
  onDragEnd?: () => void,
  sx?: Record<string, string|number>
}) {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 0.5,
        marginTop: 0.5,
        paddingLeft: 2,
        position: 'relative',
        overflow: 'visible',
        cursor: 'grab',
        backgroundColor: '#ffffff',
        ...sx,
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {children}
      <span className="material-icons">
        drag_indicator
      </span>
    </Card>
  );
}

export function SkeletonOption() {
  return (
    <Option>
      <FormControlLabel
        sx={{ flex: '1' }}
        control={(
          <IconButton size="small">
            <span className="material-icons">
              check_box_outline_blank
            </span>
          </IconButton>
      )}
        label={<Skeleton sx={{ width: '16ch' }} />}
      />
    </Option>
  );
}

export function UnrankedOption({
  label, setRank, setIsDragging, advanced,
}:{
  label:string, advanced: boolean,
  setRank: React.Dispatch<React.SetStateAction<{ up: string[], down: string[] }>>,
  setIsDragging:React.Dispatch<React.SetStateAction<string>>,
}) {
  return (
    <Option
      onDragStart={(event) => {
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', label);
        setIsDragging('unranked');
      }}
      onDragEnd={() => setIsDragging('')}
      sx={advanced ? { paddingLeft: 0 } : {}}
    >
      { advanced ? (
        <>
          <IconButton
            size="small"
            color="primary"
            onClick={() => setRank((prevValue) => ({
              up: [...prevValue.up, label],
              down: prevValue.down,
            }))}
          >
            <span className="material-icons">
              thumb_up_off_alt
            </span>
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => setRank((prevValue) => ({
              up: prevValue.up,
              down: [...prevValue.down, label],
            }))}
          >
            <span className="material-icons">
              thumb_down_off_alt
            </span>
          </IconButton>
          <Typography sx={{ flex: '1' }}>
            {label}
          </Typography>
        </>
      ) : (
        <FormControlLabel
          sx={{ flex: '1' }}
          control={(
            <IconButton
              size="small"
              onClick={() => setRank((prevValue) => ({
                up: [...prevValue.up, label],
                down: prevValue.down,
              }))}
            >
              <span className="material-icons">
                check_box_outline_blank
              </span>
            </IconButton>
      )}
          label={label}
        />
      )}
    </Option>
  );
}

export function RankedOption({
  label, rank, isDragging, setIsDragging, setRank, index, last, rankKey,
}:{
  label:string, index: number, last: boolean, rank: number, isDragging: string,
  setIsDragging:React.Dispatch<React.SetStateAction<string>>, rankKey: string,
  setRank: React.Dispatch<React.SetStateAction<{ up: string[], down: string[] }>>,
}) {
  return (
    <Option
      onDragStart={(event) => {
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', label);
        setIsDragging('ranked');
      }}
      onDragEnd={() => setIsDragging('')}
    >
      <Typography sx={{ width: '2ch' }}>{rank}</Typography>
      <IconButton
        size="small"
        color="primary"
        onClick={() => setRank((prevValue) => {
          const newRank = [...prevValue[rankKey]];
          newRank.splice(index, 1);
          newRank.splice(index - 1, 0, label);
          return {
            ...prevValue,
            [rankKey]: newRank,
          };
        })}
        disabled={index === 0}
      >
        <span className="material-icons">
          arrow_upward
        </span>
      </IconButton>
      <IconButton
        size="small"
        color="primary"
        onClick={() => setRank((prevValue) => {
          const newRank = [...prevValue[rankKey]];
          newRank.splice(index, 1);
          newRank.splice(index + 1, 0, label);
          return {
            ...prevValue,
            [rankKey]: newRank,
          };
        })}
        disabled={last}
      >
        <span className="material-icons">
          arrow_downward
        </span>
      </IconButton>
      <Typography sx={{ flex: '1' }}>
        {label}
      </Typography>
      <IconButton
        size="small"
        onClick={() => setRank((prevValue) => {
          const newRank = [...prevValue[rankKey]];
          newRank.splice(index, 1);
          return {
            ...prevValue,
            [rankKey]: newRank,
          };
        })}
      >
        <span className="material-icons">
          close
        </span>
      </IconButton>
      {isDragging ? (
        <>
          <DraggableArea
            area="Top"
            action={(event) => setRank((prevValue) => {
              const filter = (value) => value !== event.dataTransfer.getData('text/plain');
              const newRank = {
                up: prevValue.up.filter(filter),
                down: prevValue.down.filter(filter),
              };
              newRank[rankKey].splice(index, 0, event.dataTransfer.getData('text/plain'));
              setIsDragging('');
              return newRank;
            })}
          />
          <DraggableArea
            area="Bottom"
            action={(event) => setRank((prevValue) => {
              const filter = (value) => value !== event.dataTransfer.getData('text/plain');
              const newRank = {
                up: prevValue.up.filter(filter),
                down: prevValue.down.filter(filter),
              };
              newRank[rankKey].splice(index + 1, 0, event.dataTransfer.getData('text/plain'));
              setIsDragging('');
              return newRank;
            })}
          />
        </>
      ) : null}
    </Option>
  );
}
