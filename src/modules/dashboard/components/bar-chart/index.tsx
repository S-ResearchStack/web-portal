import React, { useEffect, useState } from 'react';

import EChart, { Data } from './EChart';
import Config from './Config';

import { BarChartConfig } from 'src/modules/api';
import type { ChartComponentProps, ConfigComponentProps } from '../../type';

const validateChart = ({ data, config }: ChartComponentProps) => {
  const barChartConfig = config as BarChartConfig;
  if (!data.columns.length) return;

  let error = 'Oops, something went wrong. Please check configuration.';
  if(!barChartConfig.value || !barChartConfig.category) return error;
  data.columns.forEach(c => {
    if (c.name === barChartConfig.value) error = '';
  });

  return error;
};

export const ChartComponent = ({ loading, data, config, renderError, onValidateChange }: ChartComponentProps) => {
  const barChartConfig = config as BarChartConfig;

  const [error, setError] = useState<string>();
  const [convertData, setConvertData] = useState<Data[]>([]);

  useEffect(() => {
    let e = validateChart({ data, config });
    if (e) {
      onValidateChange?.(e);
      setError(e);
      return;
    };

    const pieData = data.data.map(d => ({
      name: d[barChartConfig.category] as string || '',
      value: d[barChartConfig.value] as number,
    }))

    setError(undefined);
    setConvertData(pieData);
    onValidateChange?.(undefined);
  }, [data, config, setError, setConvertData])

  if (error) return renderError ? renderError(error) : null;

  return (
    <EChart
      data={convertData}
      loading={loading}
      isHorizontal={barChartConfig.isHorizontal}
    />
  )
};

export default ChartComponent;

export const ConfigComponent = ({ data, config, onChange }: ConfigComponentProps) => {
  return (
    <Config
      columns={data?.columns}
      config={config as BarChartConfig}
      onChange={onChange}
    />
  )
};
