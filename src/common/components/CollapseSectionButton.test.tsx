import { render, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components';
import React from 'react';
import CollapseSectionButton from './CollapseSectionButton';
import { act } from 'react-test-renderer';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import 'jest-styled-components';

const onCollapsedChangeFn = jest.fn();
const onClickFn = jest.fn();

const mockProps = {
  title: 'test title',
  onCollapsedChange: onCollapsedChangeFn,
  onClick: onClickFn,
};

describe('CollapseSectionButton test', () => {
  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <CollapseSectionButton {...mockProps} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('collapse-button')).toBeInTheDocument();
    expect(screen.getByTestId('collapse-title')).toBeInTheDocument();
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
  });

  it('[NEGATIVE] should render with broken props', () => {
    render(
      <ThemeProvider theme={theme}>
        <CollapseSectionButton {...mockProps} title={undefined as any}/>
      </ThemeProvider>
    );

    expect(screen.getByTestId('collapse-button')).toBeInTheDocument();
    expect(screen.getByTestId('collapse-title')).toBeInTheDocument();
  });

  it('should handle click event', async () => {
    render(
      <ThemeProvider theme={theme}>
        <CollapseSectionButton {...mockProps} />
      </ThemeProvider>
    );
    const button = screen.getByTestId('collapse-button');
    await userEvent.click(button);
    expect(onCollapsedChangeFn).toBeCalled();
    expect(onClickFn).toBeCalled();
  });

  it('[NEGATIVE] should be disabled', async () => {
    render(
      <ThemeProvider theme={theme}>
        <CollapseSectionButton {...mockProps} disabled={true} />
      </ThemeProvider>
    );
    expect(screen.getByTestId('collapse-button')).toHaveStyle('pointer-events: none');
  });
});
