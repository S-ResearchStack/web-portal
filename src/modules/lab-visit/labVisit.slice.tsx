import { useCallback } from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _uniqueId from 'lodash/uniqueId';
import _orderBy from 'lodash/orderBy';
import _range from 'lodash/range';
import { DateTime } from 'luxon';

import createDataSlice from 'src/modules/store/createDataSlice';
import API, {
  LabVisitItemResponse,
  LabVisitSaveItemRequest,
  SubjectInfoListResponse,
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
import Random from 'src/common/Random';
import { selectedStudyIdSelector } from 'src/modules/studies/studies.slice';
import { convertIsoUtcToMillis, convertMillisToIsoUtc } from 'src/common/utils/datetime';
import { userRoleForStudySelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { isDataScientist } from 'src/modules/auth/userRole';

export type LabVisitItem = {
  id: number;
  subjectNumber: string;
  participantEmail?: string;
  startTime?: number;
  endTime?: number;
  picId?: string;
  note?: string;
  filePaths?: string[];
};

export interface LabVisitListSort {
  column: keyof LabVisitItem;
  direction: SortDirectionOptions;
}

export interface LabVisitListFilter {
  page: number;
  size: number;
}

export type LabVisitListFetchArgs = {
  studyId: string;
  sort: LabVisitListSort;
  filter: LabVisitListFilter;
};

export type LabVisitParticipantSuggestionFetchArgs = { studyId: string };
export type LabVisitResearcherSuggestionFetchArgs = { studyId: string };

const r = new Random(1);

const loremIpsumGenerator = (length: number) => {
  const t =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  let result = '';
  do {
    result = `${result} ${t}`.trim();
  } while (result.length < length);
  return result.slice(0, length).trim();
};

export const MAX_ALL_DOCUMENTS_SIZE = 100 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
export const MAX_ALL_DOCUMENTS_COUNT = 10;

const createUniqueId = () => Number(_uniqueId());
const findMockIdxById = (id?: number): number => labVisitListMock.findIndex((i) => i.id === id);

const MOCK_VISIT_COUNT = 55;
const MOCK_RESEARCHER_COUNT = 22;
const MOCK_PATICIPANT_COUNT = 155;

export const paticipantsListMock = _range(MOCK_PATICIPANT_COUNT).map((idx) => ({
  studyId: 'test-study-id',
  subjectNumber: `${idx}`,
  status: 'COMPLETED',
  userId: `${idx}`
})) as SubjectInfoListResponse;
const researchersListMock = _range(MOCK_RESEARCHER_COUNT).map((idx) => {
  return {
    id: `researcher-id-${idx}`,
    email: `researcher-${idx}@email.com`,
    firstName: `First ${idx}`,
    lastName: `Last ${idx}`,
    company: `Company ${idx}`,
    team: `Team ${idx}`,
    officePhoneNumber: `0123456789`,
    mobilePhoneNumber: '0123456789',
    roles: ['studyManager'],
    name: `Researcher ${idx}`,
  }
});
const labVisitListMock = _range(MOCK_VISIT_COUNT).map((idx) => {
  const startDate = r.date(new Date('2023-03-01'), new Date('2024-03-01'));
  return {
    id: createUniqueId(),
    picId: researchersListMock[idx % MOCK_RESEARCHER_COUNT].name,
    subjectNumber: paticipantsListMock[idx % MOCK_PATICIPANT_COUNT].subjectNumber,
    startTime: convertMillisToIsoUtc(DateTime.fromJSDate(startDate).startOf('hour').toMillis()),
    endTime: convertMillisToIsoUtc(DateTime.fromJSDate(startDate).plus({ day: 1 }).startOf('hour').toMillis()),
    note: r.num(0, 1) < 0.8 ? loremIpsumGenerator(r.int(10, 500)) : undefined,
    filePaths: idx < 10 ? ['JPG.jpg', 'PNG.PNG', 'IconURL.webp'] : idx < 15 ? ['HDP_payload.txt'] : [],
    createdBy: researchersListMock[r.int(0, MOCK_RESEARCHER_COUNT - 1)].id,
    modifiedBy: idx % 5 ? undefined : researchersListMock[r.int(0, MOCK_RESEARCHER_COUNT - 1)].id,
  } as LabVisitItemResponse;
});

const getSubjectInfoListMock = () => {
  return API.mock.response(paticipantsListMock);
}
const getUsersMock = () => {
  return API.mock.response(researchersListMock);
}
export const getLabVisitsMock: typeof API.getLabVisits = ({ sort, filter }) => {
  const page = filter.page, size = filter.size, sortBy = sort.column, orderBy = sort.direction;
  const list = _orderBy(labVisitListMock, [sortBy], [orderBy]).slice(page * size, (page + 1) * size)
  return API.mock.response({
    page,
    size,
    sortBy,
    orderBy,
    totalCount: labVisitListMock.length,
    list
  });
}
const createLabVisitMock: typeof API.createLabVisit = ({ studyId }, body) => {
  let item = {
    ...body,
    id: createUniqueId(),
    createdBy: researchersListMock[r.int(0, MOCK_RESEARCHER_COUNT - 1)].id,
  } as LabVisitItemResponse;
  labVisitListMock.push(item);
  return API.mock.response(item);
};
const updateLabVisitMock: typeof API.updateLabVisit = ({ visitId }, body) => {
  const idx = findMockIdxById(visitId);
  let item = {
    ...labVisitListMock[idx],
    ...body,
    modifiedBy: researchersListMock[r.int(0, MOCK_RESEARCHER_COUNT - 1)].id,
  };
  labVisitListMock[idx] = item;
  return API.mock.response(item);
};

API.mock.provideEndpoints({
  getSubjectInfoList: getSubjectInfoListMock,
  getUsers: getUsersMock,
  getLabVisits: getLabVisitsMock,
  createLabVisit: createLabVisitMock,
  updateLabVisit: updateLabVisitMock,
});

export const transformLabVisitItemFromApi = ({ startTime, endTime, ...item }: LabVisitItemResponse): LabVisitItem => ({
  ...item,
  startTime: startTime ? new Date(startTime).getTime() : 0,
  endTime: endTime ? new Date(endTime).getTime() : 0,
});

export const labVisitSlice = createDataSlice({
  name: 'labVisit/list',
  fetchData: async (args: LabVisitListFetchArgs) => {
    const { data } = await API.getLabVisits(args);

    return {
      ...data,
      list: data.list?.map(i => transformLabVisitItemFromApi(i))
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
  subjectNumber,
  picId,
  note,
  filePaths,
  startTime,
  endTime,
}: Partial<LabVisitItem>): LabVisitSaveItemRequest => ({
  subjectNumber,
  picId,
  note,
  filePaths,
  startTime: startTime ? new Date(startTime).toISOString() : undefined,
  endTime: endTime ? new Date(endTime).toISOString() : undefined,
});

const saveLabVisit =
  (data: Partial<LabVisitItem>): AppThunk<Promise<LabVisitItemResponse | unknown>> =>
    async (dispatch, getState) => {
      try {
        dispatch(saveLabVisitSlice.actions.sendingInit());
        const studyId = selectedStudyIdSelector(getState()) || '';
        const payload = transformLabVisitItemToApi(data);

        let response;
        if (data.id === undefined) {
          response = await API.createLabVisit({ studyId }, payload);
        } else {
          response = await API.updateLabVisit({ studyId, visitId: data.id }, payload);
        }

        response.checkError();

        dispatch(saveLabVisitSlice.actions.sendingSuccess());

        return data;
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

export const useEditLabVisit = () => {
  const userRoles = useAppSelector(userRoleForStudySelector)?.roles;
  const isUserDataScientist = isDataScientist(userRoles);
  const isEditble = !isUserDataScientist;

  return {
    isEditble,
  };
};

export const labVisitParticipantSuggestionsSlice = createDataSlice({
  name: 'labVisit/participantSuggestions',
  fetchData: async (args: LabVisitParticipantSuggestionFetchArgs) => {
    const { data } = await API.getSubjectInfoList({ studyId: args.studyId, includeTaskRecord: false });
    return data;
  },
});
export const useLabVisitParticipantSuggestions = labVisitParticipantSuggestionsSlice.hook;

export const labVisitResearcherSuggestionsSlice = createDataSlice({
  name: 'labVisit/researcherSuggestions',
  fetchData: async (args: LabVisitResearcherSuggestionFetchArgs) => {
    const { data } = await API.getUsers({ studyId: args.studyId });
    data.forEach((user) => {
      user.name = user.firstName.concat(" ", user.lastName);
    })
    return data;
  },
});
export const useLabVisitResearcherSuggestions = labVisitResearcherSuggestionsSlice.hook;

export default {
  [labVisitSlice.name]: labVisitSlice.reducer,
  [saveLabVisitSlice.name]: saveLabVisitSlice.reducer,
  [labVisitParticipantSuggestionsSlice.name]: labVisitParticipantSuggestionsSlice.reducer,
  [labVisitResearcherSuggestionsSlice.name]: labVisitResearcherSuggestionsSlice.reducer,
};
