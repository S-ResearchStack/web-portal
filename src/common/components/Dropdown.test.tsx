import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown from 'src/common/components/Dropdown';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';

const items = ['1', '2', '3', '4', '5'].map((el) => ({ key: el, label: el }));

describe('Dropdown', () => {
  it('check dropdown open menu on click', async () => {
    const { getByTestId, queryByTestId, baseElement } = render(
      <ThemeProvider theme={theme}>
        <Dropdown activeKey="2" onChange={() => {}} items={items} data-testid="dropdown" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    await userEvent.click(getByTestId('dropdown'));
    expect(queryByTestId('menu-container')).toBeInTheDocument();

    await userEvent.click(getByTestId('dropdown'));
    expect(queryByTestId('menu-container')).not.toBeInTheDocument();
  });

  it('check menu item quantity in dropdown menu open', async () => {
    const { getByTestId, getAllByTestId, queryByTestId, baseElement } = render(
      <ThemeProvider theme={theme}>
        <Dropdown activeKey="2" onChange={() => {}} items={items} data-testid="dropdown" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    await userEvent.click(getByTestId('dropdown'));
    expect(queryByTestId('menu-container')).toBeInTheDocument();

    expect(getAllByTestId('menu-item').length).toBe(items.length);

    await userEvent.click(getByTestId('dropdown'));
    expect(queryByTestId('menu-container')).not.toBeInTheDocument();
  });

  it('test dropdown loading state', async () => {
    const { getByTestId, queryByTestId, baseElement } = render(
      <ThemeProvider theme={theme}>
        <Dropdown activeKey="2" onChange={() => {}} items={items} loading data-testid="dropdown" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    await userEvent.click(getByTestId('dropdown'));
    expect(queryByTestId('menu-container')).not.toBeInTheDocument();
  });

  it('[NEGATIVE] should render with wrong props', async () => {
    const { getByTestId, queryByTestId, queryAllByTestId, baseElement } = render(
      <ThemeProvider theme={theme}>
        <Dropdown
          data-testid="dropdown"
          activeKey="2"
          items={[] as typeof items}
          onChange={() => {}}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    await userEvent.click(getByTestId('dropdown'));

    expect(queryByTestId('menu-container')).toBeInTheDocument();
    expect(queryAllByTestId('menu-item')).toHaveLength(0);
  });
});
