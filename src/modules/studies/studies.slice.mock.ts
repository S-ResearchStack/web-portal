import * as api from 'src/modules/api/models';

export const mockStudies: api.Study[] = [
  {
    id: { value: '1' },
    name: 'SleepCare Study',
    info: {
      color: 'secondarySkyBlue',
    },
    isOpen: true,
  },
  {
    id: { value: '2' },
    name: 'Heart Health Study',
    info: {
      color: 'secondaryViolet',
    },
    isOpen: true,
  },
  {
    id: { value: '3' },
    name: 'Some deleted study',
    info: {},
    isOpen: false,
  },
];

export const mockStudyIds = mockStudies.map((s) => s.id.value);
