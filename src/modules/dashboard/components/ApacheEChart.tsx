import React, { useRef, useEffect } from "react";
import _debounce from 'lodash/debounce';
import { CanvasRenderer } from "echarts/renderers";
import { init, getInstanceByDom, use } from "echarts/core";
import { PieChart, BarChart, LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GraphicComponent, GridComponent, DataZoomComponent } from "echarts/components";
import type { CSSProperties, ReactElement } from "react";
import type { ECharts, ComposeOption, SetOptionOpts } from "echarts/core";
import type { PieSeriesOption, BarSeriesOption, LineSeriesOption } from "echarts/charts";
import type { TitleComponentOption } from "echarts/components";

import { px } from 'src/styles';

const size = { width: "100%", height: "100%", minWidth: px(252), minHeight: px(252) };

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GraphicComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
]);

type EChartsOption = ComposeOption<
  | TitleComponentOption
  | PieSeriesOption
  | BarSeriesOption
  | LineSeriesOption
>;

export interface ApacheEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
}

function ApacheECharts({
  option,
  style,
  settings,
  loading,
  theme,
}: ApacheEChartsProps): ReactElement {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    };

    const resizeChart = _debounce(() => {
      chart?.resize();
    }, 120);
    window.addEventListener("resize", resizeChart);

    return () => {
      chart?.dispose();
      window.removeEventListener("resize", resizeChart);
    };
  }, [theme]);

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart?.setOption(getOption(option), settings);
    };
  }, [option, settings, theme]);

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      loading === true ? chart?.showLoading() : chart?.hideLoading();
    };
  }, [loading, theme]);

  return <div ref={chartRef} style={{ ...size, ...style }} />;
};

export default ApacheECharts;

const DEFAULT_OPTIONS: EChartsOption = {
  legend: {
    bottom: '0',
    left: 'center',
  },
};

const getOption = (o: EChartsOption): EChartsOption => ({
  ...DEFAULT_OPTIONS,
  ...o,
});
