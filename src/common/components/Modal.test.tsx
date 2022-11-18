import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { getByText, render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Modal from './Modal';

describe('Modal', () => {
  it('test modal render', () => {
    const onAccept = jest.fn();
    const onDecline = jest.fn();

    const { baseElement, queryByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <Modal
          open
          title="Title"
          description="Description"
          declineLabel="Cancel"
          acceptLabel="Accept"
          onAccept={onAccept}
          onDecline={onDecline}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const modal = queryByTestId('modal') as Element;
    const title = getByText(baseElement, 'Title');
    const description = getByText(baseElement, 'Description');

    expect(modal).toBeInTheDocument();
    expect(modal).toBeVisible();

    expect(title).toBeInTheDocument();
    expect(title).toBeVisible();

    expect(description).toBeInTheDocument();
    expect(description).toBeVisible();

    rerender(
      <ThemeProvider theme={theme}>
        <Modal
          open={false}
          title="Title"
          description="Description"
          declineLabel="Cancel"
          acceptLabel="Accept"
          onAccept={onAccept}
          onDecline={onDecline}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(modal).toBeInTheDocument();
    expect(modal).not.toBeVisible();

    expect(title).toBeInTheDocument();
    expect(title).not.toBeVisible();

    expect(description).toBeInTheDocument();
    expect(description).not.toBeVisible();
  });
});
