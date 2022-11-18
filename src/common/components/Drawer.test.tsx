import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { getByText, render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Drawer from './Drawer';

describe('Drawer', () => {
  it('test drawer section render', () => {
    const { baseElement, queryByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <Drawer open={false}>
          <div>Content</div>
        </Drawer>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const slide = queryByTestId('slide') as Element;
    const content = getByText(baseElement, 'Content');

    expect(slide).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(slide).toHaveStyle('transform: translateX(100%)');

    rerender(
      <ThemeProvider theme={theme}>
        <Drawer open>
          <div>Content</div>
        </Drawer>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(slide).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(slide).toHaveStyle('transform: translateX(0%)');
  });

  it('test drawer section direction', () => {
    const { baseElement, queryByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <Drawer open>
          <div>Content</div>
        </Drawer>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const slide = queryByTestId('slide') as Element;

    expect(slide).toBeInTheDocument();
    expect(slide).toHaveStyle('right: 0');

    rerender(
      <ThemeProvider theme={theme}>
        <Drawer open direction="left">
          <div>Content</div>
        </Drawer>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(slide).toBeInTheDocument();
    expect(slide).toHaveStyle('left: 0');
  });
});
