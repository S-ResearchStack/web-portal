import React from 'react';

import ChartCard from './ChartCard';
import ErrorText from './ErrorText';
import { getChartComponent } from './component.utils';
import type {
  QueryResponse,
  QueryErrorResponse,
  ChartConfigBasic,
  ChartConfigSpecific,
} from 'src/modules/api';

type ChartViewProps = {
  loading?: boolean;
  error?: QueryErrorResponse;
  sourceResult?: QueryResponse;
  configBasic?: Partial<ChartConfigBasic>;
  configSpecific?: Partial<ChartConfigSpecific>;
  action?: React.ReactNode;
  onReload?: () => void;
  onValidateChange?: (error?: string) => void;
};
const ChartView = ({
  loading,
  error,
  sourceResult,
  configBasic,
  configSpecific,
  action,
  onReload,
  onValidateChange
}: ChartViewProps) => {
  if (!configBasic || !configBasic.type || !configSpecific) return null;
  const Component = getChartComponent(configBasic.type);

  if (!!error)
    return (
      <ChartViewError
        error={error}
        loading={loading}
        action={action}
        configBasic={configBasic}
        onReload={onReload}
      />
    );
  if (!sourceResult)
    return (
      <ChartViewInitialize
        action={action}
        configBasic={configBasic}
        configSpecific={configSpecific}
      />
    );

  return (
    <ChartCard title={configBasic.name} cardAction={action} loading={loading}>
      <Component
        data={sourceResult}
        config={configSpecific}
        renderError={(e) => <ErrorText title="Error" description={e} />}
        onValidateChange={onValidateChange}
      />
    </ChartCard>
  );
};

export default ChartView;

type ChartViewErrorProps = {
  loading?: boolean;
  action?: React.ReactNode;
  error: QueryErrorResponse;
  configBasic: Partial<ChartConfigBasic>;
  onReload?: () => void;
};
const ChartViewError = ({ loading, action, error, configBasic }: ChartViewErrorProps) => {
  return (
    <ChartCard title={configBasic.name} cardAction={action} loading={loading}>
      <ErrorText title={error.message} description={error.details} />
    </ChartCard>
  );
};

type ChartViewLoadingProps = {
  action?: React.ReactNode;
  configBasic: Partial<ChartConfigBasic>;
  configSpecific: Partial<ChartConfigSpecific>;
};
const ChartViewInitialize = ({ action, configBasic, configSpecific }: ChartViewLoadingProps) => {
  if (!configBasic || !configBasic.type || !configSpecific) return null;

  const Component = getChartComponent(configBasic.type);
  const sourceResult = { columns: [], data: [] };
  return (
    <ChartCard title={configBasic.name} cardAction={action}>
      <Component loading={true} data={sourceResult} config={configSpecific} />
    </ChartCard>
  );
};
