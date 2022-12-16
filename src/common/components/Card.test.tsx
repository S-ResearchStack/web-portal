import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { getByText, render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Card from './Card';

describe('Card', () => {
  it('test card render', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Card data-testid="card" title="title" subtitle="subtitle">
          <div>Samsung</div>
        </Card>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const card = getByTestId('card');

    expect(card).toBeInTheDocument();
    expect(getByText(baseElement, 'title')).toBeInTheDocument();
    expect(getByText(baseElement, 'subtitle')).toBeInTheDocument();
    expect(getByText(baseElement, 'Samsung')).toBeInTheDocument();
  });

  it('test card error state', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Card data-testid="card" title="title" subtitle="subtitle" error>
          <div data-testid="content">Samsung</div>
        </Card>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const card = getByTestId('card');
    const content = queryByTestId('content');
    const errorScreen = queryByTestId('error-screen');

    expect(card).toBeInTheDocument();
    expect(getByText(baseElement, 'title')).toBeInTheDocument();
    expect(getByText(baseElement, 'subtitle')).toBeInTheDocument();
    expect(content).not.toBeInTheDocument();
    expect(errorScreen).toBeInTheDocument();
  });

  it('test card empty state', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Card data-testid="card" title="title" subtitle="subtitle" empty>
          <div data-testid="content">Samsung</div>
        </Card>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const card = getByTestId('card');
    const content = queryByTestId('content');
    const emptyScreen = queryByTestId('empty-screen');

    expect(card).toBeInTheDocument();
    expect(getByText(baseElement, 'title')).toBeInTheDocument();
    expect(getByText(baseElement, 'subtitle')).toBeInTheDocument();
    expect(content).not.toBeInTheDocument();
    expect(emptyScreen).toBeInTheDocument();
  });

  it('test card loading state', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Card data-testid="card" title="title" subtitle="subtitle" loading>
          <div>Samsung</div>
        </Card>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const card = getByTestId('card');
    const content = queryByTestId('content');
    const title = queryByTestId('title');
    const subtitle = queryByTestId('subtitle');
    const loader = queryByTestId('loader');

    expect(card).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
    expect(content).not.toBeInTheDocument();
    expect(loader).toBeInTheDocument();
  });

  it('[NEGATIVE] should render wrong properties', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Card
          data-testid="card"
          title={true as unknown as string}
          subtitle={true as unknown as string}
        >
          <div>{true}</div>
        </Card>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const card = getByTestId('card');
    const content = queryByTestId('card-content');
    const title = queryByTestId('title');
    const subtitle = queryByTestId('subtitle');

    expect(card).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveTextContent('');
    expect(content).toBeInTheDocument();
    expect(subtitle).toHaveTextContent('');
  });

  it('[NEGATIVE] should render without props', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Card data-testid="card" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const card = getByTestId('card');
    const content = queryByTestId('card-content');
    const title = queryByTestId('title');
    const subtitle = queryByTestId('subtitle');

    expect(card).toBeInTheDocument();
    expect(title).toBeNull();
    expect(subtitle).toBeNull();
    expect(content).toBeInTheDocument();
  });
});
