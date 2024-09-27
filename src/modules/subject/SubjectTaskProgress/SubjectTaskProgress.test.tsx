import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import { createTestStore } from 'src/modules/store/testing';
import SubjectTaskProgress, { SubjectTaskProgressProps } from './SubjectTaskProgress';

const onSelectFn = jest.fn();
const mockProps: SubjectTaskProgressProps = {
  value: { totalCount: 0 } as any,
  onSelected: onSelectFn,
};
const doneCount = mockProps.value.totalCount - (mockProps.value.undoneTaskList?.length ?? 0);
describe('SubjectTaskProgress test', () => {
  beforeEach(async () => {
    const store = createTestStore({
      auth: {
        authToken: 'test token',
      },
    });
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <SubjectTaskProgress {...mockProps} />
          </Provider>
        </ThemeProvider>
      );
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render correctly', () => {
    expect(screen.getByText(`${doneCount} / ${mockProps.value.totalCount}`)).toBeInTheDocument();
  });

  it('should handle select', async () => {
    const taskProgress = screen.getByTestId('undone-task-label');
    expect(taskProgress).toBeInTheDocument();
    fireEvent.click(taskProgress)
    expect(onSelectFn).toBeCalled();
    expect(onSelectFn).toBeCalledWith(mockProps.value);
  });
});
