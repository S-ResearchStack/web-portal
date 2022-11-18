import React, { ForwardedRef, forwardRef, useMemo } from 'react';

import styled, { css } from 'styled-components';

import Ripple, { useRipple } from 'src/common/components/Ripple';
import { px, typography } from 'src/styles';
import Spinner from './Spinner';

export const RIPPLE_ANIMATION_DURATION = 600;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fill: 'solid' | 'text' | 'bordered';
  double?: 'left' | 'right';
  $loading?: boolean;
  width?: number;
  icon?: JSX.Element;
  rate?: 'default' | 'small' | 'icon';
  dashed?: boolean;
  rippleOff?: boolean;
}

type ContentProps = {
  icon?: JSX.Element;
};

const StyledRippleButton = styled.button<ButtonProps>`
  position: relative;
  display: flex !important;
  align-items: center;
  justify-content: center;
  border-radius: ${px(4)};
  margin-left: ${({ double }) => double === 'right' && px(8)};
  margin-right: ${({ double }) => double === 'left' && px(8)};
  width: ${({ width }) => (width ? px(width) : '100%')};
  white-space: nowrap;
  padding: 0;
  overflow: hidden;
  transition-duration: ${({ fill, $loading }) => (fill !== 'text' && !$loading ? '400ms' : 0)};
  transition-property: background-color;

  &:hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
  }

  ${({ rate }) =>
    (rate === 'default' &&
      css`
        height: ${px(48)};
        > div {
          ${typography.bodyMediumSemibold};
          svg {
            margin-right: ${px(4)};
          }
        }
      `) ||
    (rate === 'small' &&
      css`
        height: ${px(40)};
        > div {
          ${typography.bodySmallSemibold};
          svg {
            margin-right: ${px(4)};
          }
        }
      `) ||
    (rate === 'icon' &&
      css`
        height: ${px(24)};
        width: ${px(24)};
      `)};

  ${({ fill, theme, $loading, dashed }) =>
    (fill === 'solid' &&
      css`
        border: none;
        background-color: ${theme.colors.primary};
        > div {
          color: ${theme.colors.backgroundOnPrimary};
          svg {
            fill: ${theme.colors.backgroundOnPrimary};
          }
        }
        :hover:enabled {
          background-color: ${theme.colors.primaryHovered};
        }
        :disabled {
          background-color: ${$loading ? theme.colors.primary : theme.colors.primaryDisabled};
        }
        :focus-visible:enabled {
          // TODO check if enabled needed
          border: ${px(2)} solid ${theme.colors.primaryWhite};
          background-color: ${theme.colors.primary};
          outline: ${px(2)} solid ${theme.colors.primaryLightFocused};
        }
      `) ||
    (fill === 'text' &&
      css`
        border: none;
        background-color: transparent;
        > div {
          color: ${theme.colors.primary};
          svg {
            fill: ${theme.colors.primary};
          }
        }
        :hover:enabled {
          > div {
            color: ${theme.colors.primaryHovered};
            svg {
              fill: ${theme.colors.primaryHovered};
            }
          }
          :active {
            > div {
              color: ${theme.colors.primaryBluePressed};
              svg {
                fill: ${theme.colors.primaryBluePressed};
              }
            }
          }
        }
        :disabled {
          > div {
            color: ${theme.colors.primaryDisabled};
            svg {
              fill: ${theme.colors.primaryDisabled};
            }
          }
        }
        :focus-visible {
          outline: ${px(2)} solid ${theme.colors.primaryLightFocused};
          > div {
            color: ${theme.colors.primary};
            svg {
              fill: ${theme.colors.primary};
            }
          }
        }
      `) ||
    (fill === 'bordered' &&
      css`
        box-sizing: border-box;
        border: ${px(1)} ${dashed ? 'dashed' : 'solid'}
          ${dashed ? theme.colors.primaryDisabled : theme.colors.primary};
        background-color: transparent;
        > div {
          height: ${!$loading && '100%'};
          color: ${theme.colors.primary};
          svg {
            fill: ${theme.colors.primary};
          }
        }
        :hover:enabled {
          background-color: ${theme.colors.primaryLight};
        }
        :disabled {
          border: ${px(1)} ${dashed ? 'dashed' : 'solid'}
            ${$loading ? theme.colors.primary : theme.colors.primaryDisabled};
          > div {
            color: ${theme.colors.primaryDisabled};
            svg {
              fill: ${!$loading && theme.colors.primaryDisabled};
            }
          }
        }
        :focus-visible {
          outline: ${px(2)} ${dashed ? 'dashed' : 'solid'} ${theme.colors.primaryLightFocused};
        }
      `)}

  ${({ fill, rate, $loading, theme }) =>
    (fill === 'text' &&
      rate === 'icon' &&
      css`
        :hover:enabled {
          background-color: ${theme.colors.primaryLight};
          :active {
            > div {
              color: ${theme.colors.primaryBluePressed};
              svg {
                fill: ${theme.colors.primaryBluePressed};
              }
            }
          }
        }
        :focus-visible:enabled {
          background-color: ${theme.colors.primaryLightFocused};
          outline: none;
        }
      `) ||
    (fill === 'solid' &&
      rate === 'icon' &&
      css`
        background-color: ${$loading && 'transparent'} !important;
      `)}
`;

const Content = styled.div<ContentProps>`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translate3d(0, 0, ${px(1)}); // fix: z-index for Safari
`;

const Button = forwardRef(
  (
    {
      icon,
      $loading,
      fill,
      disabled,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      children,
      width,
      rate = 'default',
      rippleOff,
      ...props
    }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const { addRippleTriggerProps, rippleProps } = useRipple<
      HTMLButtonElement,
      Partial<ButtonProps>
    >({
      duration: RIPPLE_ANIMATION_DURATION,
    });

    const spinner = useMemo(
      () =>
        (fill === 'solid' && rate === 'icon' && <Spinner size="xs" />) ||
        (fill === 'solid' ? <Spinner size="xs" $light /> : <Spinner size="xs" />),
      [fill, rate]
    );

    const isRippleOn = rippleOff !== true;

    return (
      <StyledRippleButton
        {...(isRippleOn ? addRippleTriggerProps(props) : props)}
        disabled={disabled || $loading}
        fill={fill}
        $loading={$loading}
        width={width}
        rate={rate}
        icon={icon}
        ref={ref}
        {...props}
      >
        {$loading ? (
          spinner
        ) : (
          <Content icon={icon} data-testid="content">
            {icon}
            {children}
          </Content>
        )}
        {isRippleOn && (
          <Ripple
            {...rippleProps}
            color={fill === 'solid' ? 'primaryPressed' : 'primaryLightPressed'}
          />
        )}
      </StyledRippleButton>
    );
  }
);

export default Button;
