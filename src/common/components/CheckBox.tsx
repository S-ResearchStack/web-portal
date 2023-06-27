import React, { useMemo } from 'react';

import styled, { css } from 'styled-components';
import _uniqueId from 'lodash/uniqueId';

import Blank from 'src/assets/icons/checkbox_blank.svg';
import Checked from 'src/assets/icons/checkbox_checked.svg';
import BlankMobile from 'src/assets/icons/checkbox_blank_mobile.svg';
import { animation, colors, px, typography } from 'src/styles';
import { isDevShowFocus } from 'src/common/utils/dev';

// TODO: fix icon
const CheckedMobile = Checked;
/* import CheckedMobile from 'src/assets/icons/checkbox_checked_mobile.svg'; */

// When using a `type` instead of an `interface`, the linter gives an error in the component props

export interface CheckboxProps
  extends React.PropsWithChildren<React.InputHTMLAttributes<HTMLInputElement>> {
  isMobile?: boolean;
}

const Label = styled.label<{ withDescription: boolean }>`
  display: inline-grid;
  gap: ${px(4)};
  grid-template-columns: ${({ withDescription }) => (withDescription ? `${px(40)} 1fr` : px(40))};
  align-items: flex-start;
`;

const Icon = styled.div`
  width: ${px(40)};
  height: ${px(40)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Child = styled.div<{ disabled?: boolean }>`
  ${typography.bodySmallRegular};
  color: ${({ disabled }) => (disabled ? colors.textDisabled : colors.textPrimary)};
  margin-top: ${px(9.5)};
  transition: color 300ms ${animation.defaultTiming};
`;

const CheckboxContainer = styled.div<CheckboxProps>`
  display: inline-block;

  input {
    display: none;
  }

  // TODO: for dev only
  ${isDevShowFocus &&
  css`
    &:focus-within {
      outline: 2px solid ${colors.primary30} !important;
    }
  `}
  ${Icon} > svg {
    > :nth-child(1) {
      transition: stroke 300ms ${animation.defaultTiming}, fill 300ms ${animation.defaultTiming};

      ${({ disabled, checked }) => {
        if (disabled) {
          if (checked)
            return css`
              fill: ${colors.disabled};
            `;
          return css`
            stroke: ${colors.disabled};
            fill: ${colors.disabled20};
          `;
        }

        if (checked)
          return css`
            fill: ${colors.primary};
          `;
        return css`
          stroke: ${colors.primaryDisabled};
          fill: ${colors.surface};
        `;
      }};
    }
  }

  &:hover {
    > ${Label} {
      cursor: ${({ disabled }) => !disabled && 'pointer'};
    }

    ${Icon} > svg {
      > :nth-child(1) {
        ${({ checked, disabled }) => {
          if (disabled) {
            if (checked)
              return css`
                fill: ${colors.disabled};
              `;
            return css`
              stroke: ${colors.disabled};
            `;
          }

          if (checked)
            return css`
              fill: ${colors.primaryHovered};
            `;
          return css`
            fill: ${colors.primary10};
            stroke: ${colors.primaryDisabled};
          `;
        }}
      }
    }
  }
`;

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  children,
  disabled,
  className,
  isMobile,
  ...rest
}) => {
  const id = useMemo(() => _uniqueId('checkbox_'), []);

  return (
    <CheckboxContainer className={className || ''} checked={checked} disabled={disabled}>
      <Label htmlFor={id} withDescription={!!children}>
        <Icon>
          {checked
            ? (isMobile && <CheckedMobile />) || <Checked />
            : (isMobile && <BlankMobile />) || <Blank />}
        </Icon>
        {children && (
          <Child data-testid="checkbox-label" disabled={disabled}>
            {children}
          </Child>
        )}
      </Label>
      <input type="checkbox" disabled={disabled} id={id} checked={checked} {...rest} />
    </CheckboxContainer>
  );
};

export default Checkbox;
