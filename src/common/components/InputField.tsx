import React, { FC, ForwardedRef, forwardRef, ReactElement } from 'react';

import styled, { css } from 'styled-components';

import browser from 'src/common/utils/browser';
import { animation, colors, px, typography } from 'src/styles';

export const RIGHT_PADDING = 8;

interface InputFieldBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactElement;
  helperText?: string;
  error?: React.ReactNode;
  withoutErrorText?: boolean;
  disabled?: boolean;
}
type InputFieldShellProps = {
  fixedHeight?: boolean;
  caption?: React.ReactNode;
} & React.PropsWithChildren<InputFieldBaseProps>;

type InputType = 'email' | 'password' | 'text' | 'date' | 'number';

type EndExtraProps = { component: ReactElement; extraWidth: number };

export interface InputFieldProps
  extends InputFieldBaseProps,
    React.InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  endExtra?: EndExtraProps;
  lighten?: boolean;
  caption?: string;
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
  margin-top: 5px;
`;

const ExtraWrapper = styled.div<Pick<InputFieldProps, 'endExtra' | 'disabled'>>`
  > svg {
    position: relative;
    bottom: ${browser.isSafari ? px(43) : px(41)};
    left: ${({ endExtra }) => `calc(100% - ${px((endExtra?.extraWidth || 0) + RIGHT_PADDING)})`};
    path {
      fill: ${({ disabled, theme }) => disabled && theme.colors.onDisabled};
    }
  }
`;

const getDefaultBackgroundColor = ({ error, lighten }: InputFieldProps) => {
  if (error) {
    return colors.statusError10;
  }

  return colors.surface;
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
  border: ${px(1)} solid ${colors.black08};
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
    color: rgba(0, 0, 0, 0.38); // TODO unknown color
    border-color: transparent;
    background-color: #f8f8f8; // TODO unknown color
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

const InputWrapper = styled.div<
  Pick<InputFieldShellProps, 'fixedHeight'> & Pick<InputFieldProps, 'endExtra' | 'error'>
>`
  max-height: ${(p) => (p.fixedHeight ? px(56) : 'auto')};
  &:hover {
    ${StyledTextField} {
      :enabled {
        border-color: ${({ error }) => (error ? 'transparent' : colors.primaryHovered)};
      }
    }
  }
`;

interface BlockStatus {
  $disabled?: boolean;
  error?: boolean;
  required?: boolean;
}

const Label = styled.div<BlockStatus>`
  ${typography.bodyMediumSemibold};
  color: ${({ error, $disabled, theme }) =>
    (error && theme.colors.statusErrorText) ||
    ($disabled ? 'rgba(0, 0, 0, 0.38)' : theme.colors.textPrimary)}; // TODO unknown color
  height: ${px(18)};
`;

const InputDescription = styled.span<BlockStatus>`
  ${typography.bodySmallSemibold};
  color: ${({ error, $disabled, theme }) =>
    (error && theme.colors.statusErrorText) ||
    ($disabled ? 'rgba(0, 0, 0, 0.38)' : theme.colors.textPrimary)}; // TODO unknown color
  gap: ${px(8)};
  height: ${px(18)};
  width: fit-content;
  position: ${({ required }) =>
  (required ? "relative" : "static") };
  &::before {
    content: ${({ required }) => (required ? "'*'" : "''") };
    position: absolute;
    color: red;
    top: -2px;
    right: -10px;
  }
`;

const InputErrorText = styled.div<{ withOffset?: boolean }>`
  ${typography.bodySmallRegular};
  color: ${colors.statusErrorText};
  padding-left: ${({ withOffset }) => withOffset && px(16)};
  height: ${px(17)};
  margin-bottom: 10px;
`;

const InputCaption = styled.div<{ withOffset?: boolean }>`
  ${typography.labelRegular};
  color: ${colors.textSecondaryGray};
  height: ${px(17)};
  margin-top: -5px;
`;

export const InputFieldShell: FC<InputFieldShellProps> = ({
  label,
  helperText,
  error,
  className,
  disabled,
  children,
  withoutErrorText,
  fixedHeight = true,
  caption,
  required,
}) => (
  <InputContainer className={className}>
    {helperText && (
      <Label data-testid="input-label" error={!!error} $disabled={disabled}>
        {label}
      </Label>
    )}
    <InputDescription data-testid="input-description" error={!!error} $disabled={disabled} required={required}>
      {helperText || label || <>&nbsp;</>}
    </InputDescription>
    <InputWrapper error={error} fixedHeight={fixedHeight}>
      {children}
    </InputWrapper>
    {!withoutErrorText &&
      (error ? (
        <InputErrorText data-testid="input-error" withOffset={!helperText}>
          {error}
        </InputErrorText>
      ) : (
        <InputCaption withOffset={!helperText}>{caption || <>&nbsp;</>}</InputCaption>
      ))}
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
      required,
      caption,
      ...restProps
    }: InputFieldProps,
    ref: ForwardedRef<HTMLInputElement>
  ): ReactElement => (
    <InputFieldShell
      label={label}
      helperText={helperText}
      error={error}
      className={className}
      disabled={disabled}
      withoutErrorText={withoutErrorText}
      required={required}
      caption={caption}
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
      <ExtraWrapper disabled={disabled} endExtra={endExtra}>
        {endExtra?.component}
      </ExtraWrapper>
    </InputFieldShell>
  )
);

export default InputField;
