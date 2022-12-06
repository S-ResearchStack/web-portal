import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import userEvent from '@testing-library/user-event';
import { getByText, render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import CollapseSection from './CollapseSection';

describe('CollapseSection', () => {
  it('test collapse section render', async () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <CollapseSection data-testid="collapse-section" title="title">
          <div>Content</div>
        </CollapseSection>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const collapseSection = getByTestId('collapse-section');
    const collapseButton = queryByTestId('collapse-button') as Element;

    expect(collapseSection).toBeInTheDocument();
    expect(collapseButton).toBeInTheDocument();
    expect(getByText(baseElement, 'Content')).toBeVisible();

    await userEvent.click(collapseButton);

    expect(getByText(baseElement, 'Content')).not.toBeVisible();
  });

  it('[NEGATIVE] should render with wrong props', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <CollapseSection data-testid="collapse-section" title={false as unknown as string}>
          {false as unknown as string}
        </CollapseSection>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const collapseContent = getByTestId('collapse-body');
    const collapseTitle = getByTestId('collapse-title');

    expect(collapseContent).toBeInTheDocument();
    expect(collapseContent).toHaveTextContent('');
    expect(collapseTitle).toBeInTheDocument();
    expect(collapseTitle).toHaveTextContent('');
  });
});
