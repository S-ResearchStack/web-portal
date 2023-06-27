import { useCallback } from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _uniqueId from 'lodash/uniqueId';
import { DateTime } from 'luxon';

import createDataSlice from 'src/modules/store/createDataSlice';
import API, {
  LabVisitItemResponse,
  LabVisitParticipantSuggestionItemResponse,
  LabVisitSaveItemRequest,
} from 'src/modules/api';
import {
  AppThunk,
  ErrorType,
  RootState,
  useAppDispatch,
  useAppSelector,
  WithSending,
} from 'src/modules/store';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { SortDirectionOptions } from 'src/common/components/Table';
import { healthDataOverviewListMock } from 'src/modules/overview/participantsList.slice';
import Random from 'src/common/Random';
import { selectedStudyIdSelector } from 'src/modules/studies/studies.slice';
import { convertIsoUtcToMillis, convertMillisToIsoUtc } from 'src/common/utils/datetime';
import { uniq } from 'lodash';
import { Response } from 'src/modules/api/executeRequest';

export type LabVisitItem = {
  visitId: number;
  participantId: string;
  startTs?: number;
  endTs?: number;
  checkInBy?: string;
  notes?: string;
  filesPath?: string;
  hasDocuments?: boolean;
};

export interface LabVisitListSort {
  column: keyof LabVisitItem;
  direction: SortDirectionOptions;
}

export interface LabVisitListFilter {
  offset: number;
  perPage: number;
}

export type LabVisitListFetchArgs = {
  projectId: string;
};

export type LabVisitParticipantSuggestionFetchArgs = { studyId: string };

type LabVisitParticipantSuggestion = string;

const r = new Random(1);

const nameGenerator = () => {
  const n1 = ['Blue ', 'Green', 'Red', 'Orange', 'Violet', 'Indigo', 'Yellow '];
  const n2 = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Zero'];
  return [r.arrayElement(n1), r.arrayElement(n2)].join(' ');
};

const loremIpsumGenerator = (length: number) => {
  const t =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  let result = '';
  do {
    result = `${result} ${t}`.trim();
  } while (result.length < length);
  return result.slice(0, length).trim();
};

export const MAX_ALL_DOCUMENTS_SIZE = 10 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 3 * 1024 * 1024;

const createUniqueId = () => Number(_uniqueId());

const labVisitListMock = Array.from({ length: healthDataOverviewListMock.length }).map((_, idx) => {
  const startDate = r.date(new Date('2023-03-01'), new Date('2023-04-01'));
  const id = createUniqueId();
  return {
    id,
    userId: healthDataOverviewListMock[idx].userId,
    startTime: convertMillisToIsoUtc(DateTime.fromJSDate(startDate).startOf('hour').toMillis()),
    endTime: convertMillisToIsoUtc(
      DateTime.fromJSDate(startDate).plus({ day: 1 }).startOf('hour').toMillis()
    ),
    checkedInBy: nameGenerator(),
    notes: r.num(0, 1) < 0.8 ? loremIpsumGenerator(r.int(10, 500)) : undefined,
    filesPath: `in-lab-visit/${id}`,
  } as LabVisitItemResponse;
});

export const getLabVisitsListMock: typeof API.getLabVisitsList = () =>
  API.mock.response(labVisitListMock);

const findMockIdxById = (id?: number): number => labVisitListMock.findIndex((i) => i.id === id);

const sendLabVisitMock: typeof API.createLabVisit = (body) => {
  const idx = findMockIdxById(body.id);
  let item: Required<LabVisitItemResponse>;
  if (idx !== -1) {
    item = { ...labVisitListMock[idx], ...body } as Required<LabVisitItemResponse>;
    labVisitListMock[idx] = item;
  } else {
    item = { ...body, id: createUniqueId() } as Required<LabVisitItemResponse>;
    labVisitListMock.push(item);
  }
  return API.mock.response(item);
};

API.mock.provideEndpoints({
  getLabVisitsList: getLabVisitsListMock,
  createLabVisit: sendLabVisitMock,
  updateLabVisit: sendLabVisitMock,
  getHealthDataParticipantIds() {
    return API.mock.response({
      healthDataOverview: healthDataOverviewListMock,
    });
  },
});

export const makeEmptyLabVisit = (): LabVisitItem => ({
  visitId: Number(_uniqueId()),
  participantId: '',
});

export const transformLabVisitItemFromApi = (
  { startTime, endTime, id, checkedInBy, userId, ...item }: LabVisitItemResponse,
  idsWithFiles?: number[]
): LabVisitItem => ({
  ...item,
  visitId: id,
  startTs: startTime ? convertIsoUtcToMillis(startTime) : 0,
  endTs: endTime ? convertIsoUtcToMillis(endTime) : 0,
  checkInBy: checkedInBy,
  participantId: userId,
  hasDocuments: idsWithFiles?.includes(id),
});

export const labVisitSlice = createDataSlice({
  name: 'labVisit/list',
  fetchData: async (args: LabVisitListFetchArgs) => {
    // prettier-ignore
    const [
      { data: list },
      { data: allFiles }
    ] = await Promise.all([
      API.getLabVisitsList(args),
      API.getStorageObjects({ projectId: args.projectId, path: 'in-lab-visit' }),
    ]);

    const visitIdsWithFiles = uniq(allFiles.map((f) => Number(f.name.split('/')[1])));

    return {
      list: list.map((i) => transformLabVisitItemFromApi(i, visitIdsWithFiles)),
    };
  },
});

export const useLabVisitsList = labVisitSlice.hook;

const saveLabVisitInitialState: WithSending = {};

export const saveLabVisitSlice = createSlice({
  name: 'labVisit/saveVisit',
  initialState: saveLabVisitInitialState,
  reducers: {
    sendingInit: (state) => {
      state.isSending = true;
    },
    sendingSuccess: (state) => {
      state.isSending = false;
      state.error = undefined;
    },
    sendingFailure: (state, action: PayloadAction<ErrorType>) => {
      state.isSending = false;
      state.error = action.payload;
    },
  },
});

const transformLabVisitItemToApi = ({
  participantId,
  visitId,
  startTs,
  endTs,
  checkInBy,
  ...item
}: Partial<LabVisitItem>): LabVisitSaveItemRequest => ({
  ...item,
  id: visitId,
  userId: participantId,
  checkedInBy: checkInBy,
  startTime: startTs ? convertMillisToIsoUtc(startTs) : undefined,
  endTime: endTs ? convertMillisToIsoUtc(endTs) : undefined,
});

const saveLabVisit =
  (data: Partial<LabVisitItem>): AppThunk<Promise<Required<LabVisitItem> | unknown>> =>
  async (dispatch, getState) => {
    try {
      dispatch(saveLabVisitSlice.actions.sendingInit());
      const projectId = selectedStudyIdSelector(getState());
      const payload = {
        ...transformLabVisitItemToApi(data),
        projectId: projectId ?? '',
      };

      let response: Response<LabVisitItemResponse>;

      if (data.visitId === undefined) {
        response = await API.createLabVisit(payload);
      } else {
        response = await API.updateLabVisit(payload);
      }

      response.checkError();

      dispatch(saveLabVisitSlice.actions.sendingSuccess());

      return transformLabVisitItemFromApi(response.data) as Required<LabVisitItem>;
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
      dispatch(saveLabVisitSlice.actions.sendingFailure(String(e)));
      return e;
    }
  };

export const saveLabVisitSelector = (state: RootState) => state[saveLabVisitSlice.name];

export const useSaveLabVisit = () => {
  const dispatch = useAppDispatch();

  return {
    ...useAppSelector(saveLabVisitSelector),
    save: useCallback(
      (body: Parameters<typeof saveLabVisit>[0]) => dispatch(saveLabVisit(body)),
      [dispatch]
    ),
  };
};

export const transformParticipantSuggestionsFromApi = (
  data: LabVisitParticipantSuggestionItemResponse[]
) => data.map((i) => i.userId).filter(Boolean) as LabVisitParticipantSuggestion[];

export const labVisitParticipantSuggestionsSlice = createDataSlice({
  name: 'labVisit/participantSuggestions',
  fetchData: async (args: LabVisitParticipantSuggestionFetchArgs) => {
    const baseOptions = { projectId: args.studyId };
    const {
      data: { count: limit },
    } = await API.getUserProfilesCount(baseOptions);
    let items: LabVisitParticipantSuggestionItemResponse[] = [];

    if (limit) {
      const res = await API.getHealthDataParticipantIds({
        ...baseOptions,
        limit,
      });
      items = res.data?.healthDataOverview || [];
    }

    return transformParticipantSuggestionsFromApi(items);
  },
});

export const useLabVisitParticipantSuggestions = labVisitParticipantSuggestionsSlice.hook;

export default {
  [labVisitSlice.name]: labVisitSlice.reducer,
  [saveLabVisitSlice.name]: saveLabVisitSlice.reducer,
  [labVisitParticipantSuggestionsSlice.name]: labVisitParticipantSuggestionsSlice.reducer,
};
