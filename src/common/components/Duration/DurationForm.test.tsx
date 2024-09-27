import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import DurationForm, {
  DurationProps,
  durationUnitFirstKey,
  durationUnitSecondKey,
} from './DurationForm';
import { act } from 'react-test-renderer';
import userEvent from '@testing-library/user-event';

jest.mock('src/common/components/Dropdown', () => {
  return (props: any) => {
    return (
      <select value={props.activeKey} onChange={props.onChange} aria-label="unit dropdown">
        {props.items.map((it: { label: string; key: any }) => (
          <option key={it.key} value={it.key}>
            {it.label}
          </option>
        ))}
      </select>
    );
  };
});

const onChangeFn = jest.fn();

const mockProps: DurationProps = {
  duration: {
    amount: 10,
    durationUnitFirst: durationUnitFirstKey.HOUR,
    durationUnitSecond: durationUnitSecondKey.DAY,
  },
  onChange: onChangeFn,
  label: 'form label',
};

const mockFirstOptions = [
  { label: 'test minute(s)', key: durationUnitFirstKey.MINUTE },
  { label: 'test hours(s)', key: durationUnitFirstKey.HOUR },
];

const mockSecondOptions = [
  { label: 'test day', key: durationUnitSecondKey.DAY },
  { label: 'test week', key: durationUnitSecondKey.WEEK },
  { label: 'test month', key: durationUnitSecondKey.MONTH },
];

describe('DurationForm test', () => {
  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <DurationForm {...mockProps} />
      </ThemeProvider>
    );

    expect(screen.getByText('form label')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toHaveValue(mockProps.duration.amount);

    const dropdowns = screen.getAllByLabelText('unit dropdown');
    expect(dropdowns[0]).toHaveValue(mockProps.duration.durationUnitFirst);
    expect(dropdowns[1]).toHaveValue(mockProps.duration.durationUnitSecond);
  });

  it('[NEGATIVE] should render with error', () => {
    const props = { ...mockProps, error: 'error message' };
    render(
      <ThemeProvider theme={theme}>
        <DurationForm {...props} />
      </ThemeProvider>
    );
    expect(screen.getByText('form label')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toHaveValue(mockProps.duration.amount);
    expect(screen.getByTestId('input-error')).toBeInTheDocument();
    expect(screen.getByTestId('input-error')).toHaveTextContent(props.error);
    const dropdowns = screen.getAllByLabelText('unit dropdown');
    expect(dropdowns[0]).toHaveValue(mockProps.duration.durationUnitFirst);
    expect(dropdowns[1]).toHaveValue(mockProps.duration.durationUnitSecond);
  });

  it('should render with custom options', () => {
    const props = { ...mockProps, error: 'error message' };
    render(
      <ThemeProvider theme={theme}>
        <DurationForm {...props} firstOptions={mockFirstOptions} secondOptions={mockSecondOptions}/>
      </ThemeProvider>
    );
    expect(screen.getByText('form label')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toHaveValue(mockProps.duration.amount);
    expect(screen.getByTestId('input-error')).toBeInTheDocument();
    expect(screen.getByTestId('input-error')).toHaveTextContent(props.error);
    const dropdowns = screen.getAllByLabelText('unit dropdown');
    expect(dropdowns[0]).toHaveValue(mockProps.duration.durationUnitFirst);
    expect(dropdowns[1]).toHaveValue(mockProps.duration.durationUnitSecond);
  });

  it('should handle change value', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <DurationForm {...mockProps} />
        </ThemeProvider>
      );
    });
    const input = screen.getByTestId('input');
    const dropdowns = screen.getAllByLabelText('unit dropdown');
    await act(() => {
      userEvent.selectOptions(dropdowns[0], durationUnitFirstKey.MINUTE);
      userEvent.selectOptions(dropdowns[1], durationUnitSecondKey.WEEK);
    });
    expect(onChangeFn).toBeCalledTimes(2);

    await userEvent.type(input, '2')
    expect(onChangeFn).toBeCalledTimes(3)
  });
});
