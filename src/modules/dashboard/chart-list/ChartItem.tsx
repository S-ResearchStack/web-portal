import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ChartView from '../components/ChartView';
import Action from '../components/Action';
import ChartCardWithSkeleton from 'src/common/components/ChartCardWithSkeleton';
import { useChartItem } from './chartItem.slice';
import { useAutoRefresh } from '../autoRefresh.slice';
import { useEditChart } from '../chart-editor/chartEditor.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import type { ChartSource, ChartConfigBasic, ChartConfigSpecific } from 'src/modules/api';

type ChartItemProps = {
  isEditble?: boolean;
  dashboardId: string;
  id: string;
  source: ChartSource;
  configBasic: ChartConfigBasic;
  configSpecific: ChartConfigSpecific;
  onEdit: () => void;
  onDelete: () => void;
};

const ChartItem = ({ dashboardId, id, source, configBasic, configSpecific, isEditble, onEdit, onDelete }: ChartItemProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const studyId = useSelectedStudyId() || '';
  const { edit } = useEditChart();
  const { chartAutoRefreshValue } = useAutoRefresh(dashboardId, id);
  const { isLoading, data: sourceResult, error, loadData } = useChartItem(studyId);

  const onRefresh = useCallback(() => {
    if (isLoading) return;
    loadData(source);
  }, [isLoading, source, loadData]);

  useEffect(() => {
    loadData(source);
  }, [source, loadData]);

  useEffect(() => {
    const start = (ms: number) => {
      const id = setInterval(() => {
        onRefresh();
      }, ms);
      intervalRef.current = id;
    };
    const clear = () => {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    };

    if (intervalRef.current) clear();

    if (!chartAutoRefreshValue) return;

    start(chartAutoRefreshValue * 1000);

    return () => clear();
  }, [chartAutoRefreshValue, onRefresh]);

  const onUpdate = useCallback(() => {
    const chartEditorData = {
      studyId,
      dashboardId,
      id,
      source,
      configBasic,
      configSpecific,
      sourceResult
    };
    edit(chartEditorData);
  }, [studyId, id, sourceResult, edit]);

  const actionItems = useMemo(() => {
    let items = [
      {
        label: 'Refresh',
        onClick: onRefresh,
      },
    ];
    if (isEditble) {
      items = items.concat([
        {
          label: 'Edit chart',
          onClick: onUpdate,
        },
        {
          label: 'Delete chart',
          onClick: onDelete,
        },
      ]);
    }
    return items;
  }, [isEditble, onRefresh, onEdit, onUpdate, onDelete]);

  if (isLoading && !sourceResult) return <ChartCardWithSkeleton cardNumber={1} />;

  return (
    <ChartView
      error={error}
      loading={isLoading}
      sourceResult={sourceResult}
      configBasic={configBasic}
      configSpecific={configSpecific}
      action={<Action loading={isLoading} items={actionItems} />}
      onReload={onRefresh}
    />
  );
};

export default ChartItem;
