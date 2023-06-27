import API from 'src/modules/api';
import _range from 'lodash/range';
import _sortBy from 'lodash/sortBy';
import _round from 'lodash/round';

import createDataSlice, { DataSliceState } from 'src/modules/store/createDataSlice';
import { RootState, WithFilter, WithProcessing, WithSort } from 'src/modules/store';
import * as api from 'src/modules/api/models';
import { convertSqlUtcDateStringToTimestamp, Timestamp } from 'src/common/utils/datetime';
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
  avgRR?: number;
  avgSteps?: number;
  lastSync?: Timestamp;
  localTime?: Timestamp;
  avgSleepMins?: number;
  avgBloodPressure?: string;
  avgBloodPressureSys?: number;
  avgBloodPressureDia?: number;
  avgSpO2?: number;
  avgBG?: number;
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

interface ParticipantsListData {
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
  ['AVG_RR', 'avgRR'],
  ['AVG_SPO2', 'avgSpO2'],
  ['AVG_BG', 'avgBG'],
  ['AVG_BP', 'avgBloodPressureSys'],
  ['AVG_BP', 'avgBloodPressureDia'],
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

export const getMockUserId = (idx = 1) => `00${idx + 1}-20220512-${idx % 2 ? 'a' : 'b'}`;

export const healthDataOverviewMock = (idx = 1) =>
  ({
    userId: getMockUserId(idx),
    profiles: [
      {
        key: 'email',
        value: Random.shared.arrayElement(emailsMock),
      },
    ],
    latestAverageHR: Random.shared.num(0, 1) > 0.1 ? Random.shared.num(60, 90) : undefined,
    latestAverageRR: Random.shared.num(0, 1) > 0.1 ? Random.shared.num(60, 90) : undefined,
    latestAverageSystolicBP:
      Random.shared.num(0, 1) > 0.8 ? Random.shared.num(110, 140) : undefined,
    latestAverageDiastolicBP: Random.shared.num(0, 1) > 0.8 ? Random.shared.num(60, 80) : undefined,
    latestTotalStep: Random.shared.num(0, 1) > 0.1 ? Random.shared.int(1000, 20000) : undefined,
    lastSyncTime: new Date(Date.now() - Random.shared.int(1, 24 * 60 * 3) * 60 * 1000).toString(),
    averageSleep: Random.shared.num(300, 600),
    latestAverageSPO2: Random.shared.num(0, 1) > 0.1 ? Random.shared.num(90, 100) : undefined,
    latestAverageBG: Random.shared.num(70, 115),
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

  const latestAverageSystolicOrDiastolicBPComparator = (v: api.HealthDataOverview) =>
    v.latestAverageSystolicBP === v.latestAverageDiastolicBP
      ? v.latestAverageDiastolicBP
      : v.latestAverageSystolicBP;

  const key = {
    ID: 'userId',
    EMAIL: (v: api.HealthDataOverview) => v.profiles?.find((p) => p.key === 'email')?.value,
    LAST_SYNCED: 'lastSyncTime',
    AVG_HR: 'latestAverageHR',
    TOTAL_STEPS: 'latestTotalStep',
    AVG_RR: 'latestAverageRR',
    AVG_SPO2: 'averageOxygenSaturation',
    AVG_BG: 'latestAverageBG',
    AVG_BP: latestAverageSystolicOrDiastolicBPComparator,
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
  avgRR: roundNumber(item.latestAverageRR),
  avgSteps: item.latestTotalStep,
  lastSync: convertSqlUtcDateStringToTimestamp(item.lastSyncTime),
  localTime: convertSqlUtcDateStringToTimestamp(item.lastSyncTime),
  avgSleepMins: item.averageSleep,
  avgSpO2: item.latestAverageSPO2,
  avgBG: Number.isFinite(item.latestAverageBG)
    ? _round(item.latestAverageBG as number, 1)
    : undefined,
  avgBloodPressureSys: Number.isFinite(item.latestAverageSystolicBP)
    ? Math.round(item.latestAverageSystolicBP as number)
    : undefined,
  avgBloodPressureDia: Number.isFinite(item.latestAverageDiastolicBP)
    ? Math.round(item.latestAverageDiastolicBP as number)
    : undefined,
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
      list: transformHealthDataOverviewListFromApi(healthData.data.healthDataOverview || []),
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
