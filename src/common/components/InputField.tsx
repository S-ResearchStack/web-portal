import React, { FC, ForwardedRef, forwardRef } from 'react';

import styled, { css } from 'styled-components';

import browser from 'src/common/utils/browser';
import { animation, colors, px, typography } from 'src/styles';

export const RIGHT_PADDING = 8;

export interface InputFieldBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | JSX.Element;
  helperText?: string;
  error?: boolean | string; // TODO: remove `boolean` when migration to v0.9 is complete
  withoutErrorText?: boolean;
  disabled?: boolean;
}
type InputFieldShellProps = React.PropsWithChildren<InputFieldBaseProps>;

export interface InputFieldProps
  extends InputFieldBaseProps,
    React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'email' | 'password' | 'text' | 'date' | 'number';
  endExtra?: { component: JSX.Element; extraWidth: number };
  lighten?: boolean;
}

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
`;

export const ExtraWrapper = styled.div<Pick<InputFieldProps, 'endExtra'>>`
  > svg {
    position: relative;
    bottom: ${browser.isSafari ? px(43) : px(41)};
    left: ${({ endExtra }) => `calc(100% - ${px((endExtra?.extraWidth || 0) + RIGHT_PADDING)})`};
  }
`;

const getDefaultBackgroundColor = ({ error, lighten }: InputFieldProps) => {
  if (error) {
    return colors.statusError10;
  }

  return lighten ? colors.surface : colors.background;
};

export const StyledTextField = styled.input<InputFieldProps>`
  ${typography.bodyMediumRegular};
  color: ${({ error }) => (error ? colors.statusErrorText : colors.textPrimary)};
  box-sizing: border-box;
  height: ${px(56)};
  width: 100%;
  margin: 0;
  padding: ${px(16)};
  background-color: ${getDefaultBackgroundColor};
  border: ${px(1)} solid ${getDefaultBackgroundColor};
  border-radius: ${px(4)};
  transition: border 300ms ${animation.defaultTiming};
  caret-color: ${({ error }) => (error ? colors.statusErrorText : colors.textPrimaryBlue)};

  &:hover:enabled {
    border-color: ${({ error }) => (error ? 'transparent' : colors.primaryHovered)};
  }

  &:active:enabled,
  &:focus-visible {
    outline: none;
    border-color: ${({ error }) => (error ? 'transparent' : colors.primary)};
  }

  &:disabled {
    color: ${colors.disabled};
    border-color: ${colors.disabled20};
    background-color: ${colors.disabled20};
  }

  &::placeholder {
    color: ${colors.textSecondaryGray};
  }

  &:disabled::placeholder {
    color: ${colors.disabled};
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    ${({ error, disabled, theme }) => css`
      border: ${px(1)} solid
        ${(disabled && theme.colors.disabled20) ||
        (error ? theme.colors.statusError10 : theme.colors.primary)};
      transition: background-color 5000s ease-in-out 0s;
      background-color: ${getDefaultBackgroundColor} !important;
      background-image: unset !important;
      -webkit-text-fill-color: ${colors.textDisabled};
    `};
  }

  &:-webkit-autofill:focus {
    border-color: ${({ error }) => (error ? 'transparent' : colors.primary)};
  }
`;

export const InputWrapper = styled.div<Pick<InputFieldProps, 'endExtra' | 'error'>>`
  max-height: ${px(56)};
  &:hover {
    ${StyledTextField} {
      :enabled {
        border-color: ${({ error }) => (error ? 'transparent' : colors.primaryHovered)};
      }
    }
  }
`;

interface BlockStatus {
  disabled?: boolean;
  error?: boolean;
}

export const Label = styled.div<BlockStatus>`
  ${typography.bodyMediumSemibold};
  color: ${({ error }) => (error ? colors.statusErrorText : colors.textPrimary)};
  height: ${px(18)};
`;

export const InputDescription = styled.div<BlockStatus>`
  ${typography.bodySmallRegular};
  color: ${({ error }) => (error ? colors.statusErrorText : colors.textPrimary)};
  gap: ${px(8)};
  height: ${px(18)};
`;

export const InputErrorText = styled.div<{ withOffset?: boolean }>`
  ${typography.bodySmallRegular};
  color: ${colors.statusErrorText};
  padding-left: ${({ withOffset }) => withOffset && px(16)};
  height: ${px(17)};
`;

export const InputFieldShell: FC<InputFieldShellProps> = ({
  label,
  helperText,
  error,
  className,
  disabled,
  children,
  withoutErrorText,
}) => (
  <InputContainer className={className}>
    {helperText && (
      <Label data-testid="input-label" error={!!error} disabled={disabled}>
        {label}
      </Label>
    )}
    <InputDescription data-testid="input-description" error={!!error} disabled={disabled}>
      {helperText || label || <>&nbsp;</>}
    </InputDescription>
    <InputWrapper error={error}>{children}</InputWrapper>
    {!withoutErrorText && (
      <InputErrorText data-testid="input-error" withOffset={!helperText}>
        {typeof error === 'string' ? error : <>&nbsp;</>}
      </InputErrorText>
    )}
  </InputContainer>
);

const InputField = forwardRef(
  (
    {
      type,
      helperText,
      error,
      label,
      endExtra,
      disabled,
      className,
      withoutErrorText,
      ...restProps
    }: InputFieldProps,
    ref: ForwardedRef<HTMLInputElement>
  ): JSX.Element => (
    <InputFieldShell
      label={label}
      helperText={helperText}
      error={error}
      className={className}
      disabled={disabled}
      withoutErrorText={withoutErrorText}
    >
      <StyledTextField
        data-testid="input"
        ref={ref}
        error={error}
        type={type}
        disabled={disabled}
        endExtra={endExtra}
        {...restProps}
      />
      <ExtraWrapper endExtra={endExtra}>{endExtra?.component}</ExtraWrapper>
    </InputFieldShell>
  )
);

export default InputField;
