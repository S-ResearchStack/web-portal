import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import styled from 'styled-components';

import { InputFieldShell, StyledTextField } from 'src/common/components/InputField';
import { useTranslation } from '../localization/useTranslation';

const ParticipantIdContainer = styled.div`
  grid-area: participant-id;
`;

const InputContainer = styled.div`
  position: relative;
`;

type Option = {
  label: string;
  value: string;
}

type ParticipantEmailProps = {
  value: string;
  suggestions: Option[];
  onChange: (value: string) => void;
  onValidateChange: (status: boolean) => void;
};

const ParticipantEmail = React.memo(
  ({
    value,
    suggestions,
    onChange,
    onValidateChange,
  }: ParticipantEmailProps) => {
    const {t} = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState(() => {
      const s = suggestions.find(s => s.value === value);
      return s?.label || '';
    });

    const validate = useCallback(
      () => {
        const s = suggestions.find(s => s.label === search);
        return !!s;
      },
      [suggestions, search]
    );

    const handleChange = useCallback((evt: FormEvent<HTMLInputElement>) => {
      const target = evt.target as HTMLInputElement;
      setSearch(target.value);

    }, []);

    const handleFocus = useCallback(() => {
      setValid(validate());
      setTouched(true);
    }, [validate]);

    const [isTouched, setTouched] = useState(false);
    const [isValid, setValid] = useState(false);
    const isInvalid = isTouched && !isValid;

    useEffect(() => {
      const v = validate();
      onValidateChange(v);
      setValid(v);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTouched, validate]);

    useEffect(() => {
      const s = suggestions.find(s => s.value === value);
      if (s && search != s.label) setSearch(s.label);
    }, [value, suggestions, setSearch]);

    useEffect(() => {
      const s = suggestions.find(s => s.label === search);
      if (s && value != s.value) onChange(s.value);
    }, [search, suggestions, onChange]);

    return (
      <ParticipantIdContainer>
        <InputFieldShell
          label={t('LABEL_SUBJECT_NUMBER')}
          error={isInvalid ? t('CAPTION_INVALID_SUBJECT_NUMBER') : undefined}
        >
          <InputContainer>
            <StyledTextField
              data-testid="visit-participant-email"
              type="text"
              ref={inputRef}
              placeholder={t('CAPTION_ENTER_SUBJECT_NUMBER')}
              value={search}
              error={isInvalid}
              onFocus={handleFocus}
              onChange={(evt) => {
                handleChange(evt);
              }}
              maxLength={256}
            />
          </InputContainer>
        </InputFieldShell>
      </ParticipantIdContainer>
    );
  }
);

export default ParticipantEmail;
