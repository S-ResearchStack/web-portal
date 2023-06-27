import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, fireEvent, findByTestId, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import userEvent from '@testing-library/user-event';
import theme from 'src/styles/theme';
import ScatterChart from 'src/modules/charts/ScatterChart';

describe('ScatterChart', () => {
  it('should render', async () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ScatterChart
          width={1000}
          height={1000}
          dots={[
            {
              name: 'test',
              age: 30,
              value: 150,
              lastSync: 0,
              color: 'primary',
            },
          ]}
          hiddenDataLines={[]}
          lines={[
            {
              name: 'test',
              age: 30,
              value: 180,
              color: 'primary',
            },
            {
              name: 'test',
              age: 40,
              value: 140,
              color: 'primary',
            },
          ]}
        />
      </ThemeProvider>
    );
    expect(baseElement).toMatchSnapshot();

    const dot = await findByTestId(baseElement, 'dot-0');
    expect(dot).toBeInTheDocument();

    await act(async () => {
      await userEvent.hover(dot);
    });

    await act(async () => {
      await userEvent.unhover(dot);
    });

    const zoomInButton = getByTestId('zoom-in-button');
    const zoom = baseElement.querySelector('.zoom') as HTMLElement;

    expect(zoom).toBeInTheDocument();
    expect(zoomInButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(zoomInButton);
    });

    await waitFor(async () => expect(zoom).toHaveStyle('pointer-events: all'));

    expect(zoomInButton.querySelector('svg')).toHaveStyle('fill: #4475E3');

    fireEvent(
      zoom,
      new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: 610,
        clientY: 180,
      })
    );
    fireEvent(
      zoom,
      new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: 640,
        clientY: 200,
      })
    );
    fireEvent(
      zoom,
      new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
      })
    );

    await waitFor(async () =>
      expect(zoomInButton.querySelector('svg')).toHaveStyle('fill: #474747')
    );

    const zoomOutButton = getByTestId('zoom-out-button');

    await act(async () => {
      await userEvent.click(zoomOutButton);
    });

    await waitFor(async () =>
      expect(zoomOutButton.querySelector('svg')).toHaveStyle('fill: #DBDBDB')
    );
  });

  it('[NEGATIVE] should render with empty data', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <ScatterChart width={1000} height={1000} dots={[]} hiddenDataLines={[]} lines={[]} />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
