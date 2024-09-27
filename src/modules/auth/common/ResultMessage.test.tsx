import React from 'react';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import theme from 'src/styles/theme';
import ResultMessage from './ResultMessage';
import EmptyStateImg from 'src/assets/illustrations/empty_state.svg';

describe('ResultMessage', () => {
  it('should render', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <ResultMessage picture={<EmptyStateImg/>} title="Title test" description="Desciption test"/>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('should render with more space', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <ResultMessage moreSpace picture={<EmptyStateImg/>} title="Title test" description="Desciption test"/>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });
});
