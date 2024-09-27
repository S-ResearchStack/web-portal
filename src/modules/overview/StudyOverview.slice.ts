import { DateTime } from 'luxon';
import { theme } from 'src/styles';
import createDataSlice from 'src/modules/store/createDataSlice';
import API, { BasicInfoObject, GetStudyResponse, GetUsersResponse, SubjectInfoListResponse } from 'src/modules/api';
import { SubjectStatus } from '../study-data/studyData.enum';
import { capitalizeFirstLetter } from './utils';

export const STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY = 'study_progress_last_seen_status';
const DATE_FORMAT = 'yyyy/MM/dd';
const DATE_WITH_HOUR_FORMAT = 'yyyy-MM-dd h:mm:ss';

const getStorageLastSeenStatusValues = () =>
  JSON.parse(localStorage.getItem(STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY) || '{}');

export const getStorageLastSeenStatus = (studyId: string) =>
  getStorageLastSeenStatusValues()[studyId];

export const setStorageLastSeenStatus = (studyId: string, lastSeenStatus: string) => {
  const storageLastSeenValues = getStorageLastSeenStatusValues();

  localStorage.setItem(
    STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY,
    JSON.stringify({
      ...storageLastSeenValues,
      [studyId]: lastSeenStatus,
    })
  );
};

const calTotalDuration = (value?: string) => {
  if (!value) return '- day(s)';

  const today = DateTime.now().startOf('day');
  const startDate = value
    ? DateTime.fromFormat(value, DATE_WITH_HOUR_FORMAT)
    : today;
  const createdAtDate =
    DateTime.fromMillis(startDate.valueOf() || Date.now().valueOf()).startOf('day')
  const diff = value
    ? today.diff(createdAtDate.minus({ days: 1 }), ['years', 'days'])
    : { years: 0, days: 0 };
  return diff.years > 0 ? `${diff.years} year(s) and ${diff.days} day(s)` : `${diff.days} day(s)`;
}

const getURL = async (studyId: string, filePath: string) => {
  const { data: urlList } = await API.getFileDownloadUrls({ studyId, filePaths: [filePath] });
  return urlList[0].url;
}

export const transformStudyFromApi = async (data: GetStudyResponse) => {
  const { id, participationCode, studyInfoResponse } = data;
  const imageURL = studyInfoResponse.imageUrl
    ? await getURL(id, `${studyInfoResponse.imageUrl}`)
    : "";
  const logoURL = studyInfoResponse.logoUrl && !Object.keys(theme.colors).includes(studyInfoResponse.logoUrl)
    ? await getURL(id, `${studyInfoResponse.logoUrl}`)
    : studyInfoResponse.logoUrl;

  const study: BasicInfoObject = {
    id,
    imageURL,
    logoURL,
    name: studyInfoResponse.name,
    description: studyInfoResponse.description,
    stage: studyInfoResponse.stage,
    scope: studyInfoResponse.scope,
    participationApprovalType: studyInfoResponse.participationApprovalType,
    organization: studyInfoResponse.organization,
    duration: studyInfoResponse.duration,
    period: studyInfoResponse.period,
    participationCode: participationCode || undefined,
    requirements: studyInfoResponse.requirements || [],
    startDate: studyInfoResponse?.startDate && DateTime
      .fromJSDate(new Date(studyInfoResponse?.startDate))
      .toFormat(DATE_FORMAT) || '',
    endDate: studyInfoResponse?.endDate && DateTime
      .fromJSDate(new Date(studyInfoResponse?.endDate))
      .toFormat(DATE_FORMAT) || '',
    totalDuration: calTotalDuration(studyInfoResponse?.startDate),
  }
  return study;
};

const transformSubjectFromApi = (data: SubjectInfoListResponse) => {
  const statusCount = data.reduce((prev, { status }) => {
    const count = prev[status] == undefined ? 1 : prev[status] + 1;
    return { ...prev, [status]: count };
  }, {
    [SubjectStatus.PARTICIPATING]: 0,
    [SubjectStatus.COMPLETED]: 0,
    [SubjectStatus.WITHDRAWN]: 0,
    [SubjectStatus.DROP]: 0,
  } as Record<string, number>);
  const list = Object.keys(statusCount).map((status) => ({
    key: `${capitalizeFirstLetter(status)} (${statusCount[status as SubjectStatus]})`,
    value: ' '
  }));
  return list;
};

const transformUserFromApi = (data: GetUsersResponse) => {
  const roleCount = data.reduce((prev, { roles = [] }) => {
    const newCount = { ...prev };
    roles.forEach(role => {
      const count = newCount[role] == undefined ? 1 : newCount[role] + 1;
      newCount[role] = count;
    })
    return newCount;
  }, {
    'studyAdmin': 0,
    'studyManager': 0,
    'studyResearcher': 0,
  } as Record<string, number>);
  const roleLabelsMap: Record<string, string> = {
    'studyAdmin': 'Admin',
    'studyManager': 'Manager',
    'studyResearcher': 'Researcher'
  };
  const list = Object.keys(roleCount).map((role) => ({
    key: `${roleLabelsMap[role] || role} (${roleCount[role]})`,
    value: ' '
  }));
  return list;
};

const studyOverviewSlice = createDataSlice({
  name: 'overview/studyProgress',
  fetchData: async (studyId: string) => {
    const [
      studyResponse,
      subjectInfoListtResponse,
      usersResponse,
    ] = await Promise.all([
      API.getStudy({ studyId }),
      API.getSubjectInfoList({ studyId, includeTaskRecord: true }),
      API.getUsers({ studyId }),
    ]);

    const study = await transformStudyFromApi(studyResponse.data);
    const investigator = transformUserFromApi(usersResponse.data);
    const subject = transformSubjectFromApi(subjectInfoListtResponse.data);
    return {
      study,
      subject,
      investigator
    }
  },
});

export const useStudyOverviewData = studyOverviewSlice.hook;

export default {
  [studyOverviewSlice.name]: studyOverviewSlice.reducer,
};
