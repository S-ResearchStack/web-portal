import React, { ForwardedRef, forwardRef, useMemo } from 'react';

import styled, { css } from 'styled-components';

import SpinnerGrey from 'src/assets/icons/spinner_animated.svg';
import SpinnerBlue from 'src/assets/icons/spinner_animated_blue.svg';
import { isDevShowFocus } from 'src/common/utils/dev';
import Ripple, { useRipple } from 'src/common/components/Ripple';
import { px, typography } from 'src/styles';

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
  $loading?: boolean;
};

const contentVisibleStyles = (visible: boolean | undefined) =>
  visible
    ? css`
        order: 0;
        opacity: 1;
      `
    : css`
        height: 0;
        padding: 0 !important;
        order: 1;
        opacity: 0;
      `;

const StyledRippleButton = styled.button<ButtonProps>`
  position: relative;
  display: block !important;
  z-index: 0;
  border-radius: ${px(4)};
  margin-left: ${({ double }) => double === 'right' && px(8)};
  margin-right: ${({ double }) => double === 'left' && px(8)};
  width: ${({ width }) => (width ? px(width) : '100%')};
  white-space: nowrap;
  padding: 0;
  overflow: hidden;
  transition-duration: ${({ fill, $loading }) => (fill !== 'text' && !$loading ? '400ms' : 0)};
  transition-property: background-color;

  ${({ rate, $loading }) =>
    (rate === 'default' &&
      css`
        height: ${px(48)};
        line-height: ${!$loading && px(48)};
        > div {
          ${typography.bodyMediumSemibold};
          top: 50%;
          transform: translateY(-50%);
        }
        svg {
          margin-right: ${px($loading ? 0 : 8)};
        }
      `) ||
    (rate === 'small' &&
      css`
        height: ${px(40)};
        line-height: ${!$loading && px(40)};
        > div {
          ${typography.bodySmallSemibold};
          top: 50%;
          transform: translateY(-50%);
        }
        svg {
          margin-right: ${px(8)};
        }
      `) ||
    (rate === 'icon' &&
      css`
        height: ${px(24)};
        width: ${px(24)};
        line-height: ${!$loading && px(24)};
        ${!$loading &&
        css`
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      `)};

  ${({ fill, theme, $loading, dashed }) =>
    (fill === 'solid' &&
      css`
        border: none;
        background-color: ${theme.colors.updPrimary};
        > div {
          color: ${theme.colors.updBackgroundOnPrimary};
          svg {
            fill: ${theme.colors.updBackgroundOnPrimary};
          }
        }
        :hover:enabled {
          background-color: ${theme.colors.updPrimaryHovered};
        }
        :disabled {
          background-color: ${$loading ? theme.colors.updPrimary : theme.colors.updPrimaryDisabled};
        }
        :focus-visible:enabled {
          // TODO check if enabled needed
          border: ${px(2)} solid ${theme.colors.updPrimaryWhite};
          background-color: ${theme.colors.updPrimary};
          outline: ${px(2)} solid ${theme.colors.updPrimaryLightFocused};
        }
      `) ||
    (fill === 'text' &&
      css`
        border: none;
        background-color: transparent;
        > div {
          color: ${theme.colors.updPrimary};
          svg {
            fill: ${theme.colors.updPrimary};
          }
        }
        :hover:enabled {
          > div {
            color: ${theme.colors.updPrimaryHovered};
            svg {
              fill: ${theme.colors.updPrimaryHovered};
            }
          }
          :active {
            > div {
              color: ${theme.colors.updPrimaryBluePressed};
              svg {
                fill: ${theme.colors.updPrimaryBluePressed};
              }
            }
          }
        }
        :disabled {
          > div {
            color: ${theme.colors.updPrimaryDisabled};
            svg {
              fill: ${!$loading && theme.colors.updPrimaryDisabled};
            }
          }
        }
        :focus-visible {
          outline: ${px(2)} solid ${theme.colors.updPrimaryLightFocused};
          > div {
            color: ${theme.colors.updPrimary};
            svg {
              fill: ${theme.colors.updPrimary};
            }
          }
        }
      `) ||
    (fill === 'bordered' &&
      css`
        box-sizing: border-box;
        border: ${px(1)} ${dashed ? 'dashed' : 'solid'} ${theme.colors.updPrimary};
        background-color: transparent;
        > div {
          height: ${!$loading && '100%'};
          color: ${theme.colors.updPrimary};
          svg {
            fill: ${theme.colors.updPrimary};
          }
        }
        :hover:enabled {
          background-color: ${theme.colors.updPrimaryLight};
        }
        :disabled {
          border: ${px(1)} ${dashed ? 'dashed' : 'solid'}
            ${$loading ? theme.colors.updPrimary : theme.colors.updPrimaryDisabled};
          > div {
            color: ${theme.colors.updPrimaryDisabled};
            svg {
              fill: ${!$loading && theme.colors.updPrimaryDisabled};
            }
          }
        }
        :focus-visible {
          outline: ${px(2)} ${dashed ? 'dashed' : 'solid'} ${theme.colors.updPrimaryLightFocused};
        }
      `)}

  ${({ fill, rate, $loading, theme }) =>
    (fill === 'text' &&
      rate === 'icon' &&
      css`
        :hover:enabled {
          background-color: ${theme.colors.updPrimaryLight};
          :active {
            > div {
              color: ${theme.colors.updPrimaryBluePressed};
              svg {
                fill: ${theme.colors.updPrimaryBluePressed};
              }
            }
          }
        }
        :focus-visible:enabled {
          background-color: ${theme.colors.updPrimaryLightFocused};
          outline: none;
        }
      `) ||
    (fill === 'solid' &&
      rate === 'icon' &&
      css`
        background-color: ${$loading && 'transparent'} !important;
      `)}

  // TODO: for dev only
  ${isDevShowFocus &&
  css`
    &:focus-visible {
      outline: 2px solid red !important;
    }
  `}
`;

const Content = styled.div<ContentProps>`
  position: relative;
  z-index: 2;
  border-radius: ${px(4)};
  ${({ $loading }) => contentVisibleStyles(!$loading)};
  ${({ icon }) =>
    icon &&
    css`
      display: flex;
      justify-content: center;
      align-items: center;
    `}
  }
`;

const spinnerStyle = (
  $loading: boolean | undefined,
  rate: 'default' | 'small' | 'icon' | undefined
) =>
  $loading
    ? css`
        position: relative;
        z-index: 2;
        opacity: 1;
        order: 0;
        margin-top: ${(rate === 'default' && px(5)) || (rate === 'small' && px(4))};
      `
    : css`
        height: 0;
        opacity: 0;
        order: 1;
      `;

const AnimatedSpinnerGrey = styled(SpinnerGrey)<Pick<ButtonProps, '$loading' | 'rate'>>`
  ${({ $loading, rate }) => spinnerStyle($loading, rate)}
`;

const AnimatedSpinnerBlue = styled(SpinnerBlue)<Pick<ButtonProps, '$loading' | 'rate'>>`
  ${({ $loading, rate }) => spinnerStyle($loading, rate)}
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
        (fill === 'solid' && rate === 'icon' && (
          <AnimatedSpinnerBlue $loading={$loading} rate={rate} />
        )) ||
        (fill === 'solid' ? (
          <AnimatedSpinnerGrey $loading={$loading} rate={rate} />
        ) : (
          <AnimatedSpinnerBlue $loading={$loading} rate={rate} />
        )),
      [fill, rate, $loading]
    );

    return (
      <StyledRippleButton
        {...addRippleTriggerProps(props)}
        disabled={disabled || $loading}
        fill={fill}
        $loading={$loading}
        width={width}
        rate={rate}
        icon={icon}
        ref={ref}
        {...props}
      >
        <Content $loading={$loading} icon={icon}>
          {icon}
          {children}
        </Content>
        {spinner}
        {rippleOff !== true && (
          <Ripple
            {...rippleProps}
            color={fill === 'solid' ? 'updPrimaryPressed' : 'updPrimaryLightPressed'}
          />
        )}
      </StyledRippleButton>
    );
  }
);

export default Button;
