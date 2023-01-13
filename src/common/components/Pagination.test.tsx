import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components/';
import Pagination from './Pagination';

describe('Pagination', () => {
  const TOTAL = 1000;
  const PAGE_SIZE = 10;
  const CURRENT_OFFSET = 40;

  it('test pagination render', async () => {
    const onPageChange = jest.fn();

    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Pagination
          totalCount={TOTAL}
          pageSize={PAGE_SIZE}
          offset={CURRENT_OFFSET}
          onPageChange={onPageChange}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const pagination = queryByTestId('pagination') as Element;
    const prevButton = queryByTestId('go-to-previous') as Element;
    const nextButton = queryByTestId('go-to-next') as Element;
    const firstButton = queryByTestId('go-to-first') as Element;
    const lastButton = queryByTestId('go-to-last') as Element;
    const info = queryByTestId('info') as Element;

    expect(pagination).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(firstButton).toBeInTheDocument();
    expect(lastButton).toBeInTheDocument();
    expect(info).toBeInTheDocument();

    expect(prevButton).not.toBeDisabled();
    expect(firstButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
    expect(lastButton).not.toBeDisabled();
    expect(info).toHaveTextContent(
      `${CURRENT_OFFSET + 1}-${CURRENT_OFFSET + PAGE_SIZE + 1} of ${TOTAL}`
    );

    await userEvent.click(nextButton);
    expect(onPageChange).toHaveBeenLastCalledWith(50, 10);

    await userEvent.click(prevButton);
    expect(onPageChange).toHaveBeenLastCalledWith(30, 10);

    await userEvent.click(firstButton);
    expect(onPageChange).toHaveBeenLastCalledWith(0, 10);

    await userEvent.click(lastButton);
    expect(onPageChange).toHaveBeenLastCalledWith(990, 10);
  });

  it('[NEGATIVE] should render with wrong props', async () => {
    const onPageChange = jest.fn();

    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Pagination totalCount={-1} pageSize={-1} offset={-1} onPageChange={onPageChange} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const pagination = queryByTestId('pagination') as Element;
    const prevButton = queryByTestId('go-to-previous') as Element;
    const nextButton = queryByTestId('go-to-next') as Element;
    const firstButton = queryByTestId('go-to-first') as Element;
    const lastButton = queryByTestId('go-to-last') as Element;

    expect(pagination).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(firstButton).toBeInTheDocument();
    expect(lastButton).toBeInTheDocument();
  });
});
