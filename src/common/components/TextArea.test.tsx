import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import TextArea from './TextArea';
import { text } from 'd3';
import { act } from 'react-test-renderer';
import userEvent from '@testing-library/user-event';

const onChangeFn = jest.fn();

const mockProps = {
  value: 'test',
  onChange: onChangeFn,
};

describe('TextArea test', () => {
  it('should render appearance BORDERED correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <TextArea {...mockProps} appearance="bordered" />
      </ThemeProvider>
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockProps.value);
    expect(textarea).toHaveStyleRule('border', '0.0625rem solid #ECF1FC');
  });

  it('should render appearance DESCRIPTION correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <TextArea {...mockProps} appearance="description" />
      </ThemeProvider>
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockProps.value);
    expect(textarea).toHaveStyleRule('color', '#808080');
  });

  it('should render appearance INPUT or DEFAULT correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <TextArea {...mockProps} appearance="input" />
      </ThemeProvider>
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockProps.value);
    expect(textarea).toHaveStyleRule('border', '0.0625rem solid transparent');
  });

  it('[NEGATIVE] should render with error', () => {
    render(
      <ThemeProvider theme={theme}>
        <TextArea {...mockProps} error="error-test" />
      </ThemeProvider>
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockProps.value);
    expect(screen.getByText('error-test')).toBeInTheDocument();
  });

  it('should handle change value', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TextArea {...mockProps} />
        </ThemeProvider>
      );
    });
    await act(() => {
      userEvent.type(screen.getByRole('textbox'), 'abc');
    });
    await waitFor(() => {
      expect(onChangeFn).toHaveBeenCalledTimes(3);
    });
  });
});
