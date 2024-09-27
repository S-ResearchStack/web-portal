import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'jest-styled-components';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { expectToBeDefined } from 'src/common/utils/testing';
import { createTestStore } from 'src/modules/store/testing';
import theme from 'src/styles/theme';
import LoadableImageGridEditor from './LoadableImageGridEditor';

describe('LoadableImageGridEditor', () => {
  it('should render', async () => {
    const store = createTestStore({});
    const data = [
      {
        id: '1',
        image: '',
        value: 'l1',
        touched: true,
      },
      {
        id: '2',
        image: '',
        value: 'l2',
        touched: true,
      },
      {
        id: '3',
        image: '',
        value: '',
      },
    ];

    const onChange = jest.fn();
    const createCell = jest.fn();

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <LoadableImageGridEditor
              data={data}
              uniqueId="test"
              onChange={onChange}
              imageLabels
              createCell={createCell}
              limits={{ min: 0, max: 10 }}
              getUploadObjectPath={() => 'path'}
            />
          </DndProvider>
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('l1')).toBeVisible();
    expect(screen.getByText('l2')).toBeVisible();

    const emptyLabel = screen
      .getAllByPlaceholderText('Add label')
      .find((e) => !(e as HTMLTextAreaElement).value);
    expectToBeDefined(emptyLabel);
    await userEvent.type(emptyLabel, 'New label');

    await userEvent.upload(
      screen.getAllByTestId('file-input')[0],
      new File([], 'test_file', { type: 'image/png' })
    );

    await userEvent.click(screen.getAllByLabelText('Delete Item')[0]);
  });

  it('[NEGATIVE] should render with no data', () => {
    const store = createTestStore({});

    const onChange = jest.fn();
    const createCell = jest.fn();

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <LoadableImageGridEditor
              data={[]}
              uniqueId="test"
              onChange={onChange}
              imageLabels
              createCell={createCell}
              limits={{ min: 0, max: 10 }}
              getUploadObjectPath={() => 'path'}
            />
          </DndProvider>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toBeVisible();
  });
});
