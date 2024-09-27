import React, { useCallback } from 'react';

import { useChartList, useEditChart } from './chartList.slice';
import useHistoryChangeOnce from 'src/common/hooks/useHistoryChangeOnce';

import CardsView, { CardsViewLoading } from './CardView';
import ChartItem from './ChartItem';
import ServiceScreen from 'src/common/components/ServiceScreen';
import ConfirmDeleteModal from '../components/ConfirmModal';
import { useModal } from '../components/chart.utils';
import type { ChartResponse, DashboardResponse } from 'src/modules/api';

type ChartListProps = {
  studyId?: string;
  dashboard: DashboardResponse;
};

const ChartList = ({ studyId, dashboard }: ChartListProps) => {
  const { isLoading, data, error, reset, refetch } = useChartList({
    fetchArgs: !!studyId && { studyId, dashboardId: dashboard.id },
    refetchSilentlyOnMount: true,
  });
  const { isEditble, edit } = useEditChart();
  const deleteModal = useModal<string>();

  // useHistoryChangeOnce(async () => {
  //   reset();
  // }, [reset]);

  const onEditChart = (chart: ChartResponse) => {
    if (!isEditble) return;
    edit({ dashboardId: dashboard.id, chartId: chart.id });
  };
  const onDeleteChart = (chart: ChartResponse) => {
    if (!isEditble) return;
    deleteModal.open(chart.id);
  };
  const onDeleted = () => {
    refetch();
  };

  const renderChartList = useCallback(
    (chart: ChartResponse) => (
      <ChartItem
        key={chart.id}
        {...chart}
        isEditble={isEditble}
        dashboardId={dashboard.id}
        onEdit={() => onEditChart(chart)}
        onDelete={() => onDeleteChart(chart)}
      />
    ),
    [data, isLoading, onEditChart, onDeleteChart]
  );

  if (!isLoading && error) {
    return (
      <ServiceScreen
        type="error"
        title="Something went wrong. Please try again later."
        onReload={refetch}
        style={{ height: 'calc(100vh - 128px)' }}
      />
    )
  }

  if (!isLoading && !data?.length) {
    return (
      <ServiceScreen
        type="empty"
        title="Your charts will appear here after you create them."
        style={{ height: 'calc(100vh - 128px)' }}
      />
    )
  }

  return (
    <>
      <CardsView list={data || []} isLoading={isLoading} renderItem={renderChartList} />
      <ConfirmDeleteModal
        dashboardId={dashboard.id}
        chart={deleteModal.data}
        onClose={deleteModal.close}
        onDeleted={onDeleted}
      />
    </>
  );
};

export default ChartList;

export const ChartListLoading = () => <CardsViewLoading />;
