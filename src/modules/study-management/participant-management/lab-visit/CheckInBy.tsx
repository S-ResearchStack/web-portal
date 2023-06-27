import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';

import InputField from 'src/common/components/InputField';
import { px } from 'src/styles';
import InfoIcon from 'src/assets/icons/info.svg';
import Tooltip from 'src/common/components/Tooltip';

const MAX_CHECKED_PERSON_LENGTH = Number.MAX_SAFE_INTEGER;

const CheckInByContainer = styled.div`
  grid-area: check-in-by;
`;

const VisitDocumentsLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${px(4)};
`;

const InfoIconStyled = styled(InfoIcon)`
  display: block;
`;

type CheckInByProps = {
  value: string;
  onChange: (value: string) => void;
  onValidateChange: (status: boolean) => void;
};
export const CheckInBy = ({ value, onChange, onValidateChange }: CheckInByProps) => {
  const validate = useCallback(
    () => value.length > 0 && value.length <= MAX_CHECKED_PERSON_LENGTH,
    [value]
  );

  const [isTouched, setTouched] = useState(false);
  const [isValid, setValid] = useState(validate());

  useEffect(() => {
    const v = validate();
    onValidateChange(v);
    setValid(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouched, validate]);

  return (
    <CheckInByContainer>
      <InputField
        data-testid="checked-by-input"
        label={
          <VisitDocumentsLabel>
            <span>Checked in by</span>
            <Tooltip
              arrow
              static
              content="Person responsible for the participant during the in-lab visit."
              trigger="hover"
              position="r"
              styles={{ maxWidth: px(226) }}
            >
              <InfoIconStyled />
            </Tooltip>
          </VisitDocumentsLabel>
        }
        placeholder="Enter name"
        value={value}
        onChange={(evt) => onChange(evt.target.value)}
        onBlur={() => setTouched(true)}
        error={isTouched && !isValid} // TODO: replace to 'string' or 'undefined'
        maxLength={30}
      />
    </CheckInByContainer>
  );
};
