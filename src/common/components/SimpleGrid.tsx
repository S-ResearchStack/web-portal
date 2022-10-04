import React, { FC, useCallback, useEffect, useState } from 'react';
import useEvent from 'react-use/lib/useEvent';
import styled from 'styled-components';

import { px } from 'src/styles';

export const GRID_GAP = 24;

export const DESKTOP_WIDTH_BREAKPOINT = 1440;
export const LAPTOP_WIDTH_BREAKPOINT = 1024;

export const DESKTOP_COLUMNS_COUNT = 12;
export const LAPTOP_COLUMNS_COUNT = 12;
export const TABLET_COLUMNS_COUNT = 8;

export const DESKTOP_COLUMN_WIDTH = 68;
export const LAPTOP_COLUMN_WIDTH = 48;
export const TABLET_COLUMN_WIDTH = 52;

export const desktopMq = window.matchMedia(`(min-width: ${px(DESKTOP_WIDTH_BREAKPOINT)})`);
export const laptopMq = window.matchMedia(`(min-width: ${px(LAPTOP_WIDTH_BREAKPOINT)})`);

export interface DeviceScreenMatches<T = boolean> {
  tablet: T;
  laptop: T;
  desktop: T;
}

export const matchDeviceScreen = (): DeviceScreenMatches => ({
  tablet: !desktopMq.matches && !laptopMq.matches,
  laptop: !desktopMq.matches && laptopMq.matches,
  desktop: desktopMq.matches,
});

export const useMatchDeviceScreen = (): DeviceScreenMatches => {
  const [matches, setMatches] = useState<DeviceScreenMatches>(matchDeviceScreen());

  const handleMqChange = useCallback(() => setMatches(matchDeviceScreen()), []);

  useEvent('change', handleMqChange, desktopMq);
  useEvent('change', handleMqChange, laptopMq);

  return matches;
};

export interface SimpleGridSchema {
  columnsCount: number;
  columnWidth: number;
  gridGap: number;
  gridWidth: number;
  matchedDevice: DeviceScreenMatches;
}

export const calculateSimpleGrid = (matchedDevice: DeviceScreenMatches): SimpleGridSchema => {
  const result: SimpleGridSchema = {
    matchedDevice,
    gridGap: GRID_GAP,
    columnsCount: 0,
    columnWidth: 0,
    gridWidth: 0,
  };

  if (matchedDevice.desktop) {
    result.columnsCount = DESKTOP_COLUMNS_COUNT;
    result.columnWidth = DESKTOP_COLUMN_WIDTH;
  } else if (matchedDevice.laptop) {
    result.columnsCount = LAPTOP_COLUMNS_COUNT;
    result.columnWidth = LAPTOP_COLUMN_WIDTH;
  } else {
    result.columnsCount = TABLET_COLUMNS_COUNT;
    result.columnWidth = TABLET_COLUMN_WIDTH;
  }

  result.gridWidth = (result.columnWidth + GRID_GAP) * result.columnsCount - GRID_GAP;

  return result;
};

export const getValuesByMatchedDevice = <T,>(
  values: DeviceScreenMatches<T>,
  matchedDevices: DeviceScreenMatches
) => {
  if (matchedDevices.desktop) return values.desktop;
  if (matchedDevices.laptop) return values.laptop;
  return values.tablet;
};

export type ColumnsOptionValue = DeviceScreenMatches<number>;

export interface ColumnsOption {
  columns?: ColumnsOptionValue;
}

export interface SimpleGridContainerProps
  extends Required<ColumnsOption>,
    React.PropsWithChildren<unknown> {
  $width: number;
  $minMargin: number;
  $verticalGap?: boolean;
}

export const SimpleGridContainer = styled.div<SimpleGridContainerProps>`
  display: grid;
  column-gap: ${px(GRID_GAP)};
  row-gap: ${({ $verticalGap }) => ($verticalGap ? px(GRID_GAP) : undefined)};
  grid-template-columns: repeat(${({ columns }) => columns.tablet}, 1fr);

  /* padding is used instead margin to keep margin: auto behaviour */
  /* it is required on small screens to keep space between content and edge of screen */
  width: ${({ $width, $minMargin }) => px($width + $minMargin * 2)};
  margin: 0 auto;
  padding: 0 ${({ $minMargin }) => px($minMargin) || 0};

  @media ${laptopMq.media} {
    grid-template-columns: repeat(${({ columns }) => columns.laptop}, 1fr);
  }

  @media ${desktopMq.media} {
    grid-template-columns: repeat(${({ columns }) => columns.desktop}, 1fr);
  }

  > * {
    /* prevents child items from overflowing */
    /* alternatively minmax(0, 1fr) can be used instead of 1fr */
    min-width: 0;
  }
`;

export const useSimpleGrid = (): SimpleGridSchema => {
  const deviceMatches = useMatchDeviceScreen();
  const [schema, setSchema] = useState(() => calculateSimpleGrid(deviceMatches));

  useEffect(() => {
    setSchema(calculateSimpleGrid(deviceMatches));
  }, [deviceMatches]);

  return schema;
};

export interface SimpleGridProps
  extends React.PropsWithChildren<ColumnsOption>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  onChange?: (options: SimpleGridSchema) => void;
  fullScreen?: boolean;
  verticalGap?: boolean;
}

const DEFAULT_COLUMNS_OPTION: ColumnsOptionValue = {
  tablet: 1,
  laptop: 1,
  desktop: 1,
};

const SimpleGrid: FC<SimpleGridProps> = ({
  columns,
  onChange,
  fullScreen,
  verticalGap,
  ...props
}) => {
  const gridOptions = useSimpleGrid();
  const columnsOption = {
    ...DEFAULT_COLUMNS_OPTION,
    ...columns,
  };

  useEffect(() => {
    onChange?.(gridOptions);
  }, [onChange, gridOptions]);

  return (
    <SimpleGridContainer
      {...props}
      $minMargin={fullScreen ? 24 : 0}
      $width={gridOptions.gridWidth}
      $verticalGap={verticalGap}
      columns={columnsOption}
    />
  );
};

export default SimpleGrid;
