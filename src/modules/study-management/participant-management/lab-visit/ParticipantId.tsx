import React, {
  FormEvent,
  ForwardedRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useEvent from 'react-use/lib/useEvent';

import styled from 'styled-components';
import getCaretCoordinates from 'textarea-caret';

import { InputFieldShell, StyledTextField } from 'src/common/components/InputField';
import { boxShadow, colors, px, typography } from 'src/styles';

interface Caret {
  top: number;
  left: number;
  height: number;
}

const ParticipantIdContainer = styled.div`
  grid-area: participant-id;
`;

const InputContainer = styled.div`
  position: relative;
`;

const SuggestionsContainer = styled.div.attrs<Caret>((p) => ({
  style: {
    left: p.left,
    top: 34,
  },
}))<Caret>`
  position: absolute;
  background-color: ${colors.surface};
  box-shadow: ${boxShadow.card};
  z-index: 1;
`;

const SuggestionItem = styled.div`
  ${typography.bodyXSmallRegular};
  padding: ${px(8)};

  &:hover {
    background-color: ${colors.primary10};
    cursor: pointer;
  }

  > span {
    color: ${colors.textPrimaryBlue};
  }
`;

type SuggestionsProps = {
  caret?: Caret;
  find: string;
  options: string[];
  onSelect: (value: string) => void;
  onChangeSuggestionsCount: (count: number) => void;
};

const Suggestions = React.forwardRef(
  (
    { find, caret, options, onSelect, onChangeSuggestionsCount }: SuggestionsProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const suggestions = useMemo(
      () =>
        options
          .map((label) => ({ label, idx: label.indexOf(find) }))
          .filter((s) => s.idx > -1)
          .sort((a, b) => (a.idx > b.idx ? 1 : 0))
          .slice(0, 4),
      [find, options]
    );

    useEffect(() => {
      onChangeSuggestionsCount(suggestions.length);
    }, [suggestions, onChangeSuggestionsCount]);

    const isShow = useMemo(
      () => find.length && suggestions.length && !suggestions.some((s) => s.label === find),
      [find, suggestions]
    );

    return isShow && caret ? (
      <SuggestionsContainer data-testid="visit-participant-id-suggestions" ref={ref} {...caret}>
        {suggestions.map(({ label }) => (
          <SuggestionItem
            data-testid="visit-participant-id-suggestion-item"
            key={label}
            onMouseDown={() => onSelect(label)}
            dangerouslySetInnerHTML={{ __html: label.replace(find, `<span>${find}</span>`) }}
          />
        ))}
      </SuggestionsContainer>
    ) : null;
  }
);

type ParticipantIdProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  onValidateChange: (status: boolean) => void;
  ignoreEmptyParticipant?: boolean;
};

export const ParticipantId = React.memo(
  ({
    value,
    onChange,
    suggestions,
    onValidateChange,
    ignoreEmptyParticipant,
  }: ParticipantIdProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const [menuCoords, setMenuCoords] = useState<Caret | undefined>(undefined);
    const [selectionEnd, setSelectionEnd] = useState(0);
    const [hasSuggestions, setHasSuggestions] = useState(false);
    const [isFocused, setFocused] = useState(false);

    const search = useMemo(() => value.slice(0, selectionEnd), [selectionEnd, value]);

    const handleInput = useCallback((evt: FormEvent<HTMLInputElement>) => {
      const target = evt.target as HTMLInputElement;
      if (target.selectionEnd !== null) {
        setSelectionEnd(target.selectionEnd);
        setMenuCoords(getCaretCoordinates(target, target.selectionEnd));
      }
    }, []);

    const hideSuggestions = useCallback(() => menuCoords && setMenuCoords(undefined), [menuCoords]);

    const handleSuggestionSelect = useCallback(
      (v: string) => {
        onChange(v);
        hideSuggestions();
      },
      [hideSuggestions, onChange]
    );

    useEvent(
      'click',
      (evt) => {
        if (
          inputRef.current &&
          !inputRef.current?.contains(evt.target as Node) &&
          suggestionsRef.current &&
          !suggestionsRef.current?.contains(evt.target as Node)
        ) {
          hideSuggestions();
        }
      },
      document
    );

    const validate = useCallback(
      (focused = false) => {
        const baseRule = focused || isFocused ? hasSuggestions : suggestions.includes(value);

        return ignoreEmptyParticipant ? !value || baseRule : baseRule;
      },
      [isFocused, hasSuggestions, suggestions, value, ignoreEmptyParticipant]
    );

    const [isTouched, setTouched] = useState(false);
    const [isValid, setValid] = useState(validate());

    const handleFocus = useCallback(() => {
      setValid(validate(true));
      setTouched(true);
      setFocused(true);
    }, [validate]);

    useEffect(() => {
      const v = validate();
      onValidateChange(v);
      setValid(v);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTouched, validate]);

    const isInvalid = isTouched && !isValid;

    return (
      <ParticipantIdContainer>
        <InputFieldShell
          label="Participant Id"
          error={isInvalid ? 'Invalid participant ID' : undefined}
        >
          <InputContainer>
            <StyledTextField
              data-testid="visit-participant-id"
              type="text"
              ref={inputRef}
              placeholder="Enter participant ID"
              value={value}
              error={isInvalid}
              onFocus={handleFocus}
              onBlur={() => setFocused(false)}
              onChange={(evt) => {
                onChange(evt.target.value);
                handleInput(evt);
              }}
              onKeyUp={handleInput}
              onClick={handleInput}
              maxLength={256}
            />
            <Suggestions
              ref={suggestionsRef}
              find={search}
              caret={menuCoords}
              options={suggestions}
              onSelect={handleSuggestionSelect}
              onChangeSuggestionsCount={(count) => setHasSuggestions(!!count)}
            />
          </InputContainer>
        </InputFieldShell>
      </ParticipantIdContainer>
    );
  }
);
