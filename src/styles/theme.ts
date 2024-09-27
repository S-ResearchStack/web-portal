import { css, DefaultTheme } from 'styled-components';
import { px } from './utils';

const colors = {
  // gray gradations
  black: '#000000',
  black60: 'rgba(0, 0, 0, 0.6)',
  black40: 'rgba(0, 0, 0, 0.4)',
  black08: 'rgba(0, 0, 0, 0.08)',
  black15: 'rgba(0, 0, 0, 0.15)',

  // blue gradations
  blue: "#b0c4f1",
  blue40: 'rgba(176, 196, 241, 0.4)',
  blue15: 'rgba(176, 196, 241, 0.15)',
  blue8: 'rgba(176, 196, 241, 0.08)',

  // light mode
  surface: '#FFFFFF',
  background: '#F7F8FA',
  onPrimary: '#FFFFFF',
  backgroundOnPrimary: '#FFFFFF',
  backgroundSurface: '#FFFFFF',
  backgroundOnSurface: '#2D2D2D',
  primary: '#4475E3',
  primaryShadow: '#4475E361',
  primaryLight: '#ECF1FC',
  primaryHovered: '#2F65E0',
  primary05: '#F6F8FE',
  primary10: '#ECF1FC',
  primary20: '#E3EAFB',
  primary30: '#C7D6F7',
  primaryDisabled: '#B3C6F1',
  primaryLightPressed: '#E3EAFB',
  primaryLightFocused: '#C7D6F7',
  textPrimary: '#474747',
  primaryWhite: '#FFFFFF',
  disabled: '#DBDBDB',
  disabled20: 'rgba(219, 219, 219, 0.2)',
  onDisabled: '#A1A1A1',

  textPrimaryBlue: '#4475E3',
  textPrimaryBlue10: 'rgba(68, 117, 227, 0.2)',
  textPrimaryDark: '#474747',
  textSecondaryGray: '#808080',
  textDisabled: '#838383',
  onSurface: '#2D2D2D',
  secondarySkyblue: '#00B0D7', // replace
  backgoundLight: '#F0F0F0',
  primaryBlueHovered: '#2F65E0',
  primaryBluePressed: '#2057D5',

  statusSuccess: '#2DC008',
  statusSuccess10: '#DCF2EA',
  statusSuccessText: '#00825D',

  statusError: '#FF3333',
  statusError10: '#FFEBEB',
  statusErrorText: '#D14343',

  statusWarning: '#F5BF00',
  statusWarning10: '#FFF7D0',
  statusWarningText: '#A36400',

  secondaryViolet: '#944ED7',
  secondaryVioletHovered: '#6A3799',
  secondaryViolet10: '#F4EDFB',

  secondaryTangerine: '#F39C18',
  secondaryTangerineHovered: '#CC8314',
  secondaryTangerine10: '#FEF5E8',

  secondarySkyBlue: '#00B0D7',
  secondarySkyBlueHovered: '#0092B3',
  secondarySkyBlue10: '#E5F7FB',

  secondaryGreen: '#1AD598',
  secondaryGreenHovered: '#16B37F',
  secondaryGreen10: '#E8FBF5',

  secondaryRed: '#FA5F4F',
  secondaryRedHovered: '#CC4E40',
  secondaryRed10: '#FFEFED',

  transparent: 'rgba(0, 0, 0, 0)'
};

export type SpecColorType = keyof typeof colors;

const weightToCssValue = {
  regular: 400,
  upperregular: 450,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const fontSpec = (
  size: number,
  lineHeight: number | string,
  weight: keyof typeof weightToCssValue,
  fontFamily: string
) => css`
  font-family: ${fontFamily}, sans-serif;
  font-size: ${px(size)};
  line-height: ${typeof lineHeight === 'string' ? lineHeight : px(lineHeight)};
  font-weight: ${weightToCssValue[weight]};
  font-style: normal;
`;

const typography = {
  // Inter typeface
  labelRegular: fontSpec(10, 15, 'regular', 'Inter'),
  labelSemibold: fontSpec(10, 15, 'semibold', 'Inter'),
  smallLabelRegular: fontSpec(8, 10, 'regular', 'Inter'),

  bodyXSmallRegular: fontSpec(12, 18, 'regular', 'Inter'),
  bodyXSmallSemibold: fontSpec(12, 18, 'semibold', 'Inter'),
  bodySmallRegular: fontSpec(14, 21, 'regular', 'Inter'),
  bodySmallSemibold: fontSpec(14, 21, 'semibold', 'Inter'),
  bodyMediumRegular: fontSpec(16, 24, 'regular', 'Inter'),
  bodyMediumSemibold: fontSpec(16, 24, 'semibold', 'Inter'),
  bodyLargeRegular: fontSpec(18, 26, 'regular', 'Inter'),
  bodyLargeSemibold: fontSpec(18, 26, 'semibold', 'Inter'),

  headingXSmall: fontSpec(16, 21, 'semibold', 'Inter'),
  headingSmall: fontSpec(18, 23, 'semibold', 'Inter'),
  headingXMedium: fontSpec(18, 27, 'semibold', 'Inter'),
  headingXMediumRegular: fontSpec(18, 27, 'regular', 'Inter'),
  headingMedium: fontSpec(24, 32.2, 'semibold', 'Inter'),
  headingLargeSemibold: fontSpec(32, 42, 'semibold', 'Inter'),
  heading2LargeSemibold: fontSpec(40, 52, 'semibold', 'Inter'),
  headingXLargeSemibold: fontSpec(48, 58, 'semibold', 'Inter'),
  headingXXLargeSemibold: fontSpec(60, 72, 'semibold', 'Inter'),

  portalDisplayLarge: fontSpec(72, 86, 'semibold', 'Inter'),

  sdkBodySmallRegular: fontSpec(14, '130%', 'regular', 'Inter'),
  sdkBodyLargeRegular: fontSpec(18, 24, 'regular', 'Inter'),
  sdkBodyLargeSemibold: fontSpec(18, 24, 'semibold', 'Inter'),
  sdkHeadingMedium: fontSpec(20, 26, 'semibold', 'Inter'),
  sdkBodyXXLRegular: fontSpec(32, 42, 'regular', 'Inter'),
  sdkBodyXXLSemibold: fontSpec(32, '130%', 'semibold', 'Inter'),
  sdkBodyMediumRegular: fontSpec(16, '130%', 'regular', 'Inter'),
  sdkBodyMediumSemibold: fontSpec(16, '130%', 'semibold', 'Inter'),
  sdkDisplayMedium: fontSpec(20, 26, 'semibold', 'Inter'),
  sdkHeadingLarge: fontSpec(40, '130%', 'semibold', 'Inter'),

  // Fira Code typeface
  query14: fontSpec(14, '130%', 'upperregular', 'Fira Code'),
  query12: fontSpec(12, '150%', 'upperregular', 'Fira Code'),
};

const boxShadow = {
  card: `0 0 ${px(2)} ${px(0)} rgba(0,0,0,0.15)`,
  avatar: `0 ${px(8)} ${px(10)} ${px(2)} 0 rgba(0,0,0,0.12)`,
  studyAvatar: `0 ${px(15)} ${px(20)} rgba(180,180,180,0.3)`,
  previewScreen: `0 ${px(2)} ${px(4)} rgba(71,71,71,0.25)`,
  skipLogicHeader: `box-shadow: ${px(3)} ${px(4)} ${px(15)} rgba(0, 0, 0, 0.05)`,
};

const animation = {
  defaultTiming: 'cubic-bezier(0.45, 0.05, 0, 1)',
  rippleTiming: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof colors;
    typography: typeof typography;
    boxShadow: typeof boxShadow;
    animation: typeof animation;
  }
}

const theme: DefaultTheme = {
  colors,
  typography,
  boxShadow,
  animation,
};

export default theme;
