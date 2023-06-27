import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import { px, colors, typography } from 'src/styles';
import Button from 'src/common/components/Button';
import TimePicker from '../../TimePicker/TimePicker';

const Backgrop = styled.div`
  position: absolute;
  height: ${px(750)};
  width: ${px(360)};
  background-color: ${colors.black};
  opacity: 0.35;
  top: 0;
  left: 0;
`;

const Dialog = styled.div`
  position: absolute;
  bottom: ${px(70)};
  left: 0;
  width: 100%;
  background-color: ${colors.surface};
  height: ${px(295)};
  padding: ${px(17)} ${px(10)};
  border-radius: ${px(4)} ${px(4)} 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const ButtonStyled = styled(Button)`
  ${typography.sdkBodyLargeSemibold};
  color: ${colors.textPrimaryBlue};
`;

const TimePickerContainer = styled.div`
  margin-top: ${px(35)};
  padding: 0 ${px(55)};
`;

type Props = {
  time?: Date;
  onChange: (t: Date) => void;
  onClose: () => void;
};

const RangeTimePicker: React.FC<Props> = ({ time, onChange, onClose }) => {
  const [tmpTime, setTmpTime] = useState(time || new Date());

  useEffect(() => {
    setTmpTime(time || new Date());
  }, [time]);

  return (
    <>
      <Backgrop onClick={onClose} />
      <Dialog data-testid="range-time-picker">
        <TimePickerContainer>
          <TimePicker time={tmpTime} onChange={setTmpTime} size="l" />
        </TimePickerContainer>
        <ButtonsContainer>
          <ButtonStyled fill="text" onClick={onClose}>
            Cancel
          </ButtonStyled>
          <ButtonStyled
            data-testid="range-time-picker-close"
            fill="text"
            onClick={() => {
              onChange && onChange(tmpTime || new Date());
              onClose && onClose();
            }}
          >
            Save
          </ButtonStyled>
        </ButtonsContainer>
      </Dialog>
    </>
  );
};

export default RangeTimePicker;
