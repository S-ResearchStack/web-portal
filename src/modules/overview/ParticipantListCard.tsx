import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';

import styled from 'styled-components';
import _isNumber from 'lodash/isNumber';
import _isEqual from 'lodash/isEqual';

import {
  useParticipantList,
  OverviewParticipantItem,
  participantListFetchArgsSelector,
  GetParticipantListParams,
  participantListPrevFetchArgsSelector,
} from 'src/modules/overview/participantsList.slice';
import Table, {
  ColumnOptions,
  getColumnWidthInPercents,
  RowKeyExtractor,
  SortCallback,
} from 'src/common/components/Table';
import { px } from 'src/styles';
import Indicator, { IndicatorProps } from 'src/common/components/Indicator';
import * as dt from 'src/common/utils/datetime';
import * as num from 'src/common/utils/number';
import PeriodicUpdater from 'src/common/components/PeriodicUpdater';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { PAGINATION_LIMITS, PaginationProps } from 'src/common/components/Pagination';
import { useAppSelector } from 'src/modules/store';
import {
  GetOverviewSubjectParams,
  useOverviewSubject,
} from 'src/modules/overview/overview-subject/overviewSubject.slice';
import { Path } from 'src/modules/navigation/store';
import { BASE_TABLE_BODY_HEIGHT } from 'src/common/components/Table/BaseTable';

import OverviewCard from './OverviewCard';

const ParticipantListContainer = styled(OverviewCard)`
  padding: ${px(24)};
  padding-bottom: ${px(16)};
  height: ${px(528)};

  > div:first-child {
    height: ${px(56)};
    > div {
      padding-top: 0;
      transform: translateX(${px(1)});
    }
  }
`;

const LastSyncContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LastSyncIndicator = styled(Indicator)`
  margin-right: ${px(8)};
` as typeof Indicator;

// TODO: review time breakpoints
export const getIndicatorTypeByTs = (ts: dt.Timestamp): IndicatorProps['color'] => {
  const tsDiff = dt.getTimeDiff(ts);
  if (tsDiff < dt.hour(12)) return 'success';
  if (tsDiff < dt.day()) return 'warning';
  return 'error';
};

const renderBpmOrSteps = (value?: number): React.ReactNode =>
  _isNumber(value) ? num.format(value) : '—';

const LAST_SYNC_UPDATE_INTERVAL = 1000;

const LastSync: FC<React.PropsWithChildren<object>> = ({ children }) => (
  <PeriodicUpdater interval={LAST_SYNC_UPDATE_INTERVAL}>
    {() => <LastSyncContainer>{children}</LastSyncContainer>}
  </PeriodicUpdater>
);

const defaultFetchArgs: Pick<GetParticipantListParams, 'filter' | 'sort'> = {
  filter: { page: 1, perPage: PAGINATION_LIMITS[0] },
  sort: { column: 'email', direction: 'asc' },
};

type Props = {
  subjectSection: Path;
};

const ParticipantListCard: React.FC<Props> = ({ subjectSection }) => {
  const studyId = useSelectedStudyId();
  const participantListFetchArgs = useAppSelector(participantListFetchArgsSelector);
  const participantListPrevFetchArgs = useAppSelector(participantListPrevFetchArgsSelector);

  const participantList = useParticipantList({
    fetchArgs:
      !!studyId &&
      (studyId === participantListPrevFetchArgs?.studyId && participantListFetchArgs
        ? participantListFetchArgs
        : { studyId, ...defaultFetchArgs }),
  });

  const isSortLoading = useMemo(
    () => !_isEqual(participantListFetchArgs?.sort, participantListPrevFetchArgs?.sort),
    [participantListFetchArgs?.sort, participantListPrevFetchArgs?.sort]
  );

  const isFilterLoading = useMemo(
    () => !_isEqual(participantListFetchArgs?.filter, participantListPrevFetchArgs?.filter),
    [participantListFetchArgs?.filter, participantListPrevFetchArgs?.filter]
  );

  const isStudySwitching = useMemo(
    () => !_isEqual(participantListFetchArgs?.studyId, participantListPrevFetchArgs?.studyId),
    [participantListFetchArgs?.studyId, participantListPrevFetchArgs?.studyId]
  );

  const isLoading = participantList.isLoading || isSortLoading || isFilterLoading;
  const isEmpty = !(participantList.data?.list || []).length;

  const [participantItemFetchArgs, setParticipantItemFetchArgs] =
    useState<GetOverviewSubjectParams | null>(null);

  const participantItem = useOverviewSubject({
    fetchArgs: !!participantItemFetchArgs && participantItemFetchArgs,
  });

  const getRowKey: RowKeyExtractor<OverviewParticipantItem> = useCallback((row) => row.id, []);

  const columns: ColumnOptions<OverviewParticipantItem>[] = [
    {
      dataKey: 'id',
      label: 'Participant ID',
      $width: getColumnWidthInPercents(159),
    },
    {
      dataKey: 'email',
      label: 'Email',
      $width: getColumnWidthInPercents(220),
    },
    {
      dataKey: 'avgBpm',
      label: 'Avg. HR bpm',
      $width: getColumnWidthInPercents(135),
      render: (bpm) => renderBpmOrSteps(bpm as number | undefined),
    },
    {
      dataKey: 'avgSteps',
      label: 'Avg. Steps',
      $width: getColumnWidthInPercents(135),
      render: (steps) => renderBpmOrSteps(steps as number | undefined),
    },
    {
      dataKey: 'lastSync',
      label: 'Last Synced',
      $width: getColumnWidthInPercents(120),
      render: (lastSync) => (
        <LastSync>
          <LastSyncIndicator color={getIndicatorTypeByTs(lastSync as number)} />
          {dt.getRelativeTimeByTs(lastSync as number)}
        </LastSync>
      ),
    },
    {
      dataKey: 'localTime',
      label: 'Your local time',
      $width: getColumnWidthInPercents(143),
      render: (localTime) => dt.getAbsoluteTimeByTs(localTime as number).join(' '),
    },
  ];

  const onPageChange: PaginationProps['onPageChange'] = useCallback(
    (page, perPage) => {
      if (studyId && participantListFetchArgs) {
        participantList.fetch({ ...participantListFetchArgs, filter: { page, perPage } });
      }
    },
    [studyId, participantListFetchArgs, participantList]
  );

  const onSortChange: SortCallback<OverviewParticipantItem> = useCallback(
    (sortings) => {
      const { column, direction } = sortings[0];
      if (studyId && participantListFetchArgs) {
        participantList.fetch({ ...participantListFetchArgs, sort: { column, direction } });
      }
    },
    [participantListFetchArgs, participantList, studyId]
  );

  const onSelectRow = useCallback(
    (row: OverviewParticipantItem) => {
      !participantItem.isLoading && studyId && setParticipantItemFetchArgs({ id: row.id, studyId });
    },
    [participantItem.isLoading, studyId]
  );

  const history = useHistory();

  useEffect(() => {
    if (
      !participantItem.isLoading &&
      participantItemFetchArgs &&
      participantItemFetchArgs.id === participantItem.data?.id
    ) {
      history.push(
        generatePath(subjectSection, {
          subjectId: participantItem.data.id,
        })
      );
    }
  }, [
    history,
    participantItem.data,
    participantItem.isLoading,
    participantItemFetchArgs,
    subjectSection,
  ]);

  const participantListItems = useMemo(() => {
    if (studyId !== participantListPrevFetchArgs?.studyId || !participantList.data?.list.length) {
      return [];
    }

    const list = [...participantList.data.list];

    if (participantItemFetchArgs && list.length) {
      const idx = list.findIndex((item) => item.id === participantItemFetchArgs?.id);
      if (idx) {
        list[idx] = { ...list[idx], isProcessing: true };
      }
    }

    return list;
  }, [participantItemFetchArgs, participantList.data?.list, studyId, participantListPrevFetchArgs]);

  const renderTable = () => (
    <Table
      stickyHeader
      stickyFooter
      virtual={participantListItems.length > PAGINATION_LIMITS[0]}
      columns={columns}
      rows={participantListItems}
      getRowKey={getRowKey}
      disableActions={participantItem.isLoading}
      isLoading={isFilterLoading}
      onSelectRow={onSelectRow}
      bodyHeight={BASE_TABLE_BODY_HEIGHT}
      sort={{
        sortings: [
          {
            column: participantListFetchArgs?.sort.column || defaultFetchArgs.sort.column,
            direction: participantListFetchArgs?.sort.direction || defaultFetchArgs.sort.direction,
          },
        ],
        isProcessing: isSortLoading,
        onSortChange,
      }}
      pagination={{
        pageSize: participantListFetchArgs?.filter.perPage || defaultFetchArgs.filter.perPage,
        currentPage: participantListFetchArgs?.filter.page || defaultFetchArgs.filter.page,
        totalCount: participantList.data?.total || 0,
        onPageChange,
      }}
    />
  );

  return (
    <ParticipantListContainer
      loading={(isEmpty && participantList.isLoading) || isStudySwitching}
      empty={isEmpty && !isLoading}
      title="Participant List"
      error={!participantList.isLoading && !!participantList.error}
      onReload={participantList.refetch}
    >
      {renderTable()}
    </ParticipantListContainer>
  );
};

export default React.memo(ParticipantListCard, () => true);
