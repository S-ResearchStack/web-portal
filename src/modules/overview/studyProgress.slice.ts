import API from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';

export const STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY = 'study_progress_last_seen_status';

type StudyProgressStatus = 'started' | 'ongoing';

const getStorageLastSeenStatusValues = () =>
  JSON.parse(localStorage.getItem(STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY) || '{}');

export const getStorageLastSeenStatus = (studyId: string) =>
  getStorageLastSeenStatusValues()[studyId];

export const setStorageLastSeenStatus = (studyId: string, lastSeenStatus: StudyProgressStatus) => {
  const storageLastSeenValues = getStorageLastSeenStatusValues();

  localStorage.setItem(
    STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY,
    JSON.stringify({
      ...storageLastSeenValues,
      [studyId]: lastSeenStatus,
    })
  );
};

const studyProgressSlice = createDataSlice({
  name: 'overview/studyProgress',
  fetchData: async (studyId: string) => {
    const {
      data: { count },
    } = await API.getUserProfilesCount({ projectId: studyId });

    return {
      status: (count || 0) > 0 ? 'ongoing' : ('started' as StudyProgressStatus),
      id: { value: studyId },
    };
  },
});

export const useStudyProgressData = studyProgressSlice.hook;

export default {
  [studyProgressSlice.name]: studyProgressSlice.reducer,
};
