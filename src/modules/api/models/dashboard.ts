type Dashboard = {
  title: string;
};

export type AddDashboardRequest = Dashboard;
export type AddDashboardResponse = {
  id: string;
};

export type UpdateDashboardRequest = Partial<Dashboard>;
export type UpdateDashboardResponse = void;

export type DashboardResponse = Dashboard & AddDashboardResponse;
export type DashboardListResponse = DashboardResponse[];

export type ChartSource = {
  database: string;
  query: string;
  transfrom?: Record<string, unknown>;
};

export type ChartType = 'PIE' | 'DONUT' | 'BAR' | 'LINE' | 'TABLE';
export type ChartConfigBasic = {
  name: string;
  type: ChartType;
};
export type PieChartConfig = {
  category: string;
  value: string;
  color?: string;
};
export type DonutChartConfig = {
  category: string;
  value: string;
  color?: string;
};
export type BarChartConfig = {
  category: string;
  value: string;
  isHorizontal?: boolean;
};
export type LineChartConfig = {
  category: string;
  value: string;
  isSmooth?: boolean;
};
type TableChartColumn = {
  name: string;
  alias?: string;
};
export type TableChartConfig = {
  columns: TableChartColumn[];
};

export type ChartConfigSpecific = PieChartConfig | DonutChartConfig | BarChartConfig | LineChartConfig | TableChartConfig;

type Chart = {
  source: ChartSource,
  configBasic: ChartConfigBasic;
  configSpecific: ChartConfigSpecific;
};

export type AddChartRequest = Chart;
export type AddChartResponse = {
  id: string;
};

export type UpdateChartRequest = Partial<Chart>;
export type UpdateChartResponse = void;

export type ChartResponse = Chart & AddChartResponse;
export type ChartListResponse = ChartResponse[];

export type QueryResponseColumnType = 'string' | 'datetime' | 'number' | 'boolean' | 'unknown';
export type QueryResponseColumn = {
  name: string;
  type: QueryResponseColumnType;
};
type DataObject = Record<string, string | number | boolean | null | undefined>;
export type QueryResponse = {
  columns: QueryResponseColumn[];
  data: DataObject[];
};
export type DataQueryRequest = {
  query: string;
};
export type DataQueryResponse = {
  columns: Record<string, string>;
  data: DataObject[];
};
export type QueryErrorResponse = {
  message: string;
  details?: string;
};
export interface GetListTableRequestParam {
  database: string;
};

type StudyId = string;
type UserId = string;
type ChartAutoRefresh = Record<string, boolean>;
export type StudyAutoRefreshValue = {
  on: boolean;
  time: number;
  charts: ChartAutoRefresh
};
type StudyAutoRefresh = Record<StudyId, StudyAutoRefreshValue>;
export type UserAutoRefreshValue = StudyAutoRefresh;
type UserAutoRefresh = Record<UserId, UserAutoRefreshValue>;
export type AutoRefresh = UserAutoRefresh;

export type UserActive = Record<UserId, number>;
