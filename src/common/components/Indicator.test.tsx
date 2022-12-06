import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { px } from 'src/styles';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Indicator from './Indicator';

describe('Indicator', () => {
  it('test indicator render', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Indicator color="success" data-testid="indicator" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const indicator = getByTestId('indicator');

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle(`height: ${px(8)}`);
    expect(indicator).toHaveStyle(`background-color: ${theme.colors.statusSuccess}`);
  });

  it('[NEGATIVE] should render with wrong props', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Indicator color={'unknown' as 'success'} data-testid="indicator" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const indicator = getByTestId('indicator');

    expect(indicator).toBeInTheDocument();
  });
});
