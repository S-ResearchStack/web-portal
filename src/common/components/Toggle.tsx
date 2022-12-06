import React, { FC, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import spring, { toString as springToString } from 'css-spring';
import _uniqueId from 'lodash/uniqueId';

import { colors, px, typography } from 'src/styles';

const UNCHECKED_HOVERED_SPRING_CONFIG = { stiffness: 256, damping: 24 };
const CHECKED_SPRING_CONFIG = { stiffness: 711.1, damping: 40 };

const uncheckedHoverAnimation = keyframes`
  ${springToString(spring({ left: px(2) }, { left: px(4) }, UNCHECKED_HOVERED_SPRING_CONFIG))}
`;

const checkedAnimation = keyframes`
  ${springToString(spring({ left: px(4) }, { left: px(18) }, CHECKED_SPRING_CONFIG))}
`;

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: JSX.Element | string;
}

const ANIMATION_FN = 'cubic-bezier(0, 0, 0.58, 1)';

const ToggleContainer = styled.div`
  padding-left: ${px(2)};

  input {
    display: none;

    & + label {
      height: ${px(40)};
      min-width: ${px(40)};
      position: relative;
      display: flex;
      align-items: center;
      gap: ${px(12)};

      &:after,
      &:before {
        content: '';
        display: block;
        position: absolute;
        animation-fill-mode: forwards;
      }

      &:before {
        width: ${px(36)};
        height: ${px(20)};
        border-radius: ${px(10)};
        background-color: ${colors.disabled};
        transition: background-color 300ms ${ANIMATION_FN};
      }

      &:after {
        width: ${px(16)};
        height: ${px(16)};
        border-radius: ${px(8)};
        background-color: ${colors.backgroundOnPrimary};
        left: ${px(2)};
      }

      > span {
        ${typography.bodySmallRegular};
        color: ${colors.textPrimary};
        margin-left: ${px(50)};
        transition: color 300ms ${ANIMATION_FN};
      }
    }

    &:enabled + label:hover {
      cursor: pointer;
    }

    &:not(:checked):not(:disabled) + label:hover {
      &:after {
        animation-name: ${uncheckedHoverAnimation};
        animation-duration: 500ms;
      }
    }

    &:checked + label {
      &:before {
        background-color: ${colors.primary};
      }

      &:after {
        animation-name: ${checkedAnimation};
        animation-duration: 500ms;
      }

      &:hover {
        &:before {
          background-color: ${colors.primaryHovered};
        }
      }
    }

    &:disabled {
      & + label {
        &:before {
          background-color: ${colors.disabled};
        }

        &:after {
          background-color: ${colors.onDisabled};
        }

        > span {
          color: ${colors.textDisabled};
        }
      }

      &:checked + label {
        &:before {
          background-color: ${colors.primaryDisabled};
        }

        &:after {
          background-color: ${colors.backgroundOnPrimary};
        }
      }
    }
  }
`;

const Toggle: FC<ToggleProps> = ({ className, label, ...props }) => {
  const id = useMemo(() => _uniqueId('toggle_'), []);

  return (
    <ToggleContainer className={className}>
      <input {...props} id={id} type="checkbox" />
      <label data-testid="label" htmlFor={id}>
        {label && <span>{label}</span>}
      </label>
    </ToggleContainer>
  );
};

export default Toggle;
