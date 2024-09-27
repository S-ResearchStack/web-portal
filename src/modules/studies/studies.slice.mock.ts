import * as api from 'src/modules/api/models';

export const mockStudies: api.Study[] = [
  {
    id: '1',
    participationCode: 'secret',
    studyInfoResponse: {
      name: 'SleepCare Study',
      description: 'test study description',
      participationApprovalType: 'AUTO',
      scope: 'PRIVATE',
      stage: 'STARTED_OPEN',
      logoUrl: 'secondarySkyBlue',
      period: '100 day(s)',
      organization: 'SRV',
      requirements: [
        'Complete the survey given every day.',
        'Always wear the Galaxy Watch except when charging.'
      ],
      duration: '15m/week',
      imageUrl: 'https://test.png',
      startDate: '2023-01-01 09:55:00',
      endDate: '2050-12-31 09:55:00',
    },
    irbInfoResponse: {
      decisionType: 'APPROVED',
      decidedAt: '2024-04-07T05:35:02.620569',
      expiredAt: '2024-04-07T05:35:02.620569'
    },
    createdAt: '2022-10-31T12:00:00',
  },
  {
    id: '2',
    studyInfoResponse: {
      name: 'Heart Health Study',
      description: 'test study description',
      participationApprovalType: 'AUTO',
      scope: 'PUBLIC',
      stage: 'STARTED_OPEN',
      logoUrl: 'secondaryViolet',
      organization: 'SRA',
      requirements: ['Complete the survey given every day.'],
      period: '100 day(s)',
      imageUrl: '',
      duration: '15m/week',
    },
    irbInfoResponse: {
      decisionType: 'APPROVED',
      decidedAt: '2024-04-07T05:35:02.620569',
      expiredAt: '2024-04-07T05:35:02.620569'
    },
    createdAt: '2021-10-31T12:00:00',
  },
  {
    id: '3',
    participationCode: 'secret',
    studyInfoResponse: {
      name: 'Some deleted study',
      description: '',
      participationApprovalType: 'MANUAL',
      scope: 'PRIVATE',
      stage: 'STARTED_OPEN',
      organization: 'SRC',
      requirements: ['Complete the survey given every day.'],
      logoUrl: '',
      imageUrl: '',
      duration: '',
      period: '',
    },
    irbInfoResponse: {
      decisionType: 'APPROVED',
      decidedAt: '2024-04-07T05:35:02.620569',
      expiredAt: '2024-04-07T05:35:02.620569'
    },
  },
];

export const mockStudyIds = mockStudies.map((s) => s.id);
