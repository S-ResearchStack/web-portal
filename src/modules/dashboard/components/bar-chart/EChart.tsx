import React, { useEffect, useState } from "react";
import type { ComposeOption } from "echarts/core";
import type { BarSeriesOption } from "echarts/charts";

import ApacheECharts from "../ApacheEChart";
import { getDataZoomOption } from "../chart.utils";

type BarOption = ComposeOption<BarSeriesOption>;
export type Data = {
  name: string;
  value: number;
};
type Props = {
  data: Data[];
  loading?: boolean;
  isHorizontal?: boolean;
}
const EChart = (props: Props) => {
  const [option, setOption] = useState<BarOption>(DEFAULT_OPTIONS);

  useEffect(() => {
    const o = getOption(props);
    setOption(o)
  }, [props, setOption]);

  return (
    <ApacheECharts
      option={option}
    />
  )
}

export default EChart;

const DEFAULT_OPTIONS: BarOption = {
  title: {
    text: '',
  },
  tooltip: {
    trigger: 'item',
    formatter: "{b}: {c}"
  },
  series: []
};

const getOption = (params: Props): BarOption => {
  const xAxisData: string[] = [], seriesData: number[] = [];
  params.data.forEach(d => {
    xAxisData.push(d.name);
    seriesData.push(d.value);
  });

  const dataZoom = getDataZoomOption(params.data.length);

  if (!params.isHorizontal) {
    return {
      ...DEFAULT_OPTIONS,
      dataZoom,
      xAxis: {
        type: 'category',
        data: xAxisData,
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        type: 'bar',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
        data: seriesData,
      }],
    };
  };
  return {
    ...DEFAULT_OPTIONS,
    grid: { containLabel: true },
    yAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: { interval: 0, rotate: -45 },
    },
    xAxis: {
      type: 'value'
    },
    series: [{
      type: 'bar',
      label: {
        show: true,
        position: 'inside',
        formatter: '{c}',
      },
      data: seriesData,
    }],
  };
};
