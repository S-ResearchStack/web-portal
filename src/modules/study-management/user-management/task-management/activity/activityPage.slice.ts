import _groupBy from 'lodash/groupBy';
import _values from 'lodash/values';
import _entries from 'lodash/entries';
import _uniqBy from 'lodash/uniqBy';
import { DateTime, Duration } from 'luxon';

import createDataSlice from 'src/modules/store/createDataSlice';
import API from 'src/modules/api';
import { Timestamp } from 'src/common/utils/datetime';
import {
  ActivityTaskItemResponseColumn,
  ActivityTaskItemResponse,
  ActivityTaskResponse,
  TaskItemResponse,
} from 'src/modules/api/models/tasks';
import { mockResponses } from 'src/modules/study-management/user-management/task-management/activity/activityPage.mock';
import { getObjectDownloadUrl, listObjects } from 'src/modules/object-storage/utils';
import { mockTasks } from './activitiesList.slice';

export type ActivityResultsActivityInfo = {
  id: string;
  revisionId: number;
  title: string;
  publishedAt: Timestamp;
};

type ActivityResultsDataGroup = {
  id: string;
  label: string;
  extraLabel?: string;
  count: number;
  total: number;
  percentage: number;
};

export type ActivityResultsAnalytics = {
  targetParticipants: number;
  completedParticipants: number;
  responseRatePercents: number;
  avgCompletionTimeMs: number;
  byGender: ActivityResultsDataGroup[];
  byAge: ActivityResultsDataGroup[];
};

export type ActivityResults = {
  activityInfo: ActivityResultsActivityInfo;
  analytics?: ActivityResultsAnalytics;
  responses?: ActivityTaskResponse;
};

API.mock.provideEndpoints({
  getActivityTaskItemResults({ id }) {
    const task = mockTasks.find((t) => t.id === id);
    const activityType = task?.items[0].contents.type;

    return API.mock.response(
      activityType && mockResponses[activityType]
        ? mockResponses[activityType].data
        : mockResponses.TAPPING_SPEED.data
    ) as never;
  },
  getTaskCompletionTime() {
    return API.mock.response({
      taskResults: [
        {
          completionTime: {
            averageInMS: Duration.fromObject({
              minutes: 34,
            }).toMillis(),
          },
        },
      ],
    });
  },
});

const calcPercentage = (v?: number, total?: number) =>
  v === undefined || total === undefined || total === 0 ? 0 : Math.round((v * 100) / total);

export type GetActivityDetailsDataParams = { id: string; studyId: string };

const SIMPLE_KEYS = ['left', 'right', 'counts', 'result', 'time(s)', 'time(ms)'];
export const DOWNLOAD_FILE_KEYS = ['recording'];
const DOWNLOAD_JSON_KEYS = [
  'gait_balance_accelerometer',
  'gait_balance_gyroscope',
  'gait_balance_times(ms)',
  'left_accelerometer',
  'left_gyroscope',
  'left_times(ms)',
  'right_accelerometer',
  'right_gyroscope',
  'right_times(ms)',
];
export const DATA_KEY = 'data';
export const EXPORTED_DATA_KEY = 'exported_data';

export const convertResponseData = async (
  surveyResponse: TaskItemResponse[],
  studyId: string,
  activityId: string
) => {
  let columns: ActivityTaskItemResponseColumn[] = [];
  const responses: ActivityTaskItemResponse[] = [];

  const storageObjects = await listObjects({
    studyId,
    path: `tasks/${activityId}/results`,
  });

  for (const sr of surveyResponse) {
    const r: ActivityTaskItemResponse = {
      userId: sr.userId,
      result: {},
      profiles: sr.profiles,
    };

    try {
      const data = JSON.parse(sr.result as string);

      const showableJson = Object.keys(data).some((k) => DOWNLOAD_JSON_KEYS.includes(k));

      if (sr.result) {
        const dataKey = showableJson ? DATA_KEY : EXPORTED_DATA_KEY;
        columns.push({
          key: dataKey,
          label: dataKey,
        });
        const dataToExport = Object.keys(data)
          .filter((key) => !DOWNLOAD_FILE_KEYS.includes(key))
          .map((filteredKey) => ({ [filteredKey]: data[filteredKey] }));

        if (Object.keys(dataToExport).length) {
          const fileName = `${dataKey}.json`;
          const blob = new Blob([JSON.stringify(dataToExport)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const { size } = blob;

          r.result[dataKey] = { label: fileName, url, fileSize: size };
        }
      }

      for (const dk of Object.keys(data)) {
        if (SIMPLE_KEYS.includes(dk)) {
          columns.push({
            key: dk,
            label: dk,
          });

          r.result[dk] = { label: `${data[dk]}`, url: '', fileSize: 0 };
        }
        if (DOWNLOAD_FILE_KEYS.includes(dk)) {
          columns.push({
            key: dk,
            label: dk,
          });

          const pathToFind = `tasks/${activityId}/results/${sr.userId}/audio`;
          const file = storageObjects.find((f) => f.name.includes(pathToFind));
          // eslint-disable-next-line no-await-in-loop
          const url = file ? await getObjectDownloadUrl({ studyId, name: file?.name }) : '';

          r.result[dk] = {
            label: `${file?.name.replace(/^.*[\\/]/, '')}`,
            url,
            fileSize: file ? file.sizeBytes : 0,
          };
        }
      }
    } catch {
      // ignore
    }

    responses.push(r);
  }

  columns = _uniqBy(columns, ({ key }) => key);

  return { columns, responses };
};

const activityDetailsSlice = createDataSlice({
  name: 'studyManagement/activity',
  fetchData: async ({ id, studyId }: GetActivityDetailsDataParams) => {
    const [task] = (await API.getActivityTask({ id, projectId: studyId })).data;

    const [
      {
        data: { surveyResponse },
      },
      { data: totalParticipantsResponse },
      {
        data: { taskResults: completionTimeData },
      },
    ] = await Promise.all([
      API.getActivityTaskItemResults({
        id,
        projectId: studyId,
      }),
      API.getUserProfilesCount({ projectId: studyId }),
      API.getTaskCompletionTime({
        id,
        projectId: studyId,
      }),
    ]);

    const numTotalParticipants = Number(totalParticipantsResponse.count);
    const participants = _values(_groupBy(surveyResponse, (r) => r.userId)).map((r) => r[0]);

    return {
      activityInfo: {
        id,
        revisionId: task.revisionId,
        title: task.title,
        publishedAt: DateTime.fromISO(task.createdAt).toMillis(),
      },
      analytics: {
        targetParticipants: numTotalParticipants,
        completedParticipants: participants.length,
        responseRatePercents: calcPercentage(participants.length, numTotalParticipants),
        avgCompletionTimeMs: Number(completionTimeData?.[0]?.completionTime?.averageInMS ?? 0),
        byGender: _entries(
          _groupBy(participants, (p) => p.profiles?.find((v) => v.key === 'gender')?.value || '')
        ).map(([gender, ps]) => ({
          id: gender,
          label: gender,
          value: ps.length,
          count: ps.length,
          total: participants.length,
          percentage: calcPercentage(ps.length, participants.length),
        })),
        byAge: [
          [20, 39],
          [40, 59],
          [60, 79],
          [80, 100],
        ].map(([min, max]) => {
          const ps = participants.filter((p) => {
            const age = Number(p.profiles?.find((v) => v.key === 'age')?.value || 0);
            return age >= min && age < max;
          });

          const label = `${min}-${max}`;
          return {
            id: label,
            label,
            value: ps.length,
            count: ps.length,
            total: participants.length,
            percentage: calcPercentage(ps.length, participants.length),
          };
        }),
      },
      responses: await convertResponseData(surveyResponse || [], studyId, id),
    } as ActivityResults;
  },
});

export const useActivityDetailsData = activityDetailsSlice.hook;

export default {
  [activityDetailsSlice.name]: activityDetailsSlice.reducer,
};
