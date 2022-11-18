import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  it('test tooltip render', () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Tooltip trigger="hover" content="Test" position="r" point={[100, 100]}>
          <button type="button">Right</button>
        </Tooltip>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const tooltipContainer = queryByTestId('tooltip-container') as Element;

    expect(tooltipContainer).toBeInTheDocument();
  });
});
