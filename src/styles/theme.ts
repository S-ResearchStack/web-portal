import { css, DefaultTheme } from 'styled-components';
import { px } from './utils';

const colors = {
  background: '#FFFFFF',

  primary: '#2F3D78',
  primaryHover: '#515C8C',
  primaryPressed: '#767FA9',
  primary50: 'rgba(47, 61, 120, 0.5)',
  primary30: 'rgba(47, 61, 120, 0.3)',
  primary10: 'rgba(47, 61, 120, 0.1)',
  primaryHoverLight: '#F0F1F6',

  textPrimary: '#000000',
  textSecondary: '#474747',
  textTetriary: '#ABABAB',

  onPrimary: '#FCFCFC',

  secondaryTurquoise: '#82CCB6',
  secondaryGreen: '#93C56B',
  secondaryBlue: '#6CC2DD',
  secondaryPurple: '#6B6FC5',
  secondaryNavy: '#7699CE',

  onSecondary: '#F8FAFD',
  border: '#DADADA',
  surface: '#FFFFFF',
  onSurface: '#252525',
  onSurfaceLight: '#727885',

  disabled: '#DBDBDB',
  textDisabled: '#838383',
  onDisabled: '#A1A1A1',

  error: '#CC0000',
  success: '#00C851',
  warning: '#FFBB33',
  info: '#33B5E5',

  // TODO: undefined colors
  shadowBorder: '#E4E7EB',
  backdrop: 'rgba(0, 0, 0, 0.4)',
  dropdownItemHover: '#F5F5F5',
  textSelected: '#EFF1FB',
  textHover: 'rgba(239, 241, 251, 0.45)',
  textSecondary85: 'rgba(71, 71, 71, 0.8)',
  black08: 'rgba(0, 0, 0, 0.08)',
  black10: 'rgba(0, 0, 0, 0.1)',

  // v0.9
  updSurface: '#FFFFFF',
  updBackground: '#F7F8FA',
  updOnPrimary: '#FFFFFF',
  updBackgroundOnPrimary: '#FFFFFF',
  updBackgroundSurface: '#FFFFFF',
  updBackgroundOnSurface: '#2D2D2D',
  updPrimary: '#4475E3',
  updPrimaryLight: '#ECF1FC',
  updPrimaryHovered: '#2F65E0',
  updPrimary10: '#ECF1FC',
  updPrimary30: '#C7D6F7',
  updPrimaryDisabled: '#B3C6F1',
  updPrimaryLightPressed: '#E3EAFB',
  updPrimaryLightFocused: '#C7D6F7',
  updTextPrimary: '#474747',
  updPrimaryWhite: '#FFFFFF',
  updDisabled: '#DBDBDB',
  updDisabled20: 'rgba(219, 219, 219, 0.2)',
  updOnDisabled: '#A1A1A1',

  updTextPrimaryBlue: '#4475E3',
  updTextPrimaryDark: '#474747',
  updTextSecondaryGray: '#808080',
  updTextDisabled: '#838383',
  updOnSurface: '#2D2D2D',
  secondarySkyblue: '#00B0D7',
  secondaryTangerine: '#F39C18',
  secondaryRed: '#FA5F4F',
  secondaryViolet: '#944ED7',
  updBackgoundLight: '#F0F0F0',
  updPrimaryBlueHovered: '#2F65E0',
  updPrimaryBluePressed: '#2057D5',

  updStatusSuccess: '#2DC008',
  updStatusSuccess10: '#DCF2EA',
  updStatusSuccessText: '#00825D',

  updStatusError: '#FF3333',
  updStatusError10: '#FFEBEB',
  updStatusErrorText: '#D14343',

  updStatusWarning: '#F5BF00',
  updStatusWarning10: '#FFF7D0',
  updStatusWarningText: '#A36400',

  updSecondaryViolet: '#944ED7',
  updSecondaryVioletHovered: '#6A3799',
  updSecondaryViolet10: '#F4EDFB',

  updSecondaryTangerine: '#F39C18',
  updSecondaryTangerineHovered: '#CC8314',
  updSecondaryTangerine10: '#FEF5E8',

  updSecondarySkyBlue: '#00B0D7',
  updSecondarySkyBlueHovered: '#0092B3',
  updSecondarySkyBlue10: '#E5F7FB',

  updSecondaryGreen: '#1AD598',
  updSecondaryGreenHovered: '#16B37F',
  updSecondaryGreen10: '#E8FBF5',

  updSecondaryRed: '#FA5F4F',
  updSecondaryRedHovered: '#CC4E40',
  updSecondaryRed10: '#FFEFED',

  updTableCellActive: '#F6F8FE',
  updBlack: '#000000',
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
  style = 'normal',
  fontFamily = 'Roboto'
) => css`
  font-family: ${fontFamily}, sans-serif;
  font-size: ${px(size)};
  line-height: ${typeof lineHeight === 'string' ? lineHeight : px(lineHeight)};
  font-weight: ${weightToCssValue[weight]};
  font-style: ${style};
`;

const typography = {
  headingRegular72: fontSpec(72, 94, 'regular'),
  headingMedium72: fontSpec(72, 94, 'medium'),
  headlingBold72: fontSpec(72, 94, 'bold'),
  headingRegular64: fontSpec(64, 83, 'regular'),
  headingMedium64: fontSpec(64, 83, 'medium'),
  headlingBold64: fontSpec(64, 83, 'bold'),
  headingRegular56: fontSpec(56, 72, 'regular'),
  headingMedium56: fontSpec(56, 72, 'medium'),
  headlingBold56: fontSpec(56, 72, 'bold'),
  headingRegular48: fontSpec(48, 62, 'regular'),
  headingMedium48: fontSpec(48, 62, 'medium'),
  headlingBold48: fontSpec(48, 62, 'bold'),
  headingRegular34: fontSpec(34, 44, 'regular'),
  headingMedium34: fontSpec(34, 44, 'medium'),
  headlingBold34: fontSpec(34, 44, 'bold'),

  subheadingMedium30: fontSpec(30, 38, 'medium'),

  titleBold18: fontSpec(18, 24, 'bold'),
  titleRegular18: fontSpec(18, 24, 'regular'),
  titleMedium16: fontSpec(16, 20, 'medium'),
  titleMedium18: fontSpec(18, 24, 'medium'),
  titleRegular16: fontSpec(16, 20, 'regular'),

  buttonMedium18: fontSpec(18, 28, 'medium'),

  body1Regular16: fontSpec(16, 20, 'regular'),
  body1Medium16: fontSpec(18, 26, 'medium'),

  body2Regular14: fontSpec(14, 18, 'regular'),
  body2Medium14: fontSpec(14, 18, 'medium'),
  body2Bold14: fontSpec(14, 18, 'bold'),

  body3Regular12: fontSpec(12, 15, 'regular'),

  subheading2Medium24: fontSpec(24, '130%', 'medium'),

  textRegular16: fontSpec(16, 20, 'regular'),
  textMedium16: fontSpec(16, 26, 'medium'),
  textMedium14: fontSpec(14, 18, 'medium'),

  // TODO: undefined fonts
  sidebarTextMedium10: fontSpec(10, 20, 'medium'),
  sidebarTitleBold12: fontSpec(12, 18, 'bold'),
  sidebarTitleRegular12: fontSpec(12, 18, 'regular'),
  cardSubtitleRegular10: fontSpec(10, 12, 'regular'),
  donutChartTitleMedium60: fontSpec(60, 80, 'medium'),
  donutChartTitleMedium42: fontSpec(42, 60, 'medium'),
  pieChartTitleBold22: fontSpec(22, 30, 'bold'),

  // Inter typeface
  labelRegular: fontSpec(10, 15, 'regular', 'normal', 'Inter'),
  labelSemibold: fontSpec(10, 15, 'semibold', 'normal', 'Inter'),

  bodyXSmallRegular: fontSpec(12, 18, 'regular', 'normal', 'Inter'),
  bodyXSmallSemibold: fontSpec(12, 18, 'semibold', 'normal', 'Inter'),
  bodySmallRegular: fontSpec(14, 21, 'regular', 'normal', 'Inter'),
  bodySmallSemibold: fontSpec(14, 21, 'semibold', 'normal', 'Inter'),
  bodyMediumRegular: fontSpec(16, 24, 'regular', 'normal', 'Inter'),
  bodyMediumSemibold: fontSpec(16, 24, 'semibold', 'normal', 'Inter'),
  bodyLargeRegular: fontSpec(18, 26, 'regular', 'normal', 'Inter'),

  headingXSmall: fontSpec(16, 21, 'semibold', 'normal', 'Inter'),
  headingSmall: fontSpec(18, 23, 'semibold', 'normal', 'Inter'),
  headingXMedium: fontSpec(18, 27, 'semibold', 'normal', 'Inter'),
  headingXMediumRegular: fontSpec(18, 27, 'regular', 'normal', 'Inter'),
  headingMedium: fontSpec(24, 32.2, 'semibold', 'normal', 'Inter'),
  headingLargeSemibold: fontSpec(32, 42, 'semibold', 'normal', 'Inter'),
  headingXLargeSemibold: fontSpec(48, 58, 'semibold', 'normal', 'Inter'),
  headingXXLargeSemibold: fontSpec(60, 72, 'semibold', 'normal', 'Inter'),

  donutChartTitleSemibold48: fontSpec(48, 58, 'semibold', 'normal', 'Inter'),
  donutChartTitleSemibold32: fontSpec(32, 42, 'semibold', 'normal', 'Inter'),
  pieChartTitleSemibold24: fontSpec(24, 31, 'semibold', 'normal', 'Inter'),

  axisRegular10: fontSpec(10, 15, 'regular', 'normal', 'Inter'),

  barChartLabel16: fontSpec(16, 20, 'semibold', 'normal', 'Inter'),

  // Fira Code typeface
  query14: fontSpec(14, '130%', 'upperregular', 'normal', 'Fira Code'),
  query12: fontSpec(12, '150%', 'upperregular', 'normal', 'Fira Code'),
};

const boxShadow = {
  card: `0 0 ${px(2)} ${px(0)} rgba(0, 0, 0, 0.15)`,
  avatar: `0 ${px(8)} ${px(10)} ${px(2)} 0 rgba(0, 0, 0, 0.12)`,
  studyAvatar: `0 ${px(15)} ${px(20)} rgba(180, 180, 180, 0.3)`,
  scrollDrop: `${px(3)} ${px(4)} ${px(15)} 0 rgba(0, 0, 0, 0.05)`,
  previewScreen: `0 ${px(2)} ${px(4)} rgba(71, 71, 71, 0.25)`,
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
