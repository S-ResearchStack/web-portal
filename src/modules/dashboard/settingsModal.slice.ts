import { useEffect, useState } from "react";
import { StudyAutoRefreshValue } from "../api";

export const useSettingsModal = (studyAutoRefreshValue: StudyAutoRefreshValue, data?: { studyId: string; dashboardId: string; }) => {
  const [isOn, setIsOn] = useState<boolean>(() => studyAutoRefreshValue.on);
  const [timeAutoRefresh, setTimeAutoRefresh] = useState<number>(() => studyAutoRefreshValue.time);
  const [selectedCharts, setSelectedCharts] = useState<Record<string, boolean>>(() => studyAutoRefreshValue.charts);

  useEffect(() => {
    if (!data) return;
    setIsOn(studyAutoRefreshValue.on);
    setTimeAutoRefresh(studyAutoRefreshValue.time);
    setSelectedCharts(studyAutoRefreshValue.charts);
  }, [data, studyAutoRefreshValue]);

  const onCustomAutoRefreshChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setIsOn(evt.target.checked);
  };
  const onTimeAutoRefreshChange = (time: number) => {
    setTimeAutoRefresh(time);
  };
  const onSelectedChartChange = (chartId: string, checked: boolean) => {
    setSelectedCharts((selected) => ({ ...selected, [chartId]: checked }));
  };

  return {
    isOn,
    timeAutoRefresh,
    selectedCharts,
    onCustomAutoRefreshChange,
    onTimeAutoRefreshChange,
    onSelectedChartChange,
  };
};
