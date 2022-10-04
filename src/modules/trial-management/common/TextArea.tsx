import React, { FC, useCallback, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';

import { colors, px, typography, theme, animation } from 'src/styles';
import { CustomScrollbarProps, withCustomScrollBar } from 'src/common/components/CustomScrollbar';

export interface TextAreaProps
  extends CustomScrollbarProps,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoHeight?: boolean;
  appearance?: 'description' | 'input';
  invalid?: boolean;
}

const TextAreaBaseComponent = withCustomScrollBar(styled.textarea<TextAreaProps>``)`
  resize: none;
  appearance: none;
  box-sizing: border-box;
  outline: none;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  overflow-y: ${({ autoHeight }) => (autoHeight ? 'hidden' : 'auto')};
  caret-color: ${colors.updTextPrimaryBlue};
  
  ${({ appearance, invalid }) => {
    switch (appearance) {
      case 'description':
        return css`
          ${typography.bodySmallRegular};
          color: ${colors.updTextSecondaryGray};
          min-height: ${px(24)};
        `;

      case 'input':
      default:
        return css`
          ${typography.bodyMediumRegular};
          color: ${invalid ? colors.updStatusErrorText : colors.updTextPrimary};
          padding: ${px(16)};
          border-radius: ${px(4)};
          border: ${px(1)} solid transparent;
          background-color: ${invalid ? colors.updStatusError10 : colors.updBackground};
          transition: all 300ms ${animation.defaultTiming};

          &:hover:enabled {
            border-color: ${invalid ? 'transparent' : colors.updPrimaryHovered};
          }

          &:active:enabled,
          &:focus-visible {
            outline: none;
            border-color: ${invalid ? 'transparent' : colors.updPrimary};
          }

          &:disabled {
            color: ${colors.updDisabled};
            border-color: ${colors.updBackground};
            background-color: ${colors.updDisabled20};
          }

          &::placeholder {
            color: ${colors.updTextSecondaryGray};
          }

          &:disabled::placeholder {
            color: ${colors.updDisabled};
          }
        `;
    }
  }}
`;

const getScrollbarTrackColor = ({ appearance, invalid }: TextAreaProps) => {
  switch (appearance) {
    case 'description':
      return theme.colors.updOnPrimary;

    case 'input':
    default:
      return invalid ? theme.colors.updStatusError10 : theme.colors.updBackground;
  }
};

const TextArea: FC<TextAreaProps> = ({ autoHeight, appearance, invalid, onChange, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setHeight = useCallback(() => {
    if (autoHeight && textareaRef.current) {
      const maxHeight = parseInt(window.getComputedStyle(textareaRef.current).maxHeight, 10);

      textareaRef.current.style.overflowY =
        maxHeight <= textareaRef.current.scrollHeight ? 'auto' : 'hidden';
      textareaRef.current.style.height = 'auto'; // reset height for prevent bugs
      textareaRef.current.style.height = px(textareaRef.current.scrollHeight);
    }
  }, [autoHeight]);

  useEffect(() => {
    setHeight();
  }, [setHeight]);

  const handleInput = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHeight();
      onChange?.(evt);
    },
    [onChange, setHeight]
  );

  return (
    <TextAreaBaseComponent
      rows={1}
      {...props}
      appearance={appearance}
      invalid={invalid}
      scrollbarOffsetRight={8}
      scrollbarTrackColor={getScrollbarTrackColor({ appearance, invalid })}
      autoHeight={autoHeight}
      ref={textareaRef}
      onChange={handleInput}
    />
  );
};

export default TextArea;
