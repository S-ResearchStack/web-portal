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

import InfoIcon from 'src/assets/icons/info.svg';
import Tooltip from 'src/common/components/Tooltip';
import { InputFieldShell, StyledTextField } from 'src/common/components/InputField';
import { boxShadow, colors, px, typography } from 'src/styles';

interface Caret {
  top: number;
  left: number;
  height: number;
}

const VisitPicContainer = styled.div`
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

const InputContainer = styled.div`
  position: relative;
`;

const SuggestionsContainer = styled.div.attrs<Caret>((p) => ({
  style: {
    left: p.left,
    top: p.top,
  },
})) <Caret>`
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
};

const Suggestions = React.forwardRef(
  (
    { find, caret, options, onSelect }: SuggestionsProps,
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

    const isShow = useMemo(
      () => find.length && suggestions.length && !suggestions.some((s) => s.label === find),
      [find, suggestions]
    );

    return isShow && caret ? (
      <SuggestionsContainer data-testid="visit-researcher-email-suggestions" ref={ref} {...caret}>
        {suggestions.map(({ label }) => (
          <SuggestionItem
            data-testid="visit-researcher-email-suggestion-item"
            key={label}
            onMouseDown={() => onSelect(label)}
            dangerouslySetInnerHTML={{ __html: label.replace(find, `<span>${find}</span>`) }}
          />
        ))}
      </SuggestionsContainer>
    ) : null;
  }
);

type VisitPicProps = {
  value: string;
  disabled?: boolean;
  suggestions: string[];
  onChange: (value: string) => void;
  onValidateChange: (status: boolean) => void;
};

const VisitPic = React.memo(
  ({
    value,
    disabled,
    suggestions,
    onChange,
    onValidateChange,
  }: VisitPicProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const [menuCoords, setMenuCoords] = useState<Caret | undefined>(undefined);
    const [selectionEnd, setSelectionEnd] = useState(0);

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

    const validate = useCallback(() => !!value,
      [value]
    );

    const [isValid, setValid] = useState(validate());

    const handleFocus = useCallback(() => {
      setValid(validate());
    }, [validate]);

    useEffect(() => {
      const v = validate();
      onValidateChange(v);
      setValid(v);
    }, [validate]);

    return (
      <VisitPicContainer>
        <InputFieldShell
          label={
            <VisitDocumentsLabel>
              <span>PIC</span>
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
        >
          <InputContainer>
            <StyledTextField
              data-testid="pic-input"
              type="text"
              placeholder="Enter PIC"
              maxLength={30}
              ref={inputRef}
              value={value}
              error={!isValid}
              disabled={disabled}
              onFocus={handleFocus}
              onChange={(evt) => {
                onChange(evt.target.value);
                handleInput(evt);
              }}
              onKeyUp={handleInput}
              onClick={handleInput}
            />
            <Suggestions
              ref={suggestionsRef}
              find={search}
              caret={menuCoords}
              options={suggestions}
              onSelect={handleSuggestionSelect}
            />
          </InputContainer>
        </InputFieldShell>
      </VisitPicContainer>
    );
  }
);

export default VisitPic;
