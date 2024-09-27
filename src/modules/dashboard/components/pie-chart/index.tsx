import React, { useEffect, useState } from 'react';

import EChart, { Data } from './EChart';
import Config from './Config';

import { getColorValue } from '../chart.utils';
import { PieChartConfig } from 'src/modules/api';
import type { ChartComponentProps, ConfigComponentProps } from '../../type';

const validateChart = ({ data, config }: ChartComponentProps) => {
  const pieChartConfig = config as PieChartConfig;
  if (!data.columns.length) return;

  let error = 'Oops, something went wrong. Please check configuration.';
  if(!pieChartConfig.value || !pieChartConfig.category) return error;
  data.columns.forEach(c => {
    if (c.name === pieChartConfig.value) error = '';
  });

  return error;
};

export const ChartComponent = ({ data, config, renderError, onValidateChange }: ChartComponentProps) => {
  const pieChartConfig = config as PieChartConfig;

  const [error, setError] = useState<string>();
  const [color, setColor] = useState<string[]>();
  const [convertData, setConvertData] = useState<Data[]>([]);

  useEffect(() => {
    let e = validateChart({ data, config });
    if (e) {
      onValidateChange?.(e);
      setError(e);
      return;
    };

    const pieData = data.data.map(d => ({
      name: d[pieChartConfig.category] as string,
      value: d[pieChartConfig.value] as number,
    }));
    const pieColor = getColorValue(pieChartConfig.color);

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
    />
  )
};

export default ChartComponent;

export const ConfigComponent = ({ data, config, onChange }: ConfigComponentProps) => {
  return (
    <Config
      columns={data?.columns}
      config={config as PieChartConfig}
      onChange={onChange}
    />
  )
};
