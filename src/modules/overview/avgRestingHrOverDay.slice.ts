import _range from 'lodash/range';
import _groupBy from 'lodash/groupBy';
import _mean from 'lodash/mean';
import _min from 'lodash/min';
import _max from 'lodash/max';
import _some from 'lodash/some';
import { DateTime, Duration } from 'luxon';

import API from 'src/modules/api';

import createDataSlice from 'src/modules/store/createDataSlice';
import Random from 'src/common/Random';
import { getGenderColor } from './gender';

export const getParticipantHeartRatesMock: typeof API.getParticipantHeartRates = ({
  startTime,
  endTime,
}) => {
  const startTs = DateTime.fromISO(startTime).valueOf();
  const endTs = DateTime.fromISO(endTime).valueOf();

  const r = new Random(1);

  return API.mock.response({
    rawHealthData: _range(50).map((uIdx) => ({
      userId: `user_${uIdx}`,
      profiles: [
        {
          key: 'gender',
          value: r.num() < 0.5 ? 'male' : 'female',
        },
      ],
      heartRates: _range(20).map(() => {
        const time = DateTime.fromMillis(r.int(startTs, endTs)).toUTC();
        const hourOfDay = time.hour + time.minute / 60;

        const wakeHour = r.num(6.5, 8);
        const sleepHour = r.num(20, 24);
        const bpmRange = hourOfDay < wakeHour || hourOfDay > sleepHour ? [55, 60] : [70, 75];
        const gender = r.num() < 0.5 ? 'male' : 'female';
        const bpmExtra = gender === 'female' ? 1 : 0;
        return {
          time: time.toSQL(),
          bpm: r.gaussNum({
            min: bpmRange[0] + bpmExtra,
            max: bpmRange[1] + bpmExtra,
            standardDeviation: 4,
          }),
        };
      }),
    })),
  });
};

API.mock.provideEndpoints({
  getParticipantHeartRates: getParticipantHeartRatesMock,
});

const avgRestingHrOverDaySlice = createDataSlice({
  name: 'overview/avgRestingHrOverDay',
  fetchData: async ({ studyId }: { studyId: string }) => {
    const startTime = DateTime.utc()
      .minus({ days: 1 })
      .set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
    const endTime = startTime.plus({ days: 1 });

    const {
      data: { rawHealthData: data },
    } = await API.getParticipantHeartRates({
      projectId: studyId,
      startTime: startTime.toISO(),
      endTime: endTime.toISO(),
    });

    const startTimeMs = startTime.valueOf();
    const endTimeMs = endTime.valueOf();
    const bucketMs = Duration.fromObject({ minutes: 30 }).valueOf();

    const timeBuckets = _range(startTimeMs, endTimeMs, bucketMs).map((startMs) => ({
      startMs,
      endMs: startMs + bucketMs,
    }));

    const values = data
      .reduce(
        (acc, d) => {
          const gender = d.profiles?.find((p) => p.key === 'gender')?.value;
          for (const v of d.heartRates || []) {
            if (!v.bpm || !v.time || !gender) {
              // eslint-disable-next-line no-continue
              continue;
            }

            const ts = DateTime.fromSQL(v.time).valueOf();
            acc.push({
              name: gender,
              bucketIdx: timeBuckets.findIndex((b) => ts >= b.startMs && ts < b.endMs),
              ts,
              value: Number(v.bpm),
              anomaly: false,
            });
          }
          return acc;
        },
        [] as {
          name: string;
          bucketIdx: number;
          ts: number;
          value: number;
          anomaly: boolean;
        }[]
      )
      .filter((v) => v.bucketIdx >= 0);

    const groupedValues = _groupBy(values, (v) => `${v.name}-${v.bucketIdx}`);
    const result = Object.values(groupedValues)
      .map((gv) => {
        const hrValues = gv.map((v) => v.value);
        const { bucketIdx, name } = gv[0];
        const bucket = timeBuckets[bucketIdx];

        return {
          name,
          ts: (bucket.endMs + bucket.startMs) / 2,
          value: _mean(hrValues) || 0,
          min: _min(hrValues) || 0,
          max: _max(hrValues) || 0,
          lastSync: 0,
          color: getGenderColor(name),
          highlighted: !!_some(gv, (v) => v.anomaly),
        };
      })
      .filter((v) => v.value && v.min && v.max);

    return {
      values: result,
      timeDomain: [startTimeMs, endTimeMs],
    };
  },
});

export const useAvgRestingHrOverDaySlice = avgRestingHrOverDaySlice.hook;

export default {
  [avgRestingHrOverDaySlice.name]: avgRestingHrOverDaySlice.reducer,
};
