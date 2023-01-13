import API from 'src/modules/api';
import _range from 'lodash/range';
import _sortBy from 'lodash/sortBy';

import createDataSlice, { DataSliceState } from 'src/modules/store/createDataSlice';
import { RootState, WithFilter, WithProcessing, WithSort } from 'src/modules/store';
import * as api from 'src/modules/api/models';
import { Timestamp } from 'src/common/utils/datetime';
import Random from 'src/common/Random';
import { ProjectIdParams } from 'src/modules/api/endpoints';
import { roundNumber } from 'src/common/utils/number';
import { SortDirectionOptions } from 'src/common/components/Table';

export const DEFAULT_OVERVIEW_PARTICIPANT_LIST_RECORDS_PER_PAGE = 10;

type OverviewParticipantItemId = api.ParticipantItemId;

export interface OverviewParticipantItem extends WithProcessing {
  id: OverviewParticipantItemId;
  email: string;
  avgBpm?: number;
  avgSteps?: number;
  lastSync: Timestamp;
  localTime: Timestamp;
  avgSleepMins?: number;
  avgBloodPressure?: string;
}

export type OverviewParticipantListSortColumn = keyof OverviewParticipantItem;

export interface OverviewParticipantListSort {
  column: OverviewParticipantListSortColumn;
  direction: SortDirectionOptions;
}

export interface OverviewParticipantListFilter {
  offset: number;
  perPage: number;
}

export interface GetParticipantListParams
  extends WithSort<OverviewParticipantListSort>,
    WithFilter<OverviewParticipantListFilter> {
  studyId: string;
}

export interface ParticipantsListData {
  total: number;
  list: OverviewParticipantItem[];
}

const sortDirectionMap = [
  ['ASC', 'asc'],
  ['DESC', 'desc'],
] as [api.HealthDataOverviewSortDirection, SortDirectionOptions][];

const sortDirectionToApi = (d: SortDirectionOptions) =>
  sortDirectionMap.find((m) => m[1] === d)?.[0] as api.HealthDataOverviewSortDirection;

const sortColumnMap = [
  ['ID', 'id'],
  ['EMAIL', 'email'],
  ['LAST_SYNCED', 'lastSync'],
  ['LAST_SYNCED', 'localTime'],
  ['AVG_HR', 'avgBpm'],
  ['TOTAL_STEPS', 'avgSteps'],
] as [api.HealthDataOverviewSortColumn, OverviewParticipantListSortColumn][];

const sortColumnToApi = (c: OverviewParticipantListSortColumn) =>
  sortColumnMap.find((m) => m[1] === c)?.[0] as api.HealthDataOverviewSortColumn;

const emailsMock = [
  'jon.snow@email.com',
  'daenerys.targaryen@email.com',
  'grey.worm@email.com',
  'arya.stark@email.com',
  'davos.seaworth@email.com',
  'cersei.lannister@email.com',
  'tyrion.lannister@email.com',
  'margaery.tyrell@email.com',
  'tormund.giantsbane@email.com',
  'liz.lorina@email.com',
];

export const healthDataOverviewMock = (idx = 1) =>
  ({
    userId: `00${idx + 1}-20220512-${idx % 2 ? 'a' : 'b'}`,
    profiles: [
      {
        key: 'email',
        value: Random.shared.arrayElement(emailsMock),
      },
    ],
    latestAverageHR: Random.shared.num(0, 1) > 0.1 ? Random.shared.num(60, 90) : undefined,
    latestAverageSystolicBP:
      Random.shared.num(0, 1) > 0.8 ? Random.shared.num(110, 140) : undefined,
    latestAverageDiastolicBP: Random.shared.num(0, 1) > 0.8 ? Random.shared.num(60, 80) : undefined,
    latestTotalStep: Random.shared.num(0, 1) > 0.1 ? Random.shared.int(1000, 20000) : undefined,
    lastSyncTime: new Date(Date.now() - Random.shared.int(1, 24 * 60 * 3) * 60 * 1000).toString(),
    averageSleep: Random.shared.num(300, 600),
  } as api.HealthDataOverview);

export const healthDataOverviewListMock = _range(
  DEFAULT_OVERVIEW_PARTICIPANT_LIST_RECORDS_PER_PAGE * 15
).map(healthDataOverviewMock);

export const getHealthDataOverviewMock: typeof API.getHealthDataOverview = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  projectId,
  limit,
  offset,
  sort,
}) => {
  let result: api.HealthDataOverview[] = [];

  const key = {
    ID: 'userId',
    EMAIL: (v: api.HealthDataOverview) => v.profiles?.find((p) => p.key === 'email')?.value,
    LAST_SYNCED: 'lastSyncTime',
    AVG_HR: 'latestAverageHR',
    TOTAL_STEPS: 'latestTotalStep',
  }[sort.column];

  result = _sortBy(healthDataOverviewListMock, [key]);
  if (sort.direction === 'DESC') {
    result = result.reverse();
  }

  result = result.slice(offset, Math.min(result.length, offset + limit));

  return API.mock.response({
    healthDataOverview: result,
  });
};

export const getUserProfilesCountMock: typeof API.getUserProfilesCount = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  projectId,
}: ProjectIdParams) => API.mock.response({ count: healthDataOverviewListMock.length });

API.mock.provideEndpoints({
  getHealthDataOverview: getHealthDataOverviewMock,
  getUserProfilesCount: getUserProfilesCountMock,
});

export const transformParticipantListSortParamsToApi = (
  sort: OverviewParticipantListSort
): api.HealthDataOverviewSort => ({
  direction: sortDirectionToApi(sort.direction) || 'ASC',
  column: sortColumnToApi(sort.column) || 'ID',
});

export const transformHealthDataOverviewItemFromApi = (
  item: api.HealthDataOverview
): OverviewParticipantItem => ({
  id: item.userId || '',
  email: item.profiles?.find((i) => i.key === 'email')?.value || '',
  avgBpm: roundNumber(item.latestAverageHR),
  avgSteps: item.latestTotalStep,
  lastSync: new Date(item.lastSyncTime || 0).valueOf(),
  localTime: new Date(item.lastSyncTime || 0).valueOf(),
  avgSleepMins: item.averageSleep,
  avgBloodPressure: (() => {
    const { latestAverageSystolicBP: sys, latestAverageDiastolicBP: dia } = item;

    if (!Number.isFinite(sys) || !Number.isFinite(dia)) {
      return undefined;
    }

    return `${Math.round(sys as number)}/${Math.round(dia as number)}`;
  })(),
});

export const transformHealthDataOverviewListFromApi = (
  items: api.HealthDataOverview[]
): OverviewParticipantItem[] => items.map(transformHealthDataOverviewItemFromApi);

const slice = createDataSlice({
  name: 'overview/participantsList',
  fetchData: async (params: GetParticipantListParams) => {
    const baseOptions = {
      projectId: params.studyId,
    };

    const getParticipantsOptions = {
      ...baseOptions,
      offset: params.filter.offset,
      limit: params.filter.perPage,
      sort: transformParticipantListSortParamsToApi(params.sort),
    };

    // prettier-ignore
    const [
      { data: { count: total } },
      healthData,
    ] = await Promise.all([
      API.getUserProfilesCount(baseOptions),
      API.getHealthDataOverview(getParticipantsOptions)
    ]);

    return {
      total,
      list: transformHealthDataOverviewListFromApi(healthData.data.healthDataOverview),
    };
  },
});

export const useParticipantList = slice.hook;

export const participantListFetchArgsSelector = (
  state: RootState
): GetParticipantListParams | null =>
  (state[slice.name] as DataSliceState<ParticipantsListData, GetParticipantListParams>).fetchArgs;

export const participantListPrevFetchArgsSelector = (
  state: RootState
): GetParticipantListParams | null =>
  (state[slice.name] as DataSliceState<ParticipantsListData, GetParticipantListParams>)
    .prevFetchArgs;

export default {
  [slice.name]: slice.reducer,
};
