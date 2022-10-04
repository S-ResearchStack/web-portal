import React, { FC, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import spring, { toString } from 'css-spring';
import _uniqueId from 'lodash/uniqueId';

import { colors, px, typography } from 'src/styles';

const UNCHECKED_HOVERED_SPRING_CONFIG = { stiffness: 256, damping: 24 };
const CHECKED_SPRING_CONFIG = { stiffness: 711.1, damping: 40 };

const uncheckedHoverAnimation = keyframes`
  ${toString(spring({ left: px(2) }, { left: px(4) }, UNCHECKED_HOVERED_SPRING_CONFIG))}
`;

const checkedAnimation = keyframes`
  ${toString(spring({ left: px(4) }, { left: px(18) }, CHECKED_SPRING_CONFIG))}
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
        background-color: ${colors.updDisabled};
        transition: background-color 300ms ${ANIMATION_FN};
      }

      &:after {
        width: ${px(16)};
        height: ${px(16)};
        border-radius: ${px(8)};
        background-color: ${colors.updBackgroundOnPrimary};
        left: ${px(2)};
      }

      > span {
        ${typography.bodySmallRegular};
        color: ${colors.updTextPrimary};
        margin-left: ${px(50)};
        transition: color 300ms ${ANIMATION_FN};
      }
    }

    &:not(:checked):not(:disabled) + label:hover {
      &:after {
        animation-name: ${uncheckedHoverAnimation};
        animation-duration: 500ms;
      }
    }

    &:checked + label {
      &:before {
        background-color: ${colors.updPrimary};
      }

      &:after {
        animation-name: ${checkedAnimation};
        animation-duration: 500ms;
      }

      &:hover {
        &:before {
          background-color: ${colors.updPrimaryHovered};
        }
      }
    }

    &:disabled {
      & + label {
        &:before {
          background-color: ${colors.updDisabled};
        }

        &:after {
          background-color: ${colors.updOnDisabled};
        }

        > span {
          color: ${colors.updTextDisabled};
        }
      }

      &:checked + label {
        &:before {
          background-color: ${colors.updPrimaryDisabled};
        }

        &:after {
          background-color: ${colors.updBackgroundOnPrimary};
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
      <label htmlFor={id}>{label && <span>{label}</span>}</label>
    </ToggleContainer>
  );
};

export default Toggle;
