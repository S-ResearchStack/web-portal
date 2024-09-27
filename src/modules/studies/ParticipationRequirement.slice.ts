import { createSlice, PayloadAction} from '@reduxjs/toolkit';
import {push} from 'connected-react-router';
import { AppThunk, RootState } from '../store';
import _uniqueId from 'lodash/uniqueId';
import API, { CreateStudyRequest } from 'src/modules/api';
import { fetchStudies } from './studies.slice';
import applyDefaultApiErrorHandlers from '../api/applyDefaultApiErrorHandlers';
import { showSnackbar } from '../snackbar/snackbar.slice';
import { Path } from '../navigation/store';
import { uploadObject } from '../object-storage/utils';
import { handleGetUser } from '../auth/auth.slice';

API.mock.provideEndpoints({
  getDataTypes() {
    return API.mock.response([
      {
        name: 'samsunghealth',
        types: [
          'BLOOD_GLUCOSE',
        ]
      }
    ])
  },
  setStudyRequirement() {
    return API.mock.response(undefined);
  },
  getBlobFile() {
    const file = new File([], 'test_file', { type: 'image/png' });
    return API.mock.response(file);
  }
});

export interface StudyRequirementObject {
  informedConsent: {
    imagePath: string
  }
  healthDataTypeList: string[]
}

export type DataTypes = {
    name: string,
    types: string[]
}

export const initialRequirement:StudyRequirementObject = {
  informedConsent: {
    imagePath: ""
  },
  healthDataTypeList: [],
}
const uploadFileUrl = async (studyId: string, fileUrl: string, name: string) => {
    const blobFile = (await API.getBlobFile(fileUrl)).data;
    const fileUpload = new File([blobFile], studyId, { type: blobFile.type });
    await uploadObject({studyId: studyId, name: name, blob: fileUpload});
}

const createFileName = (studyId: string) => {
    return studyId + "-" + Date.now() + "-" + _uniqueId();
}

export const setStudyRequirementFunc = 
  (studyInfo: CreateStudyRequest, requirements: StudyRequirementObject): AppThunk<Promise<void>> => 
  async (dispatch) => {
    try {
      const study = await API.createStudy(studyInfo);
      study.checkError();
      if (!!studyInfo.imageUrl) {
        const imageName =  createFileName(studyInfo.id);
        await uploadFileUrl(studyInfo.id, studyInfo.imageUrl, imageName);
        studyInfo.imageUrl = imageName;
        const studyInfoUpdate = (({id, ...object}) => object)(studyInfo);
        const studyUpdate = await API.updateStudy(studyInfo.id, studyInfoUpdate);
        studyUpdate.checkError();
      }
      if (!!requirements.informedConsent.imagePath) {
        const consentImageName = createFileName(studyInfo.id);
        await uploadFileUrl(studyInfo.id, requirements.informedConsent.imagePath, consentImageName);
        requirements.informedConsent.imagePath = consentImageName;
      }
      const res = await API.setStudyRequirement(studyInfo.id, requirements);
      res.checkError();
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
      return;
    }
    
    dispatch(showSnackbar({ id: "create-successfull", text: "Create study successfully", showSuccessIcon:true }));
    await dispatch(fetchStudies({force: true}));
    dispatch(push(Path.Overview));
    const userRes = await API.getUser();
    userRes.checkError();
    dispatch(handleGetUser(userRes.data));
  }

const initialDataType : {dataTypes: DataTypes[], isLoading: boolean} = {
  dataTypes: [],
  isLoading: false,
}
export const DataTypeSlice = createSlice({
  name: "healthdataType",
  initialState: initialDataType,
  reducers: {
    fetchDataTypesStarted(state) {
      state.isLoading = true;
    },
    fetchDataTypesFinished(state, { payload: dataTypes }: PayloadAction<DataTypes[]>) {
      state.isLoading = false;
      state.dataTypes= dataTypes;
    }
  }
})

export const {fetchDataTypesStarted, fetchDataTypesFinished} = DataTypeSlice.actions;

export const fetchDataTypes =
  (): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(fetchDataTypesStarted());

    try {
      const {data}  = await API.getDataTypes();
      dispatch(fetchDataTypesFinished(data));
    } catch (e) {
      dispatch(fetchDataTypesFinished([]));
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  };

export const dataTypesIsLoadingSelector = (state: RootState) => state.healthdataType.isLoading;
export const dataTypesSelector = (state: RootState) => state.healthdataType.dataTypes;

export default {
  [DataTypeSlice.name]: DataTypeSlice.reducer,
}
