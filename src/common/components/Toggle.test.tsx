import React from 'react';
import 'src/__mocks__/setupUniqueIdMock';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Toggle from './Toggle';

describe('Toggle', () => {
  it('test toggle click', async () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Toggle data-testid="toggle" label="toggle" />
      </ThemeProvider>
    );

    const toggle = getByTestId('toggle');
    const label = queryByTestId('label') as Element;

    expect(baseElement).toMatchSnapshot();
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);

    expect(baseElement).toMatchSnapshot();
    expect(toggle).toBeChecked();

    await userEvent.click(label);

    expect(toggle).not.toBeChecked();
  });

  it('test toggle disabled state', async () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Toggle data-testid="toggle" label="toggle" disabled />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('toggle')).toHaveAttribute('disabled');
  });

  it('[NEGATIVE] should prevent change checked state while element is disabled', async () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Toggle data-testid="toggle" label="toggle" disabled />
      </ThemeProvider>
    );

    const toggle = getByTestId('toggle');

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('toggle')).toHaveAttribute('disabled');
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);

    expect(toggle).not.toBeChecked();
  });

  it('[NEGATIVE] should render with wrong props', async () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Toggle
          data-testid="toggle"
          label={['toggle-test'] as unknown as string}
          checked={'unknown' as unknown as boolean}
          onChange={() => {}}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('toggle')).toBeChecked();
    expect(getByTestId('label')).toHaveTextContent('toggle-test');
  });
});
