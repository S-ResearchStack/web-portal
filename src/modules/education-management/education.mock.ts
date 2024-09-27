import _range from 'lodash/range';
import _uniqueId from 'lodash/uniqueId';
import API, { EducationalListResponse, BlockContentType } from 'src/modules/api';

const mockDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const makeBlockItem = (type: BlockContentType) => {
  switch (type) {
    case 'IMAGE':
      return {
        id: _uniqueId(),
        type: 'IMAGE',
        images: [
          {
            id: _uniqueId(),
            url: 'education_SCRATCH',
            caption: '',
          },
        ],
        sequence: 0
      };

    case 'VIDEO':
      return {
        id: _uniqueId(),
        type: 'VIDEO',
        url: 'education_VIDEO',
        text: "",
        sequence: 0
      };

    default:
      return {
        id: _uniqueId(),
        type: 'TEXT',
        text: "text",
        sequence: 0
      }
  };
}

const mockBlocks = _range(3).map((idx) => {
  const type = (idx % 3 === 0 && 'TEXT') || (idx % 3 === 1 && 'IMAGE') || 'VIDEO';
  return makeBlockItem(type);
});

const mockContent = {
  SCRATCH: {
    coverImage: 'education_SCRATCH',
    description: mockDescription,
    blocks: mockBlocks
  },
  PDF: {
    id: _uniqueId(),
    url: 'education_PDF',
    description: mockDescription,
    text: mockDescription,
    type: "TEXT",
  },
  VIDEO: {
    id: _uniqueId(),
    url: 'education_VIDEO',
    description: mockDescription,
    text: mockDescription,
    type: "TEXT",
  }
}

const mockEducationalContents = _range(16).map((idx) => {
  const type = (idx % 3 === 0 && 'SCRATCH') || (idx % 4 === 0 && 'PDF') || 'VIDEO';

  return {
    id: idx === 1 ? 'test-id' : _uniqueId(),
    title:
      idx % 3 === 0
        ? `${idx} How can a stroke be prevented?`
        : `${idx} The placeholder for title maximum two lines${idx === 2 ? ' text extension' : ''}`,
    status: idx % 2 === 0 ? ('DRAFT' as const) : ('PUBLISHED' as const),
    type,
    modifiedAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt:
      idx % 2 === 0 ? undefined : new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Heart Health',
    content: mockContent[type]
  };
}) as EducationalListResponse;

API.mock.provideEndpoints({
  getEducations() {
    return API.mock.response(mockEducationalContents);
  },
  getEducation({ educationId }) {
    const education = mockEducationalContents.find((e) => e.id === educationId);
    return !education
      ? API.mock.failedResponse({ status: 404, message: 'Not found' })
      : API.mock.response(education);
  },
  createEducation({studyId }, body) {
    const education = mockEducationalContents.find((e) => e.title === body.title);
    if (!!education) {
      return API.mock.failedResponse({ status: 409 });
    };
    const id = _uniqueId();
    mockEducationalContents.push({
      id,
      ...body,
    });
    return API.mock.response({ id });
  },
  updateEducation({ educationId }, body) {
    const idx = mockEducationalContents.findIndex((e) => e.id === educationId);
    if (idx !== -1) {
      mockEducationalContents[idx] = {
        ...mockEducationalContents[idx],
        ...body,
        modifiedAt: new Date().toISOString()
      };
      return API.mock.response(undefined);
    }
    return API.mock.failedResponse({ status: 404 });
  },
  deleteEducation({ educationId }) {
    const i = mockEducationalContents.findIndex((c) => c.id === educationId);
    if (i < 0) return API.mock.failedResponse({ status: 404 });
    mockEducationalContents.splice(i, 1);
    return API.mock.response(undefined);
  },
});
