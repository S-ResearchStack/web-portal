import * as api from 'src/modules/api/models';

export const mockStudies: api.Study[] = [
  {
    id: { value: '1' },
    name: 'SleepCare Study',
    info: {
      color: 'secondarySkyBlue',
    },
    isOpen: true,
    createdAt: '2022-10-31T12:00:00',
  },
  {
    id: { value: '2' },
    name: 'Heart Health Study',
    info: {
      color: 'secondaryViolet',
    },
    isOpen: true,
    createdAt: '2021-10-31T12:00:00',
  },
  {
    id: { value: '3' },
    name: 'Some deleted study',
    info: {},
    isOpen: false,
    createdAt: '2022-03-01T12:00:00',
  },
];

export const mockStudyIds = mockStudies.map((s) => s.id.value);
