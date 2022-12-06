import React, { SVGProps } from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { px } from 'src/styles';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Edit from 'src/assets/icons/edit.svg';
import IconButton from './IconButton';

const WrongIcon = (props: Record<string, unknown>) => <div {...props} />;

describe('IconButton', () => {
  it('test iconButton render', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <IconButton $size="s" color="primary" data-testid="iconButton" icon={Edit} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const iconButton = getByTestId('iconButton');
    const icon = queryByTestId('icon');

    expect(iconButton).toBeInTheDocument();
    expect(iconButton).toHaveStyle(`height: ${px(16)}`);
    expect(icon).toHaveStyle(`fill: ${theme.colors.primary}`);
  });

  it('test iconButton disabled state', async () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <IconButton $size="m" color="primary" data-testid="iconButton" icon={Edit} disabled />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const iconButton = getByTestId('iconButton');
    const icon = queryByTestId('icon');

    expect(iconButton).toBeInTheDocument();
    expect(iconButton).toHaveStyle(`height: ${px(24)}`);
    expect(icon).toHaveStyle(`fill: ${theme.colors.disabled}`);
  });

  it('[NEGATIVE] should render with wrong props', async () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <IconButton
          data-testid="iconButton"
          color={'' as 'primary'}
          icon={WrongIcon as unknown as React.FC<SVGProps<SVGSVGElement>>}
          $size="m"
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const iconButton = getByTestId('iconButton');
    const icon = queryByTestId('icon');

    expect(iconButton).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });
});
