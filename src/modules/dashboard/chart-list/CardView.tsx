import React, { useMemo, useState } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import styled from 'styled-components';
import _uniqueId from 'lodash/uniqueId';
import _range from 'lodash/range';

import { px } from 'src/styles';
import SimpleGrid, {
  SimpleGridSchema,
  getValuesByMatchedDevice,
  createEmptyGridSchema,
} from 'src/common/components/SimpleGrid';
import ChartCardWithSkeleton from 'src/common/components/ChartCardWithSkeleton';
import { ChartListResponse, ChartResponse } from 'src/modules/api';

const COLUMN_DESKTOP = 2;
const COLUMN_LAPTOP = 1;
const COLUMN_TABLET = 1;
const columns = { tablet: COLUMN_TABLET, laptop: COLUMN_LAPTOP, desktop: COLUMN_DESKTOP };

const CardsGridContainer = styled.div`
  margin-bottom: ${px(16)};
`;

interface CardsViewProps<T> extends React.PropsWithChildren {
  list: ChartListResponse;
  isLoading?: boolean;
  renderItem: (item: ChartResponse) => React.ReactElement;
}

const CardsView = <T,>({ list, isLoading, renderItem }: CardsViewProps<T>) => {
  return (
    <CardsGridContainer data-testid='chart-list-container'>
      <SimpleGrid columns={columns} verticalGap>
        {isLoading ? (
          <CardsViewLoading />
        ) : (
          <TransitionGroup component={null}>{list.map((card) => renderItem(card))}</TransitionGroup>
        )}
      </SimpleGrid>
    </CardsGridContainer>
  );
};

export default CardsView;

export const CardsViewLoading = () => {
  const [grid, setGrid] = useState<SimpleGridSchema>(createEmptyGridSchema());

  const cellsPerRow = getValuesByMatchedDevice(columns, grid.matchedDevice);
  const cardNumber = 2 * cellsPerRow;

  return (
    <CardsGridContainer data-testid='chart-list-container'>
      <SimpleGrid columns={columns} onChange={setGrid} verticalGap>
        <ChartCardWithSkeleton cardNumber={cardNumber} />
      </SimpleGrid>
    </CardsGridContainer>
  );
};
