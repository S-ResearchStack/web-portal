import React, { useEffect, useState } from 'react';

import EChart, { Data } from './EChart';
import Config from './Config';

import { getColorValue } from '../chart.utils';
import { DonutChartConfig } from 'src/modules/api';
import type { ChartComponentProps, ConfigComponentProps } from '../../type';

const validateChart = ({ data, config }: ChartComponentProps) => {
  const pieChartConfig = config as DonutChartConfig;
  if (!data.columns.length) return;

  let error = 'Oops, something went wrong. Please check configuration.';
  if(!pieChartConfig.value || !pieChartConfig.category) return error;
  data.columns.forEach(c => {
    if (c.name === pieChartConfig.value) error = '';
  });

  return error;
};

export const ChartComponent = ({ data, config, renderError, onValidateChange }: ChartComponentProps) => {
  const pieChartConfig = config as DonutChartConfig;

  const [error, setError] = useState<string>();
  const [color, setColor] = useState<string[]>();
  const [total, setTotal] = useState<number>();
  const [convertData, setConvertData] = useState<Data[]>([]);

  useEffect(() => {
    let e = validateChart({ data, config });
    if (e) {
      onValidateChange?.(e);
      setError(e);
      return;
    };

    let pieData: { name: string, value: number }[] = [], count = 0;
    data.data.forEach(d => {
      const value = d[pieChartConfig.value] as number;
      count += value
      pieData.push({ value, name: d[pieChartConfig.category] as string });
    });
    const pieColor = getColorValue(pieChartConfig.color);

    setTotal(count);
    setColor(pieColor);
    setError(undefined);
    setConvertData(pieData);
    onValidateChange?.(undefined);
  }, [data, config, setError, setConvertData])

  if (error) return renderError ? renderError(error) : null;

  return (
    <EChart
      data={convertData}
      color={color}
      total={total}
    />
  )
};

export default ChartComponent;

export const ConfigComponent = ({ data, config, onChange }: ConfigComponentProps) => {
  return (
    <Config
      columns={data?.columns}
      config={config as DonutChartConfig}
      onChange={onChange}
    />
  )
};
