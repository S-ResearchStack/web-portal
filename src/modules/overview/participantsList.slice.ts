import API from 'src/modules/api';
import _range from 'lodash/range';
import _sortBy from 'lodash/sortBy';

import createDataSlice, { DataSliceState } from 'src/modules/store/createDataSlice';
import { RootState, WithFilter, WithProcessing, WithSort } from 'src/modules/store';
import * as api from 'src/modules/api/models';
import { Timestamp } from 'src/common/utils/datetime';
import Random from 'src/common/Random';
import { ProjectIdParams } from 'src/modules/api/endpoints';
import { parseNumber } from 'src/common/utils/number';

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
}

export type OverviewParticipantListSortColumn = keyof OverviewParticipantItem;

export interface OverviewParticipantListSort {
  column: OverviewParticipantListSortColumn;
  direction: api.ParticipantListSortDirection;
}

export interface OverviewParticipantListFilter {
  page: number;
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

export const participantListItemMock = (idx = 1) =>
  ({
    user_id: `00${idx + 1}-20220512-${idx % 2 ? 'a' : 'b'}`,
    email: Random.shared.arrayElement(emailsMock),
    avg_hr_bpm: Random.shared.num(0, 1) > 0.1 ? String(Random.shared.int(60, 90)) : '',
    steps: Random.shared.num(0, 1) > 0.1 ? String(Random.shared.int(1000, 20000)) : '',
    last_synced: new Date(Date.now() - Random.shared.int(1, 24 * 60 * 3) * 60 * 1000).toString(),
    avg_sleep_mins: Random.shared.num(300, 600).toString(),
  } as api.ParticipantListItemSqlRow);

export const participantListMock = _range(
  DEFAULT_OVERVIEW_PARTICIPANT_LIST_RECORDS_PER_PAGE * 15
).map(participantListItemMock);

API.mock.provideEndpoints({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getParticipantsTotalItems({ projectId }: ProjectIdParams) {
    return API.mock.response([{ total: String(participantListMock.length) }]);
  },
  getParticipants({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId,
    limit,
    offset,
    sort,
  }: api.GetParticipantListRequest & ProjectIdParams) {
    let result: api.ParticipantListItemSqlRow[] = [];

    result =
      sort.direction === 'asc'
        ? _sortBy(participantListMock, [sort.column])
        : _sortBy(participantListMock, [sort.column]).reverse();

    result = result.slice(offset, Math.min(result.length, offset + limit));

    return API.mock.response(result);
  },
});

export const transformParticipantListSortParamsToApi = (
  sort: OverviewParticipantListSort
): api.ParticipantListSort => ({
  ...sort,
  column: (
    {
      id: 'user_id',
      email: 'email',
      lastSync: 'last_synced',
      localTime: 'last_synced',
      avgBpm: 'avg_hr_bpm',
      avgSteps: 'steps',
    } as Record<OverviewParticipantListSortColumn, api.ParticipantListSort['column']>
  )[sort.column],
});

export const transformParticipantListItemFromApi = (
  item: api.ParticipantListItemSqlRow
): OverviewParticipantItem => ({
  id: item.user_id,
  email: item.email,
  avgBpm: parseNumber(item.avg_hr_bpm, { round: true }),
  avgSteps: parseNumber(item.steps, { round: true }),
  lastSync: new Date(item.last_synced).valueOf(),
  localTime: new Date(item.last_synced).valueOf(),
  avgSleepMins: parseNumber(item.avg_sleep_mins, { round: true }),
});

const transformParticipantListFromRaw = (
  items: api.ParticipantListItemSqlRow[]
): OverviewParticipantItem[] => items.map(transformParticipantListItemFromApi);

const slice = createDataSlice({
  name: 'overview/participantsList',
  fetchData: async (params: GetParticipantListParams) => {
    const baseOptions = {
      projectId: params.studyId,
    };

    const getParticipantsOptions = {
      ...baseOptions,
      offset: params.filter.perPage * (params.filter.page - 1),
      limit: params.filter.perPage,
      sort: transformParticipantListSortParamsToApi(params.sort),
    };

    // prettier-ignore
    const [
      { data: [{ total }] },
      { data: list },
    ] = await Promise.all([
      API.getParticipantsTotalItems(baseOptions),
      API.getParticipants(getParticipantsOptions),
    ]);

    return {
      total: parseInt(total, 10),
      list: transformParticipantListFromRaw(list),
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
