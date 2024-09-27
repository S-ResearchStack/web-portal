import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GoogleSignInButton from './GoogleSignInButton';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';

const onSuccessFn = jest.fn();
const onFailureFn = jest.fn();
const loadScriptFn = jest.fn();

jest.mock('src/common/utils/scriptLoader', () => {
  return () => {
    loadScriptFn();
  };
});

describe('GoogleSignInButton test', () => {
  const env = process.env;
  beforeEach(() => {

    process.env = { ...env };
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = env;
  });

  it('should render correctly', async () => {
    process.env.GOOGLE_CLIENT_ID = 'mockID';

    render(
      <ThemeProvider theme={theme}>
        <GoogleSignInButton onSuccess={onSuccessFn} onFailure={onFailureFn} />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should loadScript when component mounts', async () => {
    process.env.GOOGLE_CLIENT_ID = 'mockID';
    render(
      <ThemeProvider theme={theme}>
        <GoogleSignInButton onSuccess={onSuccessFn} onFailure={onFailureFn} />
      </ThemeProvider>
    );
    expect(loadScriptFn).toHaveBeenCalled();
  });

  it('[NEGATIVE] should be null if GOOGLE_CLIENT_ID is not defined', () => {
    render(
      <ThemeProvider theme={theme}>
        <GoogleSignInButton onSuccess={onSuccessFn} onFailure={onFailureFn} />
      </ThemeProvider>
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
