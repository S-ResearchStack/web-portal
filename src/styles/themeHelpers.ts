import { DefaultTheme, FlattenSimpleInterpolation } from 'styled-components';

export type PropsWithTheme = {
  theme: DefaultTheme;
};

type ThemePropertyHelperFn<T> = {
  [K in keyof T]: (props: PropsWithTheme) => FlattenSimpleInterpolation;
};

function defineThemePropertyFn<T>(themeKey: keyof DefaultTheme): ThemePropertyHelperFn<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy({} as any, {
    get(_target, name) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (props: PropsWithTheme) => (props.theme[themeKey] as any)[name];
    },
  });
}

export const colorsFn = defineThemePropertyFn<DefaultTheme['colors']>('colors');
export const typographyFn = defineThemePropertyFn<DefaultTheme['typography']>('typography');
export const boxShadowFn = defineThemePropertyFn<DefaultTheme['boxShadow']>('boxShadow');
export const animationFn = defineThemePropertyFn<DefaultTheme['animation']>('animation');
