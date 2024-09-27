import { useCallback, useState } from 'react';
import { push } from 'connected-react-router';
import { generatePath } from 'react-router-dom';

import API from 'src/modules/api';
import { Path } from '../../navigation/store';
import createDataSlice from 'src/modules/store/createDataSlice';
import { RootState, useAppDispatch } from '../../store';
import { isStudyResearcher } from 'src/modules/auth/auth.slice.userRoleSelector';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';

type GetChartListParams = {
  studyId: string;
  dashboardId: string;
};

const chartListSlice = createDataSlice({
  name: 'dashboard/chartList',
  fetchData: async (params: GetChartListParams) => {
    const { data: chartList } = await API.getChartList(params);
    return chartList;
  },
});

export const useChartList = chartListSlice.hook;

export default {
  [chartListSlice.name]: chartListSlice.reducer,
};

export const chartListDataSelector = (state: RootState) => state[chartListSlice.name]?.data;

export const useCreateChart = () => {
  const dispatch = useAppDispatch();
  const isResearcher = isStudyResearcher();
  return {
    isEditble: !isResearcher,
    create: useCallback((params: { dashboardId: string }) => dispatch(push(generatePath(Path.CreateChart, params))), [dispatch]),
  };
};

export const useEditChart = () => {
  const dispatch = useAppDispatch();
  const isResearcher = isStudyResearcher();
  return {
    isEditble: !isResearcher,
    create: useCallback(
      (params: { dashboardId: string }) => dispatch(push(generatePath(Path.CreateChart, params))),
      [dispatch]
    ),
    edit: useCallback(
      (params: { dashboardId: string, chartId: string }) => dispatch(push(generatePath(Path.EditChart, params))),
      [dispatch]
    ),
  };
};

export const useDeleteChart = () => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const remove = async (studyId: string, dashboardId: string, id: string) => {
    try {
      setIsDeleting(true);

      const res = await API.deleteChart({ studyId, dashboardId, id });
      res.checkError();

      setIsDeleting(false);
      return true;
    } catch (err) {
      setIsDeleting(false);
      dispatch(
        showSnackbar({ text: 'Oops, something went wrong, please try again.', showErrorIcon: true })
      );
      return false;
    }
  };

  return {
    isDeleting,
    remove,
  };
};
