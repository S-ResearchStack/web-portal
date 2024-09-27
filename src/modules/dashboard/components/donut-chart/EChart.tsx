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
  total?: number;
  color?: string[];
}
const EChart = (props: Props) => {
  const [option, setOption] = useState<PieOption>(DEFAULT_OPTIONS);

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
      radius: ['50%', '75%'],
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
  ],
  graphic: {
    elements: [
      {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: !params.total ? '' : `Total: ${params.total}`,
        }
      }
    ]
  },
});
