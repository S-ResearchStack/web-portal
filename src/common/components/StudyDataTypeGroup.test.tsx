import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import StudyDataTypeGroup from './StudyDataTypeGroup';
import userEvent from '@testing-library/user-event';

const onChangeFn = jest.fn();

const mockProps = {
  groupTitle: 'runestone',
  groupTypes: ['type 1', 'type 2', 'type 3'],
  onChangeDataType: onChangeFn,
  requirements: {
    informedConsent: { imagePath: 'path' },
    healthDataTypeList: ['type 1'],
  },
};

describe('StudyDataTypeGroup test', () => {
  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <StudyDataTypeGroup {...mockProps} />
      </ThemeProvider>
    );
    expect(screen.getByText('Runestone')).toBeInTheDocument();
    const checkboxs = screen.getAllByRole('checkbox', { hidden: true });
    checkboxs.forEach((checkbox) => {
      expect(checkbox).toBeInTheDocument();
    });
    expect(checkboxs.length).toBe(4);
    expect(checkboxs[0]).not.toBeChecked();
    expect(checkboxs[1]).toBeChecked();
    expect(checkboxs[2]).not.toBeChecked();
    expect(checkboxs[3]).not.toBeChecked();
  });

  it('should handle change when click checkbox', () => {
    render(
      <ThemeProvider theme={theme}>
        <StudyDataTypeGroup {...mockProps} />
      </ThemeProvider>
    );
    const checkboxs = screen.getAllByRole('checkbox', { hidden: true });
    checkboxs.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });
    expect(onChangeFn).toBeCalledTimes(4);
  });

  it('[NEGATIVE] should render without group types', () => {
    render(
      <ThemeProvider theme={theme}>
        <StudyDataTypeGroup {...mockProps} groupTypes={[]} />
      </ThemeProvider>
    );
    expect(screen.getByText('Runestone')).toBeInTheDocument();
    const checkboxs = screen.getAllByRole('checkbox', { hidden: true });
    expect(checkboxs.length).toBe(1);
    checkboxs.forEach((checkbox) => {
      expect(checkbox).toBeInTheDocument();
    });
    expect(checkboxs[0]).toBeChecked();
  });
});
