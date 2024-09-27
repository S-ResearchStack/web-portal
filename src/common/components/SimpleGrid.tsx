import React, { FC, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import useEvent from 'react-use/lib/useEvent';
import styled from 'styled-components';
import _merge from 'lodash/merge';

import { px } from 'src/styles';

const DESKTOP_GRID_GAP = 24;
const LAPTOP_GRID_GAP = 16;
const TABLET_GRID_GAP = 16;

const DESKTOP_HORIZONTAL_MARGIN = 48;
const LAPTOP_HORIZONTAL_MARGIN = 40;
const TABLET_HORIZONTAL_MARGIN = 28;

export const DESKTOP_WIDTH_BREAKPOINT = 1440;
export const LAPTOP_WIDTH_BREAKPOINT = 1024;

const DESKTOP_COLUMNS_COUNT = 12;
const LAPTOP_COLUMNS_COUNT = 12;
const TABLET_COLUMNS_COUNT = 10;

const DESKTOP_COLUMN_WIDTH = 68;
const LAPTOP_COLUMN_WIDTH = 48;
const TABLET_COLUMN_WIDTH = 48;

export const desktopMq = window.matchMedia(`(min-width: ${px(DESKTOP_WIDTH_BREAKPOINT)})`);
export const laptopMq = window.matchMedia(`(min-width: ${px(LAPTOP_WIDTH_BREAKPOINT)})`);

export interface DeviceScreenMatches<T = boolean> {
  tablet: T;
  laptop: T;
  desktop: T;
}

const matchDeviceScreen = (): DeviceScreenMatches => ({
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
  marginHorizontal: number;
}

export const createEmptyGridSchema = (schema?: Partial<SimpleGridSchema>): SimpleGridSchema => ({
  matchedDevice: matchDeviceScreen(),
  gridGap: 0,
  columnsCount: 0,
  columnWidth: 0,
  gridWidth: 0,
  marginHorizontal: 0,
  ...schema,
});

const calculateSimpleGrid = (
  matchedDevice: DeviceScreenMatches,
  customSchema?: Partial<DeviceScreenMatches<Partial<SimpleGridSchema>>>
): SimpleGridSchema => {
  const schema = createEmptyGridSchema({ matchedDevice });

  if (matchedDevice.desktop) {
    schema.gridGap = DESKTOP_GRID_GAP;
    schema.columnsCount = DESKTOP_COLUMNS_COUNT;
    schema.columnWidth = DESKTOP_COLUMN_WIDTH;
    schema.marginHorizontal = DESKTOP_HORIZONTAL_MARGIN;
    _merge(schema, customSchema?.desktop);
  } else if (matchedDevice.laptop) {
    schema.gridGap = LAPTOP_GRID_GAP;
    schema.columnsCount = LAPTOP_COLUMNS_COUNT;
    schema.columnWidth = LAPTOP_COLUMN_WIDTH;
    schema.marginHorizontal = LAPTOP_HORIZONTAL_MARGIN;
    _merge(schema, customSchema?.laptop);
  } else {
    schema.gridGap = TABLET_GRID_GAP;
    schema.columnsCount = TABLET_COLUMNS_COUNT;
    schema.columnWidth = TABLET_COLUMN_WIDTH;
    schema.marginHorizontal = TABLET_HORIZONTAL_MARGIN;
    _merge(schema, customSchema?.tablet);
  }

  schema.gridWidth = (schema.columnWidth + schema.gridGap) * schema.columnsCount - schema.gridGap;

  return schema;
};

export const getValuesByMatchedDevice = <T,>(
  values: DeviceScreenMatches<T>,
  matchedDevices: DeviceScreenMatches
) => {
  if (matchedDevices.desktop) return values.desktop;
  if (matchedDevices.laptop) return values.laptop;
  return values.tablet;
};

type ColumnsOptionValue = DeviceScreenMatches<number>;

interface ColumnsOption {
  columns?: ColumnsOptionValue;
}

interface SimpleGridContainerProps extends Required<ColumnsOption>, React.PropsWithChildren {
  $width: number;
  $gap: number;
  $minMargin: number;
  $verticalGap?: boolean;
}

const SimpleGridContainer = styled.div<SimpleGridContainerProps>`
  display: grid;
  column-gap: ${(p) => px(p.$gap)};
  row-gap: ${({ $verticalGap, $gap }) => ($verticalGap ? px($gap) : undefined)};
  grid-template-columns: repeat(${({ columns }) => columns.tablet}, 1fr);

  /* padding is used instead margin to keep margin: auto behaviour */
  /* it is required on small screens to keep space between content and edge of screen */
  width: ${(p) => px(p.$width + p.$minMargin * 2)};
  max-width: ${(p) => px(p.$width + p.$minMargin * 2)};
  margin: 0 auto;
  padding: 0 ${({ $minMargin }) => px($minMargin) || 0};

  @media screen and ${laptopMq.media} {
    grid-template-columns: repeat(${({ columns }) => columns.laptop}, 1fr);
  }

  @media screen and ${desktopMq.media} {
    grid-template-columns: repeat(${({ columns }) => columns.desktop}, 1fr);
  }

  > * {
    /* prevents child items from overflowing */
    /* alternatively minmax(0, 1fr) can be used instead of 1fr */
    min-width: 0;
  }
`;

interface UseSimpleGridParams {
  customSchema?: Partial<DeviceScreenMatches<Partial<SimpleGridSchema>>>;
}

const useSimpleGrid = (params?: UseSimpleGridParams): SimpleGridSchema => {
  const deviceMatches = useMatchDeviceScreen();
  const [schema, setSchema] = useState(() =>
    calculateSimpleGrid(deviceMatches, params?.customSchema)
  );

  useLayoutEffect(() => {
    setSchema(calculateSimpleGrid(deviceMatches, params?.customSchema));
  }, [params?.customSchema, deviceMatches]);

  return schema;
};

interface SimpleGridProps
  extends React.PropsWithChildren<ColumnsOption>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  onChange?: (options: SimpleGridSchema) => void;
  fullScreen?: boolean;
  verticalGap?: boolean;
  customSchema?: UseSimpleGridParams['customSchema'];
}

const DEFAULT_COLUMNS_OPTION: ColumnsOptionValue = {
  tablet: 1,
  laptop: 1,
  desktop: 1,
};

const SimpleGridCellContainer = styled.div<{ columns: [number, number], rows?: [number, number] }>`
  grid-column: ${(p) => `${p.columns[0]} / span ${p.columns[1] - p.columns[0] + 1}`};
  grid-row: ${(p) => p.rows ? `${p.rows[0]} / span ${p.rows[1] - p.rows[0]}` :  `1 / span 1`};
`;

type SimpleGridCellProps = {
  columns: DeviceScreenMatches<[number, number]>;
  rows?: DeviceScreenMatches<[number, number]>;
  customSchema?: UseSimpleGridParams['customSchema'];
} & React.PropsWithChildren;

export const SimpleGridCell = ({ columns, rows, children, customSchema }: SimpleGridCellProps) => {
  const gridOptions = useSimpleGrid({ customSchema });

  return (
    <SimpleGridCellContainer
      role="container"
      columns={getValuesByMatchedDevice(columns, gridOptions.matchedDevice)}
      rows={rows && getValuesByMatchedDevice(rows, gridOptions.matchedDevice)}
    >
      {children}
    </SimpleGridCellContainer>
  );
};
const SimpleGrid: FC<SimpleGridProps> = ({
  columns,
  onChange,
  fullScreen,
  verticalGap,
  customSchema,
  ...props
}) => {
  const gridOptions = useSimpleGrid({ customSchema });
  const columnsOption = {
    ...DEFAULT_COLUMNS_OPTION,
    ...columns,
  };

  useEffect(() => {
    onChange?.(gridOptions);
  }, [onChange, gridOptions]);

  return (
    <SimpleGridContainer role='container'
      {...props}
      $minMargin={fullScreen ? gridOptions.marginHorizontal : 0}
      $width={gridOptions.gridWidth}
      $gap={gridOptions.gridGap}
      $verticalGap={verticalGap}
      columns={columnsOption}
    />
  );
};

export default SimpleGrid;
