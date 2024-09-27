import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';

import { animation, colors, px, typography } from 'src/styles';
import { InputFieldShell } from 'src/common/components/InputField';
import TextArea from '../../common/components/TextArea';
import LimitsCounter from '../dashboard/components/base/LimitCounter';

const MAX_NOTES_LENGTH = 500;

const NotesContainer = styled.div`
  grid-area: notes;
`;
const NotesTextArea = styled(TextArea)`
  ${typography.bodyXSmallRegular};
  color: ${colors.textPrimary};
  border: ${px(1)} solid ${colors.primary10};
  border-radius: ${px(4)};
  padding: ${px(16)};
  padding-bottom: ${px(31)};
  height: ${px(254)};
  transition: border-color 300ms ${animation.defaultTiming};

  &:focus-visible,
  &:hover {
    border-color: ${colors.primary};
  }
`;

type VisitNotesProps = {
  value: string;
  onChange: (value: string) => void;
  onValidateChange: (status: boolean) => void;
};

export const VisitNotes = ({ value, onChange, onValidateChange }: VisitNotesProps) => {
  const validate = useCallback(() => value.length > 0 && value.length <= MAX_NOTES_LENGTH, [value]);

  const [isTouched, setTouched] = useState(false);
  const [isValid, setValid] = useState(validate());

  useEffect(() => {
    const v = validate();
    onValidateChange(v);
    setValid(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouched, validate]);

  const isInvalid = isTouched && !isValid;

  return (
    <NotesContainer>
      <InputFieldShell
        label="Notes"
        fixedHeight={false}
        error={isInvalid} // TODO: replace to 'string' or 'undefined'
      >
        <LimitsCounter inner current={value.length} max={MAX_NOTES_LENGTH}>
          <NotesTextArea
            data-testid="visit-notes-textarea"
            invalid={isInvalid}
            appearance="description"
            value={value}
            placeholder="Write here about the participant visit..."
            onBlur={() => setTouched(true)}
            onChange={(evt) =>
              evt.target.value.length <= MAX_NOTES_LENGTH
                ? onChange(evt.target.value)
                : evt.preventDefault()
            }
          />
        </LimitsCounter>
      </InputFieldShell>
    </NotesContainer>
  );
};
