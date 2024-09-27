import { useCallback } from 'react';
import { push } from 'connected-react-router';
import { generatePath } from 'react-router-dom';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Path } from 'src/modules/navigation/store';
import { Timestamp } from 'src/common/utils/datetime';
import { transformDataQueryResponse } from '../dashboard.utils';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import API, { ChartSource, ChartConfigBasic, ChartConfigSpecific, QueryResponse, AddChartRequest } from 'src/modules/api';
import '../dashboard.mock';

export type ChartEditorData = {
  studyId: string;
  dashboardId: string;
  id?: string;
  source?: ChartSource,
  configBasic?: Partial<ChartConfigBasic>;
  configSpecific?: Partial<ChartConfigSpecific>;
  sourceResult?: QueryResponse;
};
type ChartEditorErrors = {
  source: { empty?: boolean };
  sourceResult: { empty?: boolean };
  configBasic: { type: { empty?: boolean }, name: { empty?: boolean } };
  preview?: boolean;
};

export type ChartEditorState = {
  isSaving: boolean;
  isLoading: boolean;
  savedOn?: number;
  lastTouchedOn?: number;
  isFailedConnection?: boolean;
  data?: ChartEditorData;
  errors?: ChartEditorErrors;
};

export const initialState: ChartEditorState = {
  isSaving: false,
  isLoading: false,
};

export const chartEditorSlice = createSlice({
  name: 'dashboard/ChartEditor',
  initialState,
  reducers: {
    loadingStarted: (state) => {
      state.isLoading = true;
    },
    loadingFinished: (state) => {
      state.isLoading = false;
    },
    savingStarted: (state) => {
      state.isSaving = true;
    },
    savingFinished: (
      state,
      action: PayloadAction<{ error?: boolean; isFailedConnection?: boolean }>
    ) => {
      state.isSaving = false;
      if (!action.payload.error) {
        state.savedOn = Date.now();
      }
      state.isFailedConnection = !!action.payload.isFailedConnection;
    },
    setChartData(state, action: PayloadAction<ChartEditorData | undefined>) {
      state.data = action.payload;
    },
    setChartErrors(state, action: PayloadAction<ChartEditorErrors>) {
      state.errors = action.payload;
    },
    updateChartErrors(state, action: PayloadAction<Partial<ChartEditorErrors>>) {
      state.errors = {
        source: { empty: false },
        sourceResult: { empty: false },
        configBasic: { type: { empty: false }, name: { empty: false } },
        ...state.errors,
        ...action.payload,
      };
    },
    clearChartTransientState(state) {
      state.lastTouchedOn = undefined;
      state.savedOn = undefined;
      state.errors = undefined;
    },
    updateLastTouched(state, action: PayloadAction<Timestamp | undefined>) {
      state.lastTouchedOn = action.payload ?? Date.now();
    },
    reset() {
      return { ...initialState };
    },
  },
});

export const {
  loadingStarted,
  loadingFinished,
  savingStarted,
  savingFinished,
  setChartData,
  setChartErrors,
  updateChartErrors,
  clearChartTransientState,
  updateLastTouched,
  reset,
} = chartEditorSlice.actions;

export default {
  [chartEditorSlice.name]: chartEditorSlice.reducer,
};

export const chartEditorDataSelector = (state: RootState) =>
  state[chartEditorSlice.name].data || { studyId: '', dashboardId: '' };
export const chartEditorErrorsSelector = (state: RootState) => state[chartEditorSlice.name].errors;
export const chartEditorIsLoadingSelector = (state: RootState) => state[chartEditorSlice.name].isLoading;
export const chartEditorIsSavingSelector = (state: RootState) => state[chartEditorSlice.name].isSaving;
export const chartEditorSavedOnSelector = (state: RootState) => state[chartEditorSlice.name].savedOn;
export const chartEditorLastTouchedOnSelector = (state: RootState) =>
  state[chartEditorSlice.name].lastTouchedOn;
export const chartEditorIsFailedConnectionSelector = (state: RootState) =>
  state[chartEditorSlice.name].isFailedConnection;

export const loadChart =
  ({
    studyId,
    dashboardId,
    chartId,
    onError,
  }: {
    studyId: string;
    dashboardId: string;
    chartId: string;
    onError: () => void;
  }): AppThunk<Promise<void>> =>
    async (dispatch) => {
      try {
        dispatch(loadingStarted());

        const getRes = await API.getChart({ studyId, dashboardId, id: chartId });
        getRes.checkError();
        const chart = getRes.data;

        const executeRes = await API.executeChartDataQuery({ studyId }, chart.source);
        executeRes.checkError();
        const queryResponse = transformDataQueryResponse(executeRes.data);

        dispatch(
          setChartData({
            studyId,
            dashboardId,
            id: chartId,
            source: chart.source,
            configBasic: chart.configBasic,
            configSpecific: chart.configSpecific,
            sourceResult: queryResponse,
          })
        );
        dispatch(clearChartTransientState());
      } catch (err) {
        onError();
      } finally {
        dispatch(loadingFinished());
      }
    };

export const generateChart =
  ({
    studyId,
    dashboardId
  }: {
    studyId: string
    dashboardId: string;
  }): AppThunk<Promise<void>> =>
    async (dispatch) => {
      dispatch(loadingStarted());
      dispatch(
        setChartData({
          studyId,
          dashboardId,
          configBasic: {},
          configSpecific: {},
        })
      );
      dispatch(clearChartTransientState());
      dispatch(loadingFinished());
    };

export const saveChart =
  (data: ChartEditorData): AppThunk<Promise<void>> =>
    async (dispatch) => {
      const { studyId, dashboardId, id, source, configBasic, configSpecific } = data;
      if (!studyId || !dashboardId || !source || !configBasic?.type || !configSpecific) return;
      try {
        dispatch(savingStarted());

        const body = {
          source: { ...source, transform: { limit: 1000 } },
          configBasic: configBasic,
          configSpecific: configSpecific
        } as AddChartRequest;

        let res;
        if (!id) {
          res = await API.createChart({ studyId, dashboardId }, body);
        } else {
          res = await API.updateChart({ studyId, dashboardId, id }, body);
        }
        res.checkError();

        dispatch(push(generatePath(Path.Dashboard)));
        dispatch(savingFinished({ error: false }));
      } catch (err) {
        dispatch(savingFinished({ error: true, isFailedConnection: true }));
      }
    };

export const removeChart =
  (): AppThunk<Promise<void>> =>
    async (dispatch) => {
      dispatch(push(generatePath(Path.Dashboard)));
    };

export const getChartErrors = ({
  data: d,
  currentErrors: cur,
}: {
  data: ChartEditorData;
  currentErrors?: ChartEditorErrors;
}): ChartEditorErrors => {
  return {
    source: { empty: !d.source },
    sourceResult: { empty: !!d.source && !d.sourceResult },
    configBasic: { type: { empty: !d.configBasic?.type }, name: { empty: !d.configBasic?.name } },
    preview: cur?.preview
  };
};

export const hasSomeChartErrors = (ae: ChartEditorErrors) => !!ae.source.empty || !!ae.sourceResult.empty || !!ae.configBasic.type.empty || !!ae.configBasic.name.empty || !!ae.preview;

export const updateChart =
  (data: ChartEditorData): AppThunk =>
    (dispatch, getState) => {
      const errors = chartEditorErrorsSelector(getState());

      dispatch(setChartData(data));
      dispatch(updateLastTouched());

      errors &&
        dispatch(
          setChartErrors(
            getChartErrors({
              data,
              currentErrors: errors,
            })
          )
        );
    };

export const useChartEditor = () => {
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(chartEditorIsLoadingSelector);
  const isSaving = useAppSelector(chartEditorIsSavingSelector);
  const savedOn = useAppSelector(chartEditorSavedOnSelector);
  const lastTouchedOn = useAppSelector(chartEditorLastTouchedOnSelector);
  const isFailedConnection = useAppSelector(chartEditorIsFailedConnectionSelector);
  const data = useAppSelector(chartEditorDataSelector);
  const errors = useAppSelector(chartEditorErrorsSelector);

  const load = useCallback(
    ({ studyId, dashboardId, chartId, onError }: { studyId: string; dashboardId: string; chartId: string; onError: () => void }) => {
      if (!isLoading && (studyId !== data?.studyId || dashboardId !== data?.dashboardId || chartId !== data?.id)) {
        dispatch(loadChart({ studyId, dashboardId, chartId, onError }));
      }
    },
    [dispatch, isLoading, data?.studyId, data?.dashboardId, data?.id]
  );

  const generate = useCallback(
    ({ studyId, dashboardId }: { studyId: string; dashboardId: string }) => {
      dispatch(generateChart({ studyId, dashboardId }));
    },
    [dispatch]
  );

  const save = useCallback(() => {
    dispatch(saveChart(data));
  }, [dispatch, data]);

  const remove = useCallback(() => {
    dispatch(removeChart());
  }, [dispatch]);

  const set = useCallback(
    (a: ChartEditorData) => {
      dispatch(updateChart(a));
    },
    [dispatch]
  );

  const setPartial = useCallback(
    (a: Partial<ChartEditorData>) => {
      set({ ...data, ...a });
    },
    [data, set]
  );

  const validateChart = useCallback(() => {
    const se = getChartErrors({ data, currentErrors: errors, });
    dispatch(setChartErrors(se));
    return se;
  }, [data, errors, dispatch]);

  const setPartialError = useCallback(
    (e: Partial<ChartEditorErrors>) => {
      dispatch(updateChartErrors(e));
    },
    [dispatch]
  );

  const resetAll = useCallback(() => dispatch(reset()), [dispatch]);

  return {
    isLoading,
    savedOn,
    isSaving,
    lastTouchedOn,
    isFailedConnection,
    data,
    errors,
    loadChart: load,
    generateChart: generate,
    saveChart: save,
    removeChart: remove,
    setChart: set,
    updateChart: setPartial,
    validateChart,
    updateChartErrors: setPartialError,
    reset: resetAll,
  };
};

type EditData = {
  studyId: string;
  dashboardId: string;
  id: string;
  source: ChartSource,
  configBasic: ChartConfigBasic;
  configSpecific: ChartConfigSpecific;
  sourceResult?: QueryResponse;
};
const editChart = (params: EditData): AppThunk =>
  async (dispatch) => {
    dispatch(setChartData({ ...params }));
    dispatch(push(generatePath(Path.EditChart, { dashboardId: params.dashboardId, chartId: params.id })));
  };
export const useEditChart = () => {
  const dispatch = useAppDispatch();
  return {
    edit: useCallback((params: EditData) => dispatch(editChart(params)), [dispatch]),
  };
};
