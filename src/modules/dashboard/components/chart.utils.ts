import { useCallback, useState } from "react";
import { ChartEditorData } from "../chart-editor/chartEditor.slice";
import type { ChartConfigBasic, ChartSource } from "src/modules/api";

const defaultColor = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
const colors: Record<string, string[]> = {
  macarons: [
    "#2ec7c9",
    "#b6a2de",
    "#5ab1ef",
    "#ffb980",
    "#d87a80",
    "#8d98b3",
    "#e5cf0d",
    "#97b552",
    "#95706d",
    "#dc69aa",
    "#07a2a4",
    "#9a7fd1",
    "#588dd5",
    "#f5994e",
    "#c05050",
    "#59678c",
    "#c9ab00",
    "#7eb00a",
    "#6f5553",
    "#c14089"
  ],
  infographic: [
    "#c1232b",
    "#27727b",
    "#fcce10",
    "#e87c25",
    "#b5c334",
    "#fe8463",
    "#9bca63",
    "#fad860",
    "#f3a43b",
    "#60c0dd",
    "#d7504b",
    "#c6e579",
    "#f4e001",
    "#f0805a",
    "#26c0c0"
  ],
  roma: [
    "#e01f54",
    "#001852",
    "#f5e8c8",
    "#b8d2c7",
    "#c6b38e",
    "#a4d8c2",
    "#f3d999",
    "#d3758f",
    "#dcc392",
    "#2e4783",
    "#82b6e9",
    "#ff6347",
    "#a092f1",
    "#0a915d",
    "#eaf889",
    "#6699FF",
    "#ff6666",
    "#3cb371",
    "#d5b158",
    "#38b6b6"
  ],
  vintage: [
    "#d87c7c",
    "#919e8b",
    "#d7ab82",
    "#6e7074",
    "#61a0a8",
    "#efa18d",
    "#787464",
    "#cc7e63",
    "#724e58",
    "#4b565b",
    "#516b91",
    "#59c4e6",
    "#edafda",
    "#93b7e3",
    "#a5e7f0",
    "#cbb0e3",
    "#3fb1e3",
    "#6be6c1",
    "#626c91",
    "#a0a7e6",
    "#c4ebad",
    "#96dee8"
  ],
  wonderland: [
    "#4ea397",
    "#22c3aa",
    "#7bd9a5",
    "#d0648a",
    "#f58db2",
    "#f2b3c9",
    "#c12e34",
    "#e6b600",
    "#0098d9",
    "#2b821d",
    "#005eaa",
    "#339ca8",
    "#cda819",
    "#32a487",
    "#893448",
    "#d95850",
    "#eb8146",
    "#ffb248",
    "#f2d643",
    "#ebdba4"
  ],
};

export const getColors = () => {
  return colors;
};

export const getColorType = () => {
  return Object.keys(colors);
};

export const getColorValue = (type?: string) => {
  if (!type) return defaultColor;
  return colors[type] || defaultColor;
};

export const convertConfigSpecificWhenBasicConfigChange = (configBasic: Partial<ChartConfigBasic>, data: ChartEditorData) => {
  if (configBasic.type === data.configBasic?.type) return data.configSpecific;
  if ((configBasic.type === 'PIE' || configBasic.type === 'DONUT') && (data.configBasic?.type === 'PIE' || data.configBasic?.type === 'DONUT')) {
    return data.configSpecific;
  };

  if (configBasic.type === 'TABLE') {
    return {};
  };

  const baseConfig = data.configSpecific as { category: string, value: string };

  if (configBasic.type === 'PIE' || configBasic.type === 'DONUT') {
    return {
      category: baseConfig.category,
      value: baseConfig.value,
      color: ''
    };
  };
  if (configBasic.type === 'BAR') {
    return {
      category: baseConfig.category,
      value: baseConfig.value,
      isHorizontal: false
    };
  };
  if (configBasic.type === 'LINE') {
    return {
      category: baseConfig.category,
      value: baseConfig.value,
      isSmooth: false
    };
  };
};

export const convertConfigSpecificWhenSourceChange = (source: ChartSource, data: ChartEditorData) => {
  if (source.database !== data.source?.database || source.query !== data.source.query) return {};
  return data.configSpecific;
};

export const useModal = <T>() => {
  const [state, setState] = useState<T | undefined>();
  return {
    data: state,
    open: setState,
    close: useCallback(() => setState(undefined), []),
  };
};

const ZOOM_LENGTH = 10;
const ZOOM_START = 0;
const ZOOM_END = 10;
export const getDataZoomOption = (length: number) => {
  if (length <= ZOOM_LENGTH) return [];
  return [
    {
      type: 'inside',
      start: ZOOM_START,
      end: ZOOM_END
    },
    {
      start: ZOOM_START,
      end: ZOOM_END
    }
  ]
};
