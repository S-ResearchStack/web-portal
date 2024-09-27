import { useCallback, useMemo } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState, useAppDispatch, useAppSelector } from "../store";
import { getAutoRefreshStorage, setAutoRefreshStorage, getUserActiveStorage, setUserActiveStorage } from "./dashboard.utils";
import type { AutoRefresh, UserAutoRefreshValue, StudyAutoRefreshValue } from "../api";

const DELETE_TIME = 5 * 24 * 60 * 60;
const DEFAULT_TIME_VALUE = 10;
const DEFAULT_VALUE = { on: false, time: DEFAULT_TIME_VALUE, charts: {} };

const initialState: AutoRefresh = getAutoRefreshStorage();

const autoRefreshSlice = createSlice({
  name: 'dashboard/autoRefresh',
  initialState: initialState,
  reducers: {
    set(_, action: PayloadAction<AutoRefresh>) {
      return { ...action.payload }
    },
  },
});

export default {
  [autoRefreshSlice.name]: autoRefreshSlice.reducer,
};

export const useAutoRefresh = (dashboardId?: string, chartId?: string) => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state: RootState) => state.user.id);
  const studyId = useAppSelector((state: RootState) => state.studies.selectedStudyId) || '';

  const autoRefresh = useAppSelector((state: RootState) => state[autoRefreshSlice.name]);
  const userAutoRefreshValue = useMemo(() => autoRefresh[userId] || {}, [userId, autoRefresh]);
  const studyAutoRefreshValue = useMemo(() => userAutoRefreshValue[studyId] || DEFAULT_VALUE, [studyId, userAutoRefreshValue]);

  const chartAutoRefreshValue = useMemo(() => {
    if (!chartId || !studyAutoRefreshValue.on || !studyAutoRefreshValue.charts[chartId]) return DEFAULT_TIME_VALUE;
    return studyAutoRefreshValue.time || DEFAULT_TIME_VALUE;
  }, [studyAutoRefreshValue]);

  const setAutoRefresh = useCallback((params: AutoRefresh) => {
    setAutoRefreshStorage(params);
    dispatch(autoRefreshSlice.actions.set(params));
  }, [dispatch]);

  const setUserAutoRefresh = useCallback((params: UserAutoRefreshValue) => {
    const userActive = updateUserActive(userId);

    const newAutoRefresh = Object.keys(autoRefresh).reduce((prev, id) => {
      if (userId === id || !userActive[id]) return prev;
      return { ...prev, [id]: autoRefresh[id] };
    }, { [userId]: params });

    setAutoRefresh(newAutoRefresh);
  }, [userId, autoRefresh, setAutoRefresh]);

  const setStudyAutoRefresh = useCallback((params: StudyAutoRefreshValue, data: { studyId: string; dashboardId: string; }) => {
    const newUserAutoRefresh = { ...userAutoRefreshValue, [studyId]: params };
    setUserAutoRefresh(newUserAutoRefresh);
  }, [studyId, userAutoRefreshValue, setUserAutoRefresh]);

  return {
    studyAutoRefreshValue,
    chartAutoRefreshValue,
    setStudyAutoRefresh,
  };
};

const updateUserActive = (userId: string) => {
  const now = Date.now();
  const userActive = getUserActiveStorage();

  const newUserActive = Object.keys(userActive).reduce((prev, id) => {
    if (userId === id || now - userActive[id] > DELETE_TIME * 1000) return prev;
    return { ...prev, [id]: userActive[id] };
  }, { [userId]: now });

  setUserActiveStorage(newUserActive);
  return newUserActive;
};
