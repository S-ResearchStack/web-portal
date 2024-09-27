import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'jest-styled-components';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components';
import ReorderSections from './ReorderSections';

describe('ReorderSection', () => {
  it('should render', async () => {
    const onRequestClose = jest.fn();
    const onChange = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          <ReorderSections
            open
            onRequestClose={onRequestClose}
            onChange={onChange}
            sections={[
              {
                id: '1',
                title: 's1',
                children: [{ id: 'c11' }, { id: 'c12' }],
              },
              {
                id: '2',
                title: 's2',
                children: [{ id: 'c21' }, { id: 'c22' }],
              },
            ]}
          />
        </DndProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('s1')).toBeVisible();
    expect(screen.getByText('s2')).toBeVisible();

    onRequestClose.mockReset();
    onChange.mockReset();
    await userEvent.click(screen.getByText('Save changes'));
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();

    onRequestClose.mockReset();
    onChange.mockReset();
    await userEvent.click(screen.getByText('Cancel'));
    expect(onRequestClose).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('[NEGATIVE] should render with broken sections', async () => {
    const onRequestClose = jest.fn();
    const onChange = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          <ReorderSections
            open
            onRequestClose={onRequestClose}
            onChange={onChange}
            sections={undefined as any}
          />
        </DndProvider>
      </ThemeProvider>
    );

    onRequestClose.mockReset();
    onChange.mockReset();
    await userEvent.click(screen.getByText('Save changes'));
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    onRequestClose.mockReset();
    onChange.mockReset();
    await userEvent.click(screen.getByText('Cancel'));
    expect(onRequestClose).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
