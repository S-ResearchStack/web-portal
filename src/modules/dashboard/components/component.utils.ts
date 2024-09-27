import { ReactElement } from "react"
import { ChartType } from "src/modules/api";

import PieChartComponent, { ConfigComponent as PieChartConfigComponent } from "./pie-chart";
import DonutChartComponent, { ConfigComponent as DonutChartConfigComponent } from "./donut-chart";
import BarChartComponent, { ConfigComponent as BarChartConfigComponent } from "./bar-chart";
import LineChartComponent, { ConfigComponent as LineChartConfigComponent } from "./line-chart";
import TableChartComponent, { ConfigComponent as TableChartConfigComponent } from "./table-chart";
import type { ChartComponentProps, ConfigComponentProps } from "../type";;

const ChartComponent = ({ renderError }: ChartComponentProps) => {
  return renderError ? renderError('Oops, chart type is not supported. Please check configuration.') : null;
};

const charts: {
  [T in ChartType]: (props: ChartComponentProps) => ReactElement | null;
} = {
  'PIE': PieChartComponent,
  'DONUT': DonutChartComponent,
  'BAR': BarChartComponent,
  'LINE': LineChartComponent,
  'TABLE': TableChartComponent,
};

const ChartConfigComponent = (props: ConfigComponentProps) => {
  return null;
};

const configs: {
  [T in ChartType]: (props: ConfigComponentProps) => ReactElement;
} = {
  'PIE': PieChartConfigComponent,
  'DONUT': DonutChartConfigComponent,
  'BAR': BarChartConfigComponent,
  'LINE': LineChartConfigComponent,
  'TABLE': TableChartConfigComponent,
};

export const getChartComponent = (t: ChartType) => charts[t] || ChartComponent;
export const getConfigComponent = (t: ChartType) => configs[t] || ChartConfigComponent;
