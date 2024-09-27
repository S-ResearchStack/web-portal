import { surveyUpdateToApi } from './surveyConversion';
import { SurveyItem } from './surveyEditor.slice';

const survey: SurveyItem = {
  studyId: 'test',
  id: 'id',
  title: 'Survey title',
  description: 'Survey description',
  questions: [
    {
      id: 'survey150',
      children: [
        {
          type: 'single',
          id: 'question147',
          title: 'Q1',
          description: '',
          answers: [
            {
              id: 'question148',
              value: 'Enter option 1'
            },
            {
              id: 'question149',
              value: 'Enter option 2'
            }
          ],
          options: {
            optional: false,
            includeOther: false
          },
        },
        {
          id: 'survey155',
          title: 'Q2',
          description: '',
          type: 'multiple',
          options: {
            optional: true,
            includeOther: false
          },
          answers: [
            {
              id: 'question148',
              value: 'Enter option 1'
            },
            {
              id: 'question149',
              value: 'Enter option 2'
            }
          ],
        },
        {
          id: 'survey161',
          title: 'Q3',
          description: '',
          type: 'dropdown',
          options: {
            optional: false,
            includeOther: false
          },
          answers: [
            {
              id: 'question148',
              value: 'Enter option 1'
            },
            {
              id: 'question149',
              value: 'Enter option 2'
            }
          ]
        },
        {
          id: 'survey167',
          title: 'Q4',
          description: 'Please select one option.',
          type: 'images',
          options: {
            optional: false,
            imageLabels: true,
            multiSelect: false
          },
          answers: [
            {
              id: 'question231',
              image: '',
              value: '',
              touched: true
            },
            {
              id: 'question232',
              image: '',
              value: '',
              touched: true
            },
            {
              id: 'question233',
              image: '',
              value: '',
              touched: false
            }
          ],
        }
      ]
    },
    {
      id: 'survey177',
      children: [
        {
          id: 'question174',
          title: 'Q5',
          description: '',
          type: 'slider',
          options: {
            optional: false
          },
          answers: [
            {
              id: 'question243',
              label: '',
              value: 0
            },
            {
              id: 'question244',
              label: '',
              value: 10
            }
          ]
        },
        {
          id: 'survey206',
          title: 'Q6',
          description: '',
          type: 'open-ended',
          answers: [],
          options: {
            optional: true
          },
        },
        {
          id: 'survey212',
          title: 'Q7',
          description: '',
          type: 'date-time',
          options: {
            optional: false,
            isRange: true
          },
          answers: [],
          config: {
            isDate: true,
            isTime: true
          },
        },
        {
          id: 'survey218',
          title: 'Q8',
          description: '',
          type: 'rank',
          options: {
            optional: false
          },
          answers: [
            {
              id: 'question175',
              value: 'Enter option 1'
            },
            {
              id: 'question176',
              value: 'Enter option 2'
            }
          ]
        }
      ],
    }
  ]
};

describe('surveyUpdateToApi', () => {
  it('should convert survey', () => {
    const surveyToApi = surveyUpdateToApi(survey);
    expect(surveyToApi).toEqual({
      title: 'Survey title',
      description: 'Survey description',
      task: {
        sections: expect.any(Object)
      }
    });
    expect(surveyToApi.task.sections.length).toEqual(2);
    expect(surveyToApi.task.sections[0].questions.length).toEqual(4);
  });
});
