import API from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';

type GetDashboardListParams = {
  studyId: string;
};

const dashboardListSlice = createDataSlice({
  name: 'dashboard/dashboardList',
  fetchData: async (params: GetDashboardListParams) => {
    const { data: list } = await API.getDashboardList(params);
    if (!!list.length)
      return list;

    const createRes = await API.createDashboard(params, { title: 'Dashboard 1' });
    createRes.checkError();

    const getRes = await API.getDashboardList(params);
    getRes.checkError();

    return getRes.data;
  },
});

export default {
  [dashboardListSlice.name]: dashboardListSlice.reducer,
};

export const useDashboardList = dashboardListSlice.hook;
