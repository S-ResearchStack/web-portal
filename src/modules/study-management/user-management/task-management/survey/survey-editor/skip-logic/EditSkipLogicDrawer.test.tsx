import {
  act,
  getByTestId,
  getByText,
  queryByText,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Provider } from 'react-redux';
import { userEvent } from '@storybook/testing-library';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';

import { makeHistory } from 'src/modules/navigation/store';
import { createTestStore } from 'src/modules/store/testing';
import theme from 'src/styles/theme';
import { AppDispatch } from 'src/modules/store';
import EditSkipLogicDrawer from './EditSkipLogicDrawer';
import { startEditSkipLogic } from './skipLogic.slice';

describe('EditSkipLogicDrawer', () => {
  it('should render', async () => {
    const store = createTestStore({
      'survey/edit': {
        isSaving: false,
        isLoading: false,
        isCreating: false,
        survey: {
          studyId: 'test',
          id: 'test',
          revisionId: 0,
          title: '',
          description: '',
          questions: [
            {
              id: 's1',
              children: [
                {
                  id: 'q1',
                  title: '',
                  description: '',
                  type: 'multiple',
                  answers: [
                    {
                      id: 'a1',
                      value: 'a1',
                    },
                    {
                      id: 'a2',
                      value: 'a2',
                    },
                  ],
                  options: { optional: false, includeOther: false },
                },
              ],
            },
          ],
        },
      },
      'survey/edit/skipLogic': {
        isDrawerOpen: true,
        editQuestionId: 'q1',
      },
    });

    const history = makeHistory();

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <EditSkipLogicDrawer />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );
    expect(screen.queryByText('Add Skip Logic')).toBeInTheDocument();

    // Fill 1st condition
    userEvent.click(screen.getByText('Logic type...'));
    userEvent.click(screen.getByText('Specific option'));
    userEvent.click(screen.getByText('Option...'));
    userEvent.click(screen.getByText('a2'));
    userEvent.click(screen.getByText('Condition...'));
    userEvent.click(screen.getByText('Is selected'));
    expect(baseElement).toMatchSnapshot();

    // Add another condition
    userEvent.click(screen.getByTestId('add-condition'));
    userEvent.click(screen.getByText('Logic type...'));
    userEvent.click(screen.getByText('Total selected'));
    userEvent.click(screen.getByText('Condition...'));
    userEvent.click(screen.getByText('Is not equal to'));
    userEvent.click(screen.getByText('Number...'));
    userEvent.click(screen.getByText('1'));
    expect(baseElement).toMatchSnapshot();

    // Remove condition
    screen.getAllByTestId('remove-condition').forEach((b) => expect(b).not.toBeDisabled());
    userEvent.click(screen.getAllByTestId('remove-condition')[1]);
    expect(screen.getByTestId('remove-condition')).toBeDisabled();
    expect(baseElement).toMatchSnapshot();

    // Add rule
    userEvent.click(screen.getByText('Add rule'));
    expect(screen.getAllByText('If')).toHaveLength(2);
    // and fill condition for it
    userEvent.click(screen.getByText('Logic type...'));
    userEvent.click(screen.getByText('Total selected'));
    userEvent.click(screen.getByText('Condition...'));
    userEvent.click(screen.getByText('Is not equal to'));
    userEvent.click(screen.getByText('Number...'));
    userEvent.click(screen.getByText('1'));
    expect(baseElement).toMatchSnapshot();

    // Remove new rule
    // cancel first
    userEvent.click(screen.getAllByTestId('remove-rule')[1]);
    expect(getByText(baseElement, 'Remove Rule')).toBeInTheDocument();
    userEvent.click(getByTestId(baseElement, 'decline-button'));
    await waitForElementToBeRemoved(() => queryByText(baseElement, 'Remove Rule'));
    // then accept
    userEvent.click(screen.getAllByTestId('remove-rule')[1]);
    expect(getByText(baseElement, 'Remove Rule')).toBeInTheDocument();
    userEvent.click(getByTestId(baseElement, 'accept-button'));
    await waitForElementToBeRemoved(() => queryByText(baseElement, 'Remove Rule'));
    expect(screen.queryByTestId('remove-rule')).not.toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();

    // Remove all
    // cancel first
    userEvent.click(screen.getByText('Remove all'));
    expect(getByText(baseElement, 'Remove Skip Logic')).toBeInTheDocument();
    userEvent.click(getByTestId(baseElement, 'decline-button'));
    await waitForElementToBeRemoved(() => queryByText(baseElement, 'Remove Skip Logic'));
    // then accept
    userEvent.click(screen.getByText('Remove all'));
    expect(getByText(baseElement, 'Remove Skip Logic')).toBeInTheDocument();
    userEvent.click(getByTestId(baseElement, 'accept-button'));
    await waitForElementToBeRemoved(() => queryByText(baseElement, 'Remove Skip Logic'));
    expect(screen.getByText('Remove all').closest('button')).toBeDisabled();
    expect(baseElement).toMatchSnapshot();

    // Fill 1st condition
    userEvent.click(screen.getByText('Logic type...'));
    userEvent.click(screen.getByText('Specific option'));
    userEvent.click(screen.getByText('Option...'));
    userEvent.click(screen.getByText('a2'));
    userEvent.click(screen.getByText('Condition...'));
    userEvent.click(screen.getByText('Is selected'));
    expect(baseElement).toMatchSnapshot();

    // Close drawer
    // cancel first
    userEvent.click(screen.getByText('Cancel'));
    expect(getByText(baseElement, 'Unsaved Changes')).toBeInTheDocument();
    userEvent.click(getByTestId(baseElement, 'decline-button'));
    await waitForElementToBeRemoved(() => queryByText(baseElement, 'Unsaved Changes'));
    // then accept
    userEvent.click(screen.getByText('Cancel'));
    expect(getByText(baseElement, 'Unsaved Changes')).toBeInTheDocument();
    userEvent.click(getByTestId(baseElement, 'accept-button'));
    await waitForElementToBeRemoved(() => queryByText(baseElement, 'Unsaved Changes'));

    expect(baseElement).toMatchSnapshot();
    expect(screen.queryByText('If')).not.toBeInTheDocument();

    // Open drawer again, fill something and save
    // eslint-disable-next-line prefer-destructuring
    const dispatch: AppDispatch = store.dispatch;
    await act(() => dispatch(startEditSkipLogic('q1')));
    expect(screen.queryByText('Add Skip Logic')).toBeInTheDocument();
    userEvent.click(screen.getByText('Logic type...'));
    userEvent.click(screen.getByText('Specific option'));
    userEvent.click(screen.getByText('Save'));
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});
    const history = makeHistory();

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EditSkipLogicDrawer />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(screen.queryByText('If')).not.toBeInTheDocument();
  });
});
