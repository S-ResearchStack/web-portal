import _range from 'lodash/range';
import _uniqueId from 'lodash/uniqueId';
import { DateTime } from 'luxon';
import API, {
  PublicationContentItem,
  PublicationContentType,
  EducationListSliceFetchArgs,
  Publication,
  PublicationContentSource,
  PublicationStatus,
} from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';
import { RootState } from 'src/modules/store';
import { sortTaskList } from 'src/modules/study-management/user-management/common/utils';
import { newId } from './education-editor/utils';

export interface PublicationListItem {
  id: string;
  title: string;
  source: PublicationContentSource;
  modifiedAt?: number;
  publishedAt?: number;
  status: PublicationStatus;
  revisionId: number;
}

export interface EducationList {
  drafts: PublicationListItem[];
  published: PublicationListItem[];
}

const makeMockPublicationsItem = (
  type: PublicationContentType,
  sequence: number,
  isEmpty: boolean
): PublicationContentItem => {
  if (type === 'IMAGE') {
    return {
      id: newId(),
      type: 'IMAGE',
      images: isEmpty
        ? []
        : [
            {
              id: newId(),
              image: 'https://picsum.photos/500',
              caption: 'heart health',
            },
          ],
      sequence,
    };
  }

  return {
    id: newId(),
    type: 'TEXT',
    text: 'The heart is essentially a pump that circulates blood to your entire body. First oxygen is absorbed through the lungs. Then oxygen rich blood and nutrients (both required as energy) are pumped throughout the body for vital functioning of each organ.',
    sequence,
  };
};

export const makePublicationsItem = (
  type: PublicationContentType,
  sequence: number
): PublicationContentItem => {
  if (type === 'IMAGE') {
    return {
      id: newId(), // TODO get from api??
      type: 'IMAGE',
      images: [],
      sequence,
    };
  }

  return {
    id: newId(), // TODO get from api?
    type: 'TEXT',
    text: '',
    sequence,
  };
};

const mockEducationContent = (source: PublicationContentSource) =>
  ['VIDEO', 'PDF'].includes(source)
    ? [makePublicationsItem('TEXT', 0)]
    : (['TEXT', 'TEXT', 'IMAGE', 'IMAGE', 'TEXT'] as PublicationContentType[]).map(
        makePublicationsItem
      );

export const scratchSourceUrl = 'https://picsum.photos/500';
export const pdfSourceUrl = 'https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK';
export const videoSourceUrl =
  'https://ucsf-eureka-static-test.s3.us-east-2.amazonaws.com/flower.mp4';

export const mockPublications = _range(30).map((idx) => {
  const source = (idx % 3 === 0 && 'SCRATCH') || (idx % 4 === 0 && 'PDF') || 'VIDEO';

  return {
    id: idx === 1 ? 'test-id' : _uniqueId(),
    title:
      idx % 3 === 0
        ? `${idx} How can a stroke be prevented?`
        : `${idx} The placeholder for title maximum two lines${idx === 2 ? ' text extension' : ''}`,
    status: idx % 2 === 0 ? ('DRAFT' as const) : ('PUBLISHED' as const),
    source,
    modifiedAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt:
      idx % 2 === 0 ? undefined : new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Heart Health',
    attachment: {
      SCRATCH: 'https://picsum.photos/500',
      PDF: pdfSourceUrl,
      VIDEO: videoSourceUrl,
    }[source],
    educationContent: mockEducationContent(source).map((ec, i) =>
      makeMockPublicationsItem(ec.type, i, false)
    ),
  };
}) as Publication[];

export const findMockPublicationById = (id: string) => mockPublications.find((p) => p.id === id);

API.mock.provideEndpoints({
  getPublications() {
    return API.mock.response(mockPublications);
  },
});

const parseDateFromEducationListApi = (date: string | undefined) =>
  date ? DateTime.fromISO(date, { zone: 'utc' }).toMillis() : undefined; // TODO check when education api will be ready

const transformEducationListFromApi = ({
  publications,
}: {
  publications: Publication[];
}): EducationList => {
  const educationList: PublicationListItem[] = (
    Array.isArray(publications) ? publications : []
  ).map((p) => ({
    ...p,
    modifiedAt: parseDateFromEducationListApi(p.modifiedAt),
    publishedAt: parseDateFromEducationListApi(p.publishedAt),
  }));

  return sortTaskList({
    drafts: educationList.filter((p) => p.status === 'DRAFT'),
    published: educationList.filter((p) => p.status === 'PUBLISHED'),
  });
};

export const educationListSlice = createDataSlice({
  name: 'studyManagement/educationList',
  fetchData: async ({ projectId }: EducationListSliceFetchArgs) => {
    const [{ data: publications }] = await Promise.all([API.getPublications({ projectId })]);

    return transformEducationListFromApi({
      publications,
    });
  },
});

export const useEducationListData = educationListSlice.hook;

export const educationListDataSelector = (state: RootState): EducationList | undefined =>
  state[educationListSlice.name]?.data;

export default {
  [educationListSlice.name]: educationListSlice.reducer,
};
