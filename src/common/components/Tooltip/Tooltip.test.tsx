import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { userEvent } from '@storybook/testing-library';
import { ThemeProvider } from 'styled-components/';

import theme from 'src/styles/theme';
import TooltipProvider from 'src/common/components/Tooltip/TooltipProvider';
import TooltipsList from 'src/common/components/Tooltip/TooltipsList';
import { TooltipControls } from 'src/common/components/Tooltip/types';

import Tooltip from './Tooltip';

beforeAll(() => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

let container: HTMLDivElement;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  container.remove();
});

describe('Tooltip', () => {
  it('Should tooltip render', async () => {
    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip trigger="hover" content="Test" position="r" point={[100, 100]}>
              <button type="button">Right</button>
            </Tooltip>
            <TooltipsList />
          </TooltipProvider>
        </ThemeProvider>,
        { container }
      );
    });

    const ttTrigger = (await screen.findByTestId('tooltip-container')) as Element;

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(ttTrigger).toHaveTextContent('Right');

    act(() => {
      userEvent.hover(ttTrigger);
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument()
    );

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument();
    expect(await screen.findByTestId('tooltip-item')).toHaveTextContent('Test');
    expect(await screen.findByTestId('tooltip-portal')).toBeInTheDocument();

    act(() => {
      userEvent.unhover(ttTrigger);
    });

    await waitForElementToBeRemoved(() => screen.queryByTestId('tooltip-portal'));

    expect(container.parentNode).toMatchSnapshot();
  });

  it('should tooltip static render', async () => {
    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip static trigger="hover" content="Test" position="r" point={[100, 100]}>
              <button type="button">Right</button>
            </Tooltip>
            <TooltipsList />
          </TooltipProvider>
        </ThemeProvider>,
        { container }
      );
    });

    const ttTrigger = (await screen.findByTestId('tooltip-container')) as Element;

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(ttTrigger).toHaveTextContent('Right');

    act(() => {
      userEvent.hover(ttTrigger);
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument()
    );

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument();
    expect(await screen.findByTestId('tooltip-item')).toHaveTextContent('Test');

    act(() => {
      userEvent.unhover(ttTrigger);
    });

    expect(container.parentNode).toMatchSnapshot();
    expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument();
    expect(await screen.findByTestId('tooltip-item')).toHaveTextContent('Test');
  });

  it('should tooltip change props', async () => {
    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip trigger="hover" content="Test" position="r" point={[100, 100]}>
              <button type="button">Right</button>
            </Tooltip>
            <TooltipsList />
          </TooltipProvider>
        </ThemeProvider>,
        { container }
      );
    });

    const ttTrigger = (await screen.findByTestId('tooltip-container')) as Element;

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(ttTrigger).toHaveTextContent('Right');

    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip trigger="click" content="Test" position="r" point={[100, 100]}>
              <button type="button">Right</button>
            </Tooltip>
            <TooltipsList />
          </TooltipProvider>
        </ThemeProvider>,
        { container }
      );
    });

    expect(container.parentNode).toMatchSnapshot();

    act(() => {
      userEvent.click(ttTrigger);
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument()
    );

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();

    const ttItem = await screen.findByTestId('tooltip-item');

    expect(ttItem).toBeInTheDocument();
    expect(ttItem).toHaveTextContent('Test');
  });

  it('should controlled open', async () => {
    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip content="Test" position="r" point={[100, 100]}>
              <button type="button">Right</button>
            </Tooltip>
            <TooltipsList />
          </TooltipProvider>
        </ThemeProvider>,
        { container }
      );
    });

    const ttTrigger = (await screen.findByTestId('tooltip-container')) as Element;

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();

    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip show content="Test" position="r" point={[100, 100]}>
              <button type="button">Right</button>
            </Tooltip>
            <TooltipsList />
          </TooltipProvider>
        </ThemeProvider>,
        { container }
      );
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument()
    );

    const ttItem = await screen.findByTestId('tooltip-item');

    expect(container.parentNode).toMatchSnapshot();
    expect(ttItem).toBeInTheDocument();
    expect(ttItem).toHaveTextContent('Test');
  });

  it('should imperative handle', async () => {
    const ref = React.createRef<TooltipControls>();

    render(
      <ThemeProvider theme={theme}>
        <TooltipProvider>
          <Tooltip ref={ref} content="Test">
            <button type="button">Right</button>
          </Tooltip>
          <TooltipsList />
        </TooltipProvider>
      </ThemeProvider>
    );

    const ttTrigger = (await screen.findByTestId('tooltip-container')) as Element;

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(ttTrigger).toHaveTextContent('Right');

    act(() => {
      ref.current?.show();
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument()
    );

    const ttItem = await screen.findByTestId('tooltip-item');

    expect(container.parentNode).toMatchSnapshot();
    expect(ttItem).toBeInTheDocument();
    expect(ttItem).toHaveTextContent('Test');

    expect(screen.queryByTestId('tooltip-arrow')).toBeNull();

    act(() => {
      ref.current?.setArrow(true);
    });

    await waitFor(() => expect(screen.queryByTestId('tooltip-arrow')).toBeInTheDocument());

    expect(container.parentNode).toMatchSnapshot();
    expect(await screen.queryByTestId('tooltip-arrow')).toBeInTheDocument();

    act(() => {
      ref.current?.setContent('Test-1');
    });

    expect(ttItem).toHaveTextContent('Test-1');

    act(() => {
      ref.current?.setPosition('b');
    });

    expect(ttItem).toHaveTextContent('Test-1');

    act(() => {
      ref.current?.hide();
    });

    await waitFor(() => expect(screen.queryByTestId('tooltip-item')).toBeNull());

    expect(container.parentNode).toMatchSnapshot();
    expect(await screen.queryByTestId('tooltip-item')).toBeNull();
  });
});
