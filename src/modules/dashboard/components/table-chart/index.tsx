import React, { useEffect, useState } from 'react';
import { ChartComponentProps, ConfigComponentProps } from '../../type';
import { TableChartConfig } from 'src/modules/api';
import Chart from './Chart';
import Config from './Config';

const validateChart = ({ data, config }: ChartComponentProps) => {
  const tableChartConfig = config as TableChartConfig;
  if (!data.columns.length) return;

  let error = 'Oops, something went wrong. Please check configuration.';
  if (!!tableChartConfig?.columns?.length) error = '';

  return error;
};

export const ChartComponent = ({
  loading,
  data,
  config,
  renderError,
  onValidateChange,
}: ChartComponentProps) => {
  const tableChartConfig = config as TableChartConfig;

  const [error, setError] = useState<string>();

  useEffect(() => {
    let e = validateChart({ data, config });
    if (e) {
      onValidateChange?.(e);
      setError(e);
      return;
    }

    setError(undefined);
    onValidateChange?.(undefined);
  }, [data, config, setError]);

  if (error) return renderError ? renderError(error) : null;

  return <Chart rows={data.data} columns={tableChartConfig} />;
};

export default ChartComponent;

export const ConfigComponent = ({ data, config, onChange }: ConfigComponentProps) => {
  return <Config columns={data?.columns} config={config as TableChartConfig} onChange={onChange} />;
};
