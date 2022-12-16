import React, { useMemo } from 'react';

import styled, { css } from 'styled-components';
import _uniqueId from 'lodash/uniqueId';

import RadioUnchecked from 'src/assets/icons/radio_unchecked.svg';
import RadioError from 'src/assets/icons/radio_error.svg';
import RadioChecked from 'src/assets/icons/radio_checked.svg';
import RadioFilled from 'src/assets/icons/radio_checked_filled.svg';
import RadioSuccess from 'src/assets/icons/radio_checked_success.svg';
import RadioFilledMobile from 'src/assets/icons/radio_filled_mobile.svg';
import RadioUncheckedMobile from 'src/assets/icons/radio_unchecked_mobile.svg';
import { animation, colors, px, typography } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';

type RadioKind = 'radio' | 'success' | 'filled' | 'error' | 'mobile';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'color'> {
  kind?: RadioKind;
  color?: SpecColorType;
  checked?: boolean;
  reverse?: boolean;
  className?: string;
  isLegend?: boolean;
}

const Label = styled.label<{ withDescription: boolean; isLegend: boolean; reverse: boolean }>`
  display: inline-grid;
  gap: ${({ isLegend }) => px(isLegend ? 10 : 4)};
  grid-template-columns: ${({ withDescription, isLegend, reverse }) =>
    // eslint-disable-next-line no-nested-ternary
    withDescription
      ? reverse
        ? `1fr ${px(isLegend ? 20 : 40)} `
        : `${px(isLegend ? 20 : 40)} 1fr`
      : px(40)};
  align-items: flex-start;
`;

const Child = styled.div<{ disabled?: boolean }>`
  ${typography.bodySmallRegular};
  color: ${({ disabled }) => (disabled ? colors.textDisabled : colors.textPrimary)};
  transition: color 300ms ${animation.defaultTiming};
  display: flex;
  align-items: center;
  height: 100%;
`;

const Icon = styled.div<{ isLegend: boolean }>`
  width: ${({ isLegend }) => px(isLegend ? 20 : 40)};
  height: ${px(40)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RadioContainer = styled.div<RadioProps>`
  display: inline-block;

  input {
    display: none;
  }

  ${Icon} > svg {
    > :nth-child(1) {
      transition: stroke-color 300ms ${animation.defaultTiming},
                  fill 300ms ${animation.defaultTiming};

      ${({ color, kind, checked, disabled }) => {
        if (disabled) {
          if (checked) {
            return css`
              fill: ${colors.disabled};
            `;
          }

          return css`
            stroke: ${colors.disabled};
            fill: ${colors.surface};
          `;
        }

        const error = kind === 'error';
        if (checked) {
          return css`
            fill: ${error ? colors.statusError : (color && colors[color]) || colors.primary};
          `;
        }

        const selectedColor = error
          ? colors.statusError
          : (color && colors[color]) || colors.primaryDisabled;

        return css`
          stroke: ${selectedColor};
          fill: ${error && selectedColor};
        `;
      }}
    }

    > :nth-child(2) {
      transition: stroke-color 300ms ${animation.defaultTiming},
                  fill 300ms ${animation.defaultTiming};

      ${({ kind, checked, disabled }) => {
        const error = kind === 'error';
        if (disabled && checked && kind !== 'success') {
          return css`
            stroke: ${colors.surface};
            fill: ${!error && colors.disabled};
            stroke-width: ${px(8)};
            paint-order: stroke;
          `;
        }

        return undefined;
      }}
    }
  }
  
  &:hover {

    > ${Label} {
      cursor: ${({ disabled }) => !disabled && 'pointer'};
    }
    
    ${Icon} svg {
      > :first-child {
        ${({ color, kind, checked, theme, disabled, readOnly }) => {
          if (disabled || readOnly) {
            return undefined;
          }

          const isError = kind === 'error';
          if (checked) {
            const bgColor = isError
              ? theme.colors.statusError
              : (color &&
                  (theme.colors[`${color}Hovered` as SpecColorType] ||
                    theme.colors[`${color}Text` as SpecColorType])) ||
                color;

            return css`
              fill: ${bgColor};
            `;
          }

          const strokeColor = isError
            ? theme.colors.statusError
            : (color &&
                (theme.colors[`${color}Hovered` as SpecColorType] ||
                  theme.colors[`${color}Text` as SpecColorType])) ||
              color;

          const bgColor = isError
            ? theme.colors.statusError
            : (color && theme.colors[`${color}10` as SpecColorType]) || theme.colors.primary10;

          return css`
            fill: ${bgColor};
            stroke: ${strokeColor};
          `;
        }};
      }
    }
`;

const radioIcon = {
  success: <RadioSuccess />,
  filled: <RadioFilled />,
  radio: <RadioChecked />,
  error: <RadioError />,
  mobile: <RadioFilledMobile />,
};

const Radio = ({
  checked,
  kind,
  color,
  children,
  disabled,
  readOnly,
  reverse,
  isLegend,
  className,
  ...rest
}: RadioProps) => {
  const id = useMemo(() => _uniqueId(), []);

  return (
    <RadioContainer
      readOnly={readOnly}
      color={color}
      kind={kind}
      checked={checked}
      disabled={disabled}
      className={className || ''}
    >
      <Label htmlFor={id} withDescription={!!children} isLegend={!!isLegend} reverse={!!reverse}>
        {children && reverse && <Child disabled={disabled}>{children}</Child>}
        <Icon isLegend={!!isLegend}>
          {(kind === 'error' && radioIcon.error) ||
            (checked
              ? radioIcon[kind ?? 'radio']
              : (kind === 'mobile' && <RadioUncheckedMobile />) || <RadioUnchecked />)}
        </Icon>
        {children && !reverse && <Child disabled={disabled}>{children}</Child>}
      </Label>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
    </RadioContainer>
  );
};

export default styled(Radio)``;
