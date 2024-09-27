import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components/';
import theme from 'src/styles/theme';
import CreatingLoader from './CreatingLoader';
import { BackdropOverlayProps } from 'src/common/components/BackdropOverlay';

type TaskCreatingProps = {
  label: string;
} & Omit<BackdropOverlayProps, 'blur'>;

describe('CreatingLoader component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label and spinner', () => {
    const label = 'Creating task...';
    const props: TaskCreatingProps = {
      label,
    };

    render(
      <ThemeProvider theme={theme}>
        <CreatingLoader {...props} />
      </ThemeProvider>
    );

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByTestId('creating-loader')).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });


  it('should pass other props to handle clickable Backdrop', async () => {
    const label = 'Creating task...';
    const props: TaskCreatingProps = {
      label,
      onClick: jest.fn(),
    };

    render(
      <ThemeProvider theme={theme}>
        <CreatingLoader {...props} />
      </ThemeProvider>
    );

    const backdropOverlay = screen.getByTestId('backdrop');
    await userEvent.click(backdropOverlay);
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });
});