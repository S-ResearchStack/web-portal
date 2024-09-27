import API, {SetSubjectStatusRequest, SubjectInfoListResponse} from "src/modules/api";
import {PaginationParams} from "src/modules/api/models/pagination";
import {AppThunk, RootState, useAppSelector} from "src/modules/store";
import {showSnackbar} from "src/modules/snackbar/snackbar.slice";
import {
  FAILED_TO_CHANGE_SUBJECT_STATUS,
  FAILED_TO_GET_SUBJECT_INFO_LIST,
  SUBJECT_STATUS_CHANGED
} from "src/modules/study-data/StudyData.message";
import applyDefaultApiErrorHandlers from "src/modules/api/applyDefaultApiErrorHandlers";
import {createSelector, createSlice} from "@reduxjs/toolkit";
import {SubjectStatus} from "src/modules/study-data/studyData.enum";
import {transformSubjectInfoFromApi} from "src/modules/study-data/studyData.mapper";

export const mockData = [
  {
      studyId: "AFHTEST",
      subjectNumber: "1",
      status: "COMPLETED",
  },
  {
      studyId: "AFHTEST",
      subjectNumber: "2",
      status: "PARTICIPATING",
  },
  {
      studyId: "AFHTEST",
      subjectNumber: "3",
      status: "WITHDRAWN",
  },
  {
      studyId: "AFHTEST",
      subjectNumber: "5",
      status: "DROP",
  },
  {
      studyId: "AFHTEST",
      subjectNumber: "13",
      status: "PARTICIPATING",
  },
  {
      studyId: "AFHTEST",
      subjectNumber: "14",
      status: "PARTICIPATING",
  },
  {
      studyId: "AFHTEST",
      subjectNumber: "15",
      status: "PARTICIPATING",
  }
] as SubjectInfoListResponse;

API.mock.provideEndpoints({
  getSubjectInfoList() {
    return API.mock.response(mockData);
  },
  getSubjectInfoListCount() {
    return API.mock.response({
      totalCount: mockData.length
    });
  },
  setSubjectStatus(){
    return API.mock.response(undefined);
  }
});
export interface SubjectInfo {
  studyId: string
  subjectNumber: string
  status?: SubjectStatus
  lastSyncTime?: string
  totalTaskCount?: number
}

interface SubjectInfoListState {
  studyId: string | undefined,
  subjectInfoList: SubjectInfo[]
  totalSubjectInfoList: number
  page: number
  size: number
}

const subjectInfoListInitialState: SubjectInfoListState = {
  studyId: undefined,
  subjectInfoList: [],
  totalSubjectInfoList: 0,
  page: 0,
  size: 0
}

const subjectInfoListSlice = createSlice(({
  name: 'subjectInfoList',
  initialState: subjectInfoListInitialState,
  reducers: {
    loadSubjectInfoList(state, action) {
      const { studyId, subjectInfoList, totalSubjectInfoList, page, size } = action.payload
      state.studyId = studyId
      state.subjectInfoList = subjectInfoList
      state.totalSubjectInfoList = totalSubjectInfoList
      state.page = page
      state.size = size
    }
  }
}))

export const loadSubjectInfoList = (params: { studyId: string } & PaginationParams): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const results = await Promise.all([
        API.getSubjectInfoList({...params, includeTaskRecord: true}),
        API.getSubjectInfoListCount(params)
      ])

      dispatch(subjectInfoListSlice.actions.loadSubjectInfoList({
        subjectInfoList: results[0].data.map(transformSubjectInfoFromApi),
        totalSubjectInfoList: results[1].data.totalCount,
        ...params
      }))
    } catch(e) {
      applyDefaultApiErrorHandlers(e, dispatch)
      dispatch(showSnackbar({ text: FAILED_TO_GET_SUBJECT_INFO_LIST }))
    }
  }

export const setSubjectStatus = ({
  studyId,
  subjectNumber,
  status
}: SetSubjectStatusRequest) : AppThunk<Promise<boolean>> =>
  async (dispatch) => {
    try {
      const {checkError} = await API.setSubjectStatus({studyId, subjectNumber, status})
      checkError()

      dispatch(showSnackbar({ text: SUBJECT_STATUS_CHANGED(subjectNumber, status) }))
      return true
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch)
      dispatch(showSnackbar({ text: FAILED_TO_CHANGE_SUBJECT_STATUS }))
    }
    return false
  }

const subjectInfoListSelector = createSelector(
  (state: RootState) => state.subjectInfoList,
  (subjectInfoListState) => subjectInfoListState.subjectInfoList
)

const totalSubjectInfoListSelector = createSelector(
  (state: RootState) => state.subjectInfoList,
  (subjectInfoListState) => subjectInfoListState.totalSubjectInfoList
)

export const useSubjectInfoList = () => useAppSelector(subjectInfoListSelector)

export const useTotalSubjectInfoList = () => useAppSelector(totalSubjectInfoListSelector)

export default {
  [subjectInfoListSlice.name]: subjectInfoListSlice.reducer
};
