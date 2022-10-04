import { ThemeProvider } from 'styled-components';

import { theme, GlobalStyles } from 'src/styles';

// TODO: workaround since webpack DefinePlugin currently does not work with storybook
window.ENV_API_URL = '';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (story) => (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {story()}
    </ThemeProvider>
  ),
];
