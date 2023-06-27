import React, { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { colors, px, typography, theme, animation } from 'src/styles';
import { CustomScrollbarProps, withCustomScrollBar } from 'src/common/components/CustomScrollbar';

export interface TextAreaProps
  extends CustomScrollbarProps,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  autoHeight?: boolean;
  appearance?: 'description' | 'input' | 'bordered';
  invalid?: boolean;
  sizeUpdaterUniqueValue?: unknown[];
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
  caret-color: ${colors.textPrimaryBlue};
  overflow-x: hidden;
  resize: none;

  ${({ appearance, invalid }) => {
    switch (appearance) {
      case 'bordered':
        return css`
          ${typography.bodyXSmallRegular};
          color: ${colors.textPrimary};
          border: ${px(1)} solid ${colors.primary10};
          border-radius: ${px(4)};
          padding: ${px(16)};
          padding-bottom: ${px(31)};
          transition: border-color 300ms ${animation.defaultTiming};

          &:focus-visible,
          &:hover {
            border-color: ${colors.primary};
          }

          ${invalid &&
          css`
            color: ${colors.statusErrorText};
            &::placeholder {
              color: ${colors.statusErrorText};
            }
          `};
        `;

      case 'description':
        return css`
          ${typography.bodySmallRegular};
          color: ${colors.textSecondaryGray};
          min-height: ${px(24)};
          ${invalid &&
          css`
            color: ${colors.statusErrorText};
            &::placeholder {
              color: ${colors.statusErrorText};
            }
          `};
        `;

      case 'input':
      default:
        return css`
          ${typography.bodyMediumRegular};
          color: ${invalid ? colors.statusErrorText : colors.textPrimary};
          padding: ${px(16)};
          border-radius: ${px(4)};
          border: ${px(1)} solid transparent;
          background-color: ${invalid ? colors.statusError10 : colors.background};
          transition: all 300ms ${animation.defaultTiming};

          &:hover:enabled {
            border-color: ${invalid ? 'transparent' : colors.primaryHovered};
          }

          &:active:enabled,
          &:focus-visible {
            outline: none;
            border-color: ${invalid ? 'transparent' : colors.primary};
            caret-color: ${invalid ? colors.statusErrorText : colors.textPrimary};
          }

          &:disabled {
            color: ${colors.disabled};
            border-color: ${colors.background};
            background-color: ${colors.disabled20};
          }

          &::placeholder {
            color: ${colors.textSecondaryGray};
          }

          &:disabled::placeholder {
            color: ${colors.disabled};
          }
        `;
    }
  }}
`;

const getScrollbarTrackColor = ({ appearance, invalid }: TextAreaProps) => {
  switch (appearance) {
    case 'description':
      return theme.colors.onPrimary;

    case 'input':
    default:
      return invalid ? theme.colors.statusError10 : theme.colors.background;
  }
};

const TextArea: FC<TextAreaProps> = ({
  autoHeight,
  appearance,
  invalid,
  onChange,
  sizeUpdaterUniqueValue,
  ...props
}) => {
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

  // update the height of the TextArea when resizing
  const [updater, setUpdater] = useState<number>();

  // skip one rendering to change the height after calculating the new dimensions of the element
  useEffect(() => {
    setUpdater(Date.now());
  }, [sizeUpdaterUniqueValue]);

  // update height
  useLayoutEffect(() => {
    setHeight();
  }, [setHeight, updater]);

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
