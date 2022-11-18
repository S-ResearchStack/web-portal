import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components';
import { RippleTest } from './Ripple.stories';

describe('Ripple', () => {
  it('test ripple render', async () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <RippleTest />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const ripple = queryByTestId('ripple') as Element;
    const trigger = queryByTestId('trigger') as Element;

    expect(ripple).not.toBeVisible();
    expect(trigger).toBeVisible();
  });
});
