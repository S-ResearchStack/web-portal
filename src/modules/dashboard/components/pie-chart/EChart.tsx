import React, { useEffect, useState } from "react";
import type { ComposeOption } from "echarts/core";
import type { PieSeriesOption } from "echarts/charts";

import ApacheECharts from "../ApacheEChart";

type PieOption = ComposeOption<PieSeriesOption>;
export type Data = {
  name: string;
  value: number;
};
type Props = {
  data: Data[];
  color?: string[];
}
const EChart = ({ data, color }: Props) => {
  const [option, setOption] = useState<PieOption>(DEFAULT_OPTIONS);

  useEffect(() => {
    const o = getOption({ data, color });
    setOption(o)
  }, [data, color, setOption]);

  return (
    <ApacheECharts
      option={option}
    />
  )
}

export default EChart;

const DEFAULT_OPTIONS: PieOption = {
  title: {
    text: '',
  },
  tooltip: {
    trigger: 'item',
    formatter: "{b}: {c} ({d}%)"
  },
  series: []
};

const getOption = (params: Props): PieOption => ({
  ...DEFAULT_OPTIONS,
  color: params.color,
  series: [
    {
      name: '',
      type: 'pie',
      radius: '75%',
      label: {
        position: 'inside',
        formatter: '{c}',
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: '#ffffff',
      },
      data: params.data,
    }
  ]
});
