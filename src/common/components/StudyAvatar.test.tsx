import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { px } from 'src/styles';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import StudyAvatar from './StudyAvatar';

describe('StudyAvatar', () => {
  it('test studyAvatar render', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <StudyAvatar color="primary" data-testid="styled-avatar" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const avatar = getByTestId('styled-avatar');
    const avatarIcon = queryByTestId('avatar-icon') as Element;

    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveStyle(`height: ${px(40)}`);
    expect(avatarIcon.getAttribute('fill')).toBe(`${theme.colors.primary}`);
  });

  it('test studyAvatar selected state', () => {
    const { baseElement, getByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <StudyAvatar color="primary" data-testid="styled-avatar" size="m" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const avatar = getByTestId('styled-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveStyle(`height: ${px(62)}`);
    expect(avatar).not.toHaveStyle(`box-shadow: ${theme.boxShadow.studyAvatar}`);
    expect(avatar).not.toHaveStyle(
      `filter: drop-shadow(0 ${px(15)} ${px(20)} rgba(180,180,180,0.3))`
    );

    rerender(
      <ThemeProvider theme={theme}>
        <StudyAvatar color="primary" data-testid="styled-avatar" $selected size="m" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveStyle(`height: ${px(69)}`);
    expect(avatar).toHaveStyle(`box-shadow: ${theme.boxShadow.studyAvatar}`);
    expect(avatar).toHaveStyle(`filter: drop-shadow(0 ${px(15)} ${px(20)} rgba(180,180,180,0.3))`);
  });

  it('[NEGATIVE] should render with wrong props', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <StudyAvatar color={'unknown' as 'primary'} data-testid="styled-avatar" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('styled-avatar')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render without props', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <StudyAvatar data-testid="styled-avatar" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('styled-avatar')).toBeInTheDocument();
  });
});
