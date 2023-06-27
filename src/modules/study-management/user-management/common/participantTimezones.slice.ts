import createDataSlice from 'src/modules/store/createDataSlice';

export const participantsTimeZonesMock = [
  'Europe/Paris',
  'America/New_York',
  'Europe/Malta',
  'Atlantic/Bermuda',
  'Asia/Seoul',
];

const participantsTimeZonesSlice = createDataSlice({
  name: 'survey/participantsTimeZones',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fetchData: async (_: { studyId: string }) => participantsTimeZonesMock,
});

export const useParticipantsTimeZones = participantsTimeZonesSlice.hook;

export default {
  [participantsTimeZonesSlice.name]: participantsTimeZonesSlice.reducer,
};
