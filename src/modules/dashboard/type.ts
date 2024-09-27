import { ReactElement } from "react";
import { ChartConfigSpecific, QueryResponse } from "../api";

export type ChartComponentProps = {
  loading?: boolean;
  data: QueryResponse;
  config: Partial<ChartConfigSpecific>;
  renderError?: (error?: string) => ReactElement;
  onValidateChange?: (error?: string) => void;
};

export type ConfigComponentProps = {
  data?: QueryResponse;
  config?: Partial<ChartConfigSpecific>;
  onChange: (config: Partial<ChartConfigSpecific>) => void;
};
