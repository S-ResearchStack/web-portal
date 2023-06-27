import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { userEvent } from '@storybook/testing-library';
import { ThemeProvider } from 'styled-components/';

import theme from 'src/styles/theme';
import TooltipProvider from 'src/common/components/Tooltip/TooltipProvider';
import TooltipsList from 'src/common/components/Tooltip/TooltipsList';
import { TooltipControls, TooltipPosition } from 'src/common/components/Tooltip/types';
import { disableDateNowMock } from 'src/__mocks__/setUpDateMock';

import Tooltip from './Tooltip';

beforeAll(() => {
  disableDateNowMock();

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

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-container')).toBeInTheDocument()
    );

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

  it('[NEGATIVE] Should tooltip render with wrong props', async () => {
    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip trigger={'unknown' as 'hover'} content={null as unknown as string}>
              <button type="button">Right</button>
            </Tooltip>
            <TooltipsList />
          </TooltipProvider>
        </ThemeProvider>,
        { container }
      );
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-container')).toBeInTheDocument()
    );

    const ttTrigger = await screen.findByTestId('tooltip-container');

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(ttTrigger).toHaveTextContent('Right');
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

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-container')).toBeInTheDocument()
    );

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

  it('[NEGATIVE] should tooltip static render with wrong props', async () => {
    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip static trigger={'unknown' as 'hover'} content={null as unknown as string}>
              <button type="button">Right</button>
            </Tooltip>
            <TooltipsList />
          </TooltipProvider>
        </ThemeProvider>,
        { container }
      );
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-container')).toBeInTheDocument()
    );

    const ttTrigger = (await screen.findByTestId('tooltip-container')) as Element;

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(ttTrigger).toHaveTextContent('Right');
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

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-container')).toBeInTheDocument()
    );

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

  it('[NEGATIVE] should tooltip change props with wrong values', async () => {
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

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-container')).toBeInTheDocument()
    );

    const ttTrigger = (await screen.findByTestId('tooltip-container')) as Element;

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(ttTrigger).toHaveTextContent('Right');

    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip trigger="click" content={1 as unknown as string} position={'unknown' as 'r'}>
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
    expect(ttItem).toHaveTextContent('1');
  });

  it('should render with different position', async () => {
    for (const position of [
      'tl',
      't',
      'tr',
      'bl',
      'b',
      'br',
      'rt',
      'r',
      'rb',
      'lt',
      'l',
      'lb',
      'abl',
      'abr',
      'atl',
      'atr',
    ]) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      act(() => {
        render(
          <ThemeProvider theme={theme}>
            <TooltipProvider>
              <Tooltip
                show
                trigger="hover"
                content="Test"
                position={position as TooltipPosition}
                point={[100, 100]}
                arrow
              >
                <button type="button">Trigger</button>
              </Tooltip>
              <TooltipsList />
            </TooltipProvider>
          </ThemeProvider>,
          { container }
        );
      });

      // eslint-disable-next-line no-await-in-loop
      await waitFor(async () =>
        // eslint-disable-next-line no-await-in-loop
        expect(await screen.findByTestId('tooltip-item')).toBeInTheDocument()
      );
      // eslint-disable-next-line no-await-in-loop
      expect(await screen.findByTestId('tooltip-item')).toHaveTextContent('Test');
    }
  });

  it('[NEGATIVE] should render with invalid position', async () => {
    act(() => {
      render(
        <ThemeProvider theme={theme}>
          <TooltipProvider>
            <Tooltip
              show
              trigger="hover"
              content="Test"
              position={'invalid' as TooltipPosition}
              point={[100, 100]}
            >
              <button type="button">Trigger</button>
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
      ref.current?.setPoint([0, 0]);
    });

    expect(ttItem).toBeInTheDocument();

    expect(ref.current?.getContainer()).toBeDefined();
    expect(ref.current?.getTooltip()).toBeDefined();

    act(() => {
      ref.current?.hide();
    });

    await waitFor(() => expect(screen.queryByTestId('tooltip-item')).toBeNull());

    expect(container.parentNode).toMatchSnapshot();
    expect(await screen.queryByTestId('tooltip-item')).toBeNull();

    act(() => {
      ref.current?.destroy();
    });
  });

  it('[NEGATIVE] should render with wrong ref property', async () => {
    const ref = null as unknown as React.RefObject<TooltipControls>;

    act(() => {
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
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-container')).toBeInTheDocument()
    );

    const ttTrigger = (await screen.findByTestId('tooltip-container')) as Element;

    expect(container.parentNode).toMatchSnapshot();
    expect(ttTrigger).toBeInTheDocument();
    expect(ttTrigger).toHaveTextContent('Right');
  });

  it('[NEGATIVE] should imperative handle with wrong props', async () => {
    const ref = React.createRef<TooltipControls>();

    act(() => {
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
    });

    await waitFor(async () =>
      expect(await screen.findByTestId('tooltip-container')).toBeInTheDocument()
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
      ref.current?.setArrow('string' as unknown as boolean);
    });

    await waitFor(() => expect(screen.queryByTestId('tooltip-arrow')).toBeInTheDocument());

    expect(container.parentNode).toMatchSnapshot();
    expect(await screen.queryByTestId('tooltip-arrow')).toBeInTheDocument();

    act(() => {
      ref.current?.setContent(null);
    });

    expect(ttItem).not.toHaveTextContent('Test-1');

    act(() => {
      ref.current?.setPosition(null as unknown as 'b');
    });

    expect(ttItem).not.toHaveTextContent('Test-1');

    act(() => {
      ref.current?.hide();
    });

    await waitFor(() => expect(screen.queryByTestId('tooltip-item')).toBeNull());

    expect(container.parentNode).toMatchSnapshot();
    expect(await screen.queryByTestId('tooltip-item')).toBeNull();
  });
});
