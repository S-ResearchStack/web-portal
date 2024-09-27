import { waitFor } from '@testing-library/react';
import { store, AppDispatch } from 'src/modules/store/store';
import API from 'src/modules/api';
import {
  DataTypeSlice,
  fetchDataTypes,
  dataTypesSelector,
  dataTypesIsLoadingSelector,
} from "./ParticipationRequirement.slice";

let dispatch: AppDispatch = store.dispatch;

const initialDataType = {
  dataTypes: [],
  isLoading: false,
};

describe('DataTypeSlice', () => {
  it('[NEGATIVE] should make empty state', () => {
    expect(DataTypeSlice.reducer(undefined, { type: 10 })).toEqual(initialDataType);
  });

  it('should fetch DataTypes', async () => {
    expect(dataTypesIsLoadingSelector(store.getState())).toBeFalsy();
    expect(dataTypesSelector(store.getState())).toEqual([]);

    dispatch(fetchDataTypes());

    await waitFor(() => dataTypesIsLoadingSelector(store.getState()));
    await waitFor(() => !dataTypesIsLoadingSelector(store.getState()));

    expect(dataTypesSelector(store.getState()).length).toEqual(1);
  });

  it('[NEGATIVE] should catch error while fetch DataTypes', async () => {
    expect(dataTypesIsLoadingSelector(store.getState())).toBeFalsy();

    await API.mock.maskEndpointAsFailure('getDataTypes', async () => {
      await dispatch(fetchDataTypes());
    });

    expect(dataTypesSelector(store.getState()).length).toEqual(0);
    expect(dataTypesSelector(store.getState())).toEqual(initialDataType.dataTypes);
  });
});
