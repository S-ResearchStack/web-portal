import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { Container, StyledSvg, TooltipColorPoint } from './styles';

describe('chart styles helpers', () => {
  it('should render Container', () => {
    const { baseElement } = render(
      <Container width={100} height={200}>
        children
      </Container>
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('children');
  });

  it('[NEGATIVE] should render Container with invalid props', () => {
    const { baseElement } = render(
      <Container width={NaN} height={NaN}>
        children
      </Container>
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('children');
  });

  it('should render TooltipColorPoint', () => {
    const { baseElement } = render(<TooltipColorPoint color="red">children</TooltipColorPoint>);
    expect(baseElement).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('children');
  });

  it('[NEGATIVE] should render TooltipColorPoint with invalid props', () => {
    const { baseElement } = render(<TooltipColorPoint color="">children</TooltipColorPoint>);
    expect(baseElement).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('children');
  });

  it('should render StyledSvg', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <StyledSvg focusWidth={100} $contextVisible>
          children
        </StyledSvg>
      </ThemeProvider>
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('children');
  });

  it('[NEGATIVE] should render StyledSvg with invalid props', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <StyledSvg focusWidth={NaN} $contextVisible>
          children
        </StyledSvg>
      </ThemeProvider>
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('children');
  });
});
