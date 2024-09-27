import React from 'react';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import SimpleGrid, { DeviceScreenMatches, SimpleGridCell } from './SimpleGrid';

describe('SimpleGridCell test in tablet', () => {
  const mockColumns: DeviceScreenMatches<[number, number]> = {
    desktop: [5, 8],
    laptop: [6, 10],
    tablet: [1, 10],
  };
  const mockRows: DeviceScreenMatches<[number, number]> = {
    desktop: [1, 2],
    laptop: [1, 2],
    tablet: [4, 5],
  };

  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <SimpleGridCell columns={mockColumns} rows={mockRows}>
          <div>test</div>
        </SimpleGridCell>
      </ThemeProvider>
    );
    expect(screen.getByRole('container')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByRole('container')).toHaveStyleRule(
      'grid-column',
      `${mockColumns.tablet[0]} / span ${mockColumns.tablet[1] - mockColumns.tablet[0] + 1}`
    );
    expect(screen.getByRole('container')).toHaveStyleRule(
      'grid-row',
      `${mockRows.tablet[0]} / span ${mockRows.tablet[1] - mockRows.tablet[0]}`
    );
  });

  it('[NEGATIVE] should render correctly without rows definition', () => {
    render(
      <ThemeProvider theme={theme}>
        <SimpleGridCell columns={mockColumns}>
          <div>test</div>
        </SimpleGridCell>
      </ThemeProvider>
    );
    expect(screen.getByRole('container')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByRole('container')).toHaveStyleRule(
      'grid-column',
      `${mockColumns.tablet[0]} / span ${mockColumns.tablet[1] - mockColumns.tablet[0] + 1}`
    );
    expect(screen.getByRole('container')).toHaveStyleRule('grid-row', `1 / span 1`);
  });
});

describe('SimpleGrid test in tablet', () => {
  const onChangeFn = jest.fn();
  const mockColumns = { tablet: 2, laptop: 3, desktop: 4 };
  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <SimpleGrid columns={mockColumns} onChange={onChangeFn}>
          <div>test</div>
        </SimpleGrid>
      </ThemeProvider>
    );

    expect(screen.getByRole('container')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByRole('container')).toHaveStyleRule(
      'grid-template-columns',
      `repeat(${mockColumns.tablet},1fr)`
    );
  });

  it('[NEGATIVE] should render without columns definition', () => {
    render(
      <ThemeProvider theme={theme}>
        <SimpleGrid onChange={onChangeFn}>
          <div>test</div>
        </SimpleGrid>
      </ThemeProvider>
    );

    expect(screen.getByRole('container')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should handle change when component mounts', async () => {
    render(
      <ThemeProvider theme={theme}>
        <SimpleGrid onChange={onChangeFn}>
          <div>test</div>
        </SimpleGrid>
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(onChangeFn).toBeCalled();
    });
  });
});
