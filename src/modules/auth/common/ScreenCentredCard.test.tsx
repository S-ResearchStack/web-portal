import React from 'react';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import theme from 'src/styles/theme';
import ScreenCenteredCard from 'src/modules/auth/common/ScreenCenteredCard';

describe('ScreenCentredCard', () => {
  it('should render', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <ScreenCenteredCard minWidth={1000} width={900} ratio={0.9}>
          <div>test</div>
        </ScreenCenteredCard>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('[NEGATIVE] should render without props', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <ScreenCenteredCard >
          <div>test</div>
        </ScreenCenteredCard>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });
});
