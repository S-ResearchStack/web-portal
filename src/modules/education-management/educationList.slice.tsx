
import { RootState } from 'src/modules/store';
import { StudyIdParams } from 'src/modules/api/endpoints';
import createDataSlice from 'src/modules/store/createDataSlice';
import { parseDateFromApi } from 'src/common/utils/datetime';
import { sortTaskList } from 'src/modules/common/utils';
import API, {
  EducationalContentType,
  EducationalContentStatus,
  EducationalResponse
} from 'src/modules/api';

import './education.mock';

export interface EducationalContentListItem {
  id: string;
  title: string;
  type: EducationalContentType;
  modifiedAt?: number;
  publishedAt?: number;
  status: EducationalContentStatus;
}

export interface EducationalContentList {
  drafts: EducationalContentListItem[];
  published: EducationalContentListItem[];
}

const transformEducationListFromApi = ({
  educationalContents,
}: {
  educationalContents: EducationalResponse[];
}): EducationalContentList => {
  const educationalContentList: EducationalContentListItem[] = (
    Array.isArray(educationalContents) ? educationalContents : []
  ).map((p) => ({
    ...p,
    modifiedAt: parseDateFromApi(p.modifiedAt),
    publishedAt: parseDateFromApi(p.publishedAt),
  }));

  return sortTaskList({
    drafts: educationalContentList.filter((p) => p.status === 'DRAFT'),
    published: educationalContentList.filter((p) => p.status === 'PUBLISHED'),
  });
};

export const educationListSlice = createDataSlice({
  name: 'education/educationList',
  fetchData: async ({ studyId }: StudyIdParams) => {
    const { data: educationalContents } = await API.getEducations({ studyId });

    return transformEducationListFromApi({
      educationalContents,
    });
  },
});

export const useEducationList = educationListSlice.hook;

export const educationListDataSelector = (state: RootState): EducationalContentList | undefined =>
  state[educationListSlice.name]?.data;

export default {
  [educationListSlice.name]: educationListSlice.reducer,
};
