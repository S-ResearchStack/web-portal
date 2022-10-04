import { autoUpdate, offset } from '@floating-ui/react-dom';
import { useDismiss, useFloating, useInteractions } from '@floating-ui/react-dom-interactions';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import CalendarIcon from 'src/assets/icons/calendar.svg';
import Portal from 'src/common/components/Portal';
import { format } from 'src/common/utils/datetime';
import { ExtendProps } from 'src/common/utils/types';
import { colors, px, typography } from 'src/styles';
import CalendarPopover from './CalendarPopover';

const InputLabel = styled.div<{ $placeholder: boolean }>`
  ${typography.bodyMediumRegular};
  color: ${({ $placeholder, theme }) =>
    $placeholder ? theme.colors.updTextSecondaryGray : theme.colors.updTextPrimaryDark};
`;

const CalendarIconStyled = styled(CalendarIcon)``;

const InputContainer = styled.div<{ $disabled?: boolean; $highlight?: boolean }>`
  max-width: ${px(312)};
  height: ${px(56)};
  background-color: ${colors.updBackground};
  border-radius: ${px(4)};
  border-width: ${px(1)};
  border-color: ${({ $highlight, theme }) =>
    $highlight ? theme.colors.updPrimary : 'transparent'};
  border-style: solid;

  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  ${InputLabel} {
    margin-left: ${px(15)};
    color: ${({ $disabled, theme }) =>
      $disabled ? theme.colors.updDisabled : theme.colors.updTextPrimaryDark};
  }

  ${CalendarIconStyled} {
    margin-right: ${px(7)};
    fill: ${({ $disabled, theme }) =>
      $disabled ? theme.colors.updPrimaryDisabled : theme.colors.updPrimary};
  }
`;

type Props = ExtendProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    value?: Date;
    onChange: (value: Date) => void;
    disabled?: boolean;
    min?: Date;
    max?: Date;
    portal?: boolean;
    updatePosition?: boolean;
  }
>;

const DatePicker: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  min,
  max,
  portal,
  updatePosition,
  ...rest
}) => {
  const [isOpen, setOpen] = useState(false);

  const popover = useFloating({
    middleware: [offset(8)],
    placement: 'bottom',
    open: isOpen,
    onOpenChange: setOpen,
    whileElementsMounted: updatePosition || portal ? autoUpdate : undefined,
  });
  const popoverInteractions = useInteractions([useDismiss(popover.context)]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const handleSelectedDateChange = useCallback(
    (d: Date) => {
      setOpen(false);
      onChange(d);
    },
    [onChange]
  );

  const popoverElement = isOpen && (
    <CalendarPopover
      {...popoverInteractions.getFloatingProps({
        ref: popover.floating,
        style: {
          position: popover.strategy,
          top: popover.y ?? 0,
          left: popover.x ?? 0,
        },
      })}
      selectedDate={value}
      onSelectedDateChange={handleSelectedDateChange}
      minAllowedDate={min}
      maxAllowedDate={max}
    />
  );

  return (
    <InputContainer
      {...popoverInteractions.getReferenceProps({
        ...rest,
        ref: popover.reference,
        onClick() {
          if (!disabled && !isOpen) {
            setOpen(true);
          }
        },
      })}
      $disabled={disabled}
      $highlight={value && isOpen}
    >
      <InputLabel $placeholder={!value}>
        {value ? format(value, 'EEE, MMM dd, yyyy') : 'Select'}
      </InputLabel>
      <CalendarIconStyled />
      {portal ? (
        <Portal id="date-picker" enabled={isOpen}>
          {popoverElement}
        </Portal>
      ) : (
        popoverElement
      )}
    </InputContainer>
  );
};

export default DatePicker;
