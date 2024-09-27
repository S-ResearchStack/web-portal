import React, { useEffect, useState } from 'react';

import EChart, { Data } from './EChart';
import Config from './Config';
import type { ChartComponentProps, ConfigComponentProps } from '../../type';
import { LineChartConfig } from 'src/modules/api';

const validateChart = ({ data, config }: ChartComponentProps) => {
  const lineChartConfig = config as LineChartConfig;
  if (!data.columns.length) return;

  let error = 'Oops, something went wrong. Please check configuration.';
  if(!lineChartConfig.value || !lineChartConfig.category) return error;
  data.columns.forEach(c => {
    if (c.name === lineChartConfig.value) error = '';
  });

  return error;
};

export const ChartComponent = ({ loading, data, config, renderError, onValidateChange }: ChartComponentProps) => {
  const lineChartConfig = config as LineChartConfig;

  const [error, setError] = useState<string>();
  const [convertData, setConvertData] = useState<Data[]>([]);

  useEffect(() => {
    let e = validateChart({ data, config });
    if (e) {
      onValidateChange?.(e);
      setError(e);
      return;
    };

    const lineData = data.data.map(d => ({
      name: d[lineChartConfig.category] as string || '',
      value: d[lineChartConfig.value] as number,
    }))

    setError(undefined);
    setConvertData(lineData);
    onValidateChange?.(undefined);
  }, [data, config, setError, setConvertData])

  if (error) return renderError ? renderError(error) : null;

  return (
    <EChart
      data={convertData}
      loading={loading}
      isSmooth={lineChartConfig.isSmooth}
    />
  )
};

export default ChartComponent;

export const ConfigComponent = ({ data, config, onChange }: ConfigComponentProps) => {
  return (
    <Config
      columns={data?.columns}
      config={config as LineChartConfig}
      onChange={onChange}
    />
  )
};
