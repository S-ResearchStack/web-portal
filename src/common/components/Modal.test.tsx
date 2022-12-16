import React from 'react';
import 'src/__mocks__/setupUniqueIdMock';
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

  it('[NEGATIVE] should render with wrong props', () => {
    const onAccept = jest.fn();
    const onDecline = jest.fn();

    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Modal
          open
          title={null as unknown as string}
          description={null as unknown as string}
          declineLabel={null as unknown as string}
          acceptLabel={null as unknown as string}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const title = getByTestId('modal-title');
    const description = getByTestId('modal-description');
    const acceptBtn = getByTestId('accept-button');
    const declineBtn = getByTestId('decline-button');

    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(acceptBtn).toBeInTheDocument();
    expect(declineBtn).toBeInTheDocument();
  });
});
