import React, { useEffect, useState } from "react";
import type { ComposeOption } from "echarts/core";
import type { LineSeriesOption } from "echarts/charts";

import ApacheECharts from "../ApacheEChart";
import { getDataZoomOption } from "../chart.utils";

type LineOption = ComposeOption<LineSeriesOption>;
export type Data = {
  name: string;
  value: number;
};
type Props = {
  data: Data[];
  loading?: boolean;
  isSmooth?: boolean;
}
const EChart = (props: Props) => {
  const [option, setOption] = useState<LineOption>(DEFAULT_OPTIONS);

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

const DEFAULT_OPTIONS: LineOption = {
  title: {
    text: '',
  },
  tooltip: {
    trigger: 'item',
    formatter: "{b}: {c}"
  },
  series: []
};

const getOption = (params: Props): LineOption => {
  const xAxisData: string[] = [], seriesData: number[] = [];
  params.data.forEach(d => {
    xAxisData.push(d.name);
    seriesData.push(d.value);
  });

  const dataZoom = getDataZoomOption(params.data.length);

  return {
    ...DEFAULT_OPTIONS,
    dataZoom,
    xAxis: {
      type: 'category',
      data: xAxisData,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'line',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
        data: seriesData,
        smooth: params.isSmooth
      }
    ],
  };
};
