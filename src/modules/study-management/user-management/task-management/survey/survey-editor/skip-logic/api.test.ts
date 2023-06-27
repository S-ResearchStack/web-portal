import { QuestionType } from '../questions';
import { transformConditionsToApi, transformConditionsFromApi } from './api';
import { SkipLogicCondition } from './types';

describe('skip logic expression conversion', () => {
  const consoleErrorMock = jest.spyOn(console, 'error');

  beforeEach(() => {
    consoleErrorMock.mockClear();
  });

  const answers = [
    {
      id: '1',
      value: 'A1',
    },
    {
      id: '2',
      value: 'A2',
    },
    {
      id: '3',
      value: 'A3',
    },
    {
      id: '4',
      value: 'A4',
    },
    {
      id: '5',
      value: 'A5',
    },
  ];

  const validConversions: {
    expressionSingle: string;
    expressionMultiple: string;
    conditions: SkipLogicCondition[];
  }[] = [
    {
      expressionSingle: '',
      expressionMultiple: '',
      conditions: [],
    },
    {
      expressionSingle: 'eq val1 "A1"',
      expressionMultiple: 'contains val1 "A1"',
      conditions: [
        {
          id: '',
          type: 'specific_option',
          optionCondition: 'selected',
          optionId: '1',
          clause: 'and',
        },
      ],
    },
    {
      expressionSingle: 'and eq val1 "A1" gt cnt1 2',
      expressionMultiple: 'and contains val1 "A1" gt cnt1 2',
      conditions: [
        {
          id: '',
          type: 'specific_option',
          optionCondition: 'selected',
          optionId: '1',
          clause: 'and',
        },
        {
          id: '',
          type: 'selected_count',
          countCondition: 'greater',
          count: 2,
          clause: 'and',
        },
      ],
    },
    {
      expressionSingle: 'or neq cnt1 0 gt cnt1 2',
      expressionMultiple: 'or neq cnt1 0 gt cnt1 2',
      conditions: [
        {
          id: '',
          type: 'selected_count',
          countCondition: 'not_equal',
          count: 0,
          clause: 'or',
        },
        {
          id: '',
          type: 'selected_count',
          countCondition: 'greater',
          count: 2,
          clause: 'and',
        },
      ],
    },
    {
      expressionSingle: 'or and eq val1 "A1" neq val1 "A2" lte cnt1 3',
      expressionMultiple: 'or and contains val1 "A1" notcontains val1 "A2" lte cnt1 3',
      conditions: [
        {
          id: '',
          type: 'specific_option',
          optionCondition: 'selected',
          optionId: '1',
          clause: 'and',
        },
        {
          id: '',
          type: 'specific_option',
          optionCondition: 'not_selected',
          optionId: '2',
          clause: 'or',
        },
        {
          id: '',
          type: 'selected_count',
          countCondition: 'less_or_equal',
          count: 3,
          clause: 'and',
        },
      ],
    },
    {
      expressionSingle: 'or eq cnt1 1 or neq cnt1 2 lt cnt1 4',
      expressionMultiple: 'or eq cnt1 1 or neq cnt1 2 lt cnt1 4',
      conditions: [
        {
          id: '',
          type: 'selected_count',
          countCondition: 'equal',
          count: 1,
          clause: 'or',
        },
        {
          id: '',
          type: 'selected_count',
          countCondition: 'not_equal',
          count: 2,
          clause: 'or',
        },
        {
          id: '',
          type: 'selected_count',
          countCondition: 'less',
          count: 4,
          clause: 'and',
        },
      ],
    },
    {
      expressionSingle: 'or and eq val1 "A1" neq val1 "A2" and lte cnt1 3 gt cnt1 1',
      expressionMultiple:
        'or and contains val1 "A1" notcontains val1 "A2" and lte cnt1 3 gt cnt1 1',
      conditions: [
        {
          id: '',
          type: 'specific_option',
          optionCondition: 'selected',
          optionId: '1',
          clause: 'and',
        },
        {
          id: '',
          type: 'specific_option',
          optionCondition: 'not_selected',
          optionId: '2',
          clause: 'or',
        },
        {
          id: '',
          type: 'selected_count',
          countCondition: 'less_or_equal',
          count: 3,
          clause: 'and',
        },
        {
          id: '',
          type: 'selected_count',
          countCondition: 'greater',
          count: 1,
          clause: 'and',
        },
      ],
    },
  ];

  it.each(validConversions)(
    'converts from api string to conditions ($expressionSingle) for single selection',
    ({ expressionSingle, conditions }) => {
      let resConditions = transformConditionsFromApi('single', expressionSingle, answers);
      resConditions.forEach((c) => {
        c.id = '';
      });
      expect(resConditions).toEqual(conditions);
      expect(consoleErrorMock).not.toHaveBeenCalled();

      resConditions = transformConditionsFromApi('dropdown', expressionSingle, answers);
      resConditions.forEach((c) => {
        c.id = '';
      });
      expect(resConditions).toEqual(conditions);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    }
  );

  it.each(validConversions)(
    'converts from api string to conditions ($expressionMultiple) for multi selection',
    ({ expressionMultiple, conditions }) => {
      const resConditions = transformConditionsFromApi('multiple', expressionMultiple, answers);
      resConditions.forEach((c) => {
        c.id = '';
      });
      expect(resConditions).toEqual(conditions);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    }
  );

  it.each(validConversions)(
    'converts from conditions to api string ($expressionSingle) for single selection',
    ({ expressionSingle, conditions }) => {
      expect(transformConditionsToApi('single', conditions, 1, answers)).toEqual(expressionSingle);
      expect(consoleErrorMock).not.toHaveBeenCalled();

      expect(transformConditionsToApi('dropdown', conditions, 1, answers)).toEqual(
        expressionSingle
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    }
  );

  it.each(validConversions)(
    'converts from conditions to api string ($expressionMultiple) for multiple selection',
    ({ expressionMultiple, conditions }) => {
      expect(transformConditionsToApi('multiple', conditions, 1, answers)).toEqual(
        expressionMultiple
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
    }
  );

  it('[NEGATIVE] empty expression should produce empty conditions', () => {
    expect(transformConditionsFromApi('single', '', [])).toEqual([]);
    expect(transformConditionsFromApi('dropdown', '', [])).toEqual([]);
    expect(transformConditionsFromApi('multiple', '', [])).toEqual([]);
    expect(consoleErrorMock).not.toHaveBeenCalled();
  });

  it('[NEGATIVE] unsupported question type should produce empty conditions', () => {
    expect(transformConditionsFromApi('date-time', '', [])).toEqual([]);
    expect(transformConditionsFromApi('images', '', [])).toEqual([]);
    expect(transformConditionsFromApi('open-ended', '', [])).toEqual([]);
    expect(transformConditionsFromApi('rank', '', [])).toEqual([]);
    expect(transformConditionsFromApi('slider', '', [])).toEqual([]);
    expect(transformConditionsFromApi('' as QuestionType, '', [])).toEqual([]);
    expect(consoleErrorMock).not.toHaveBeenCalled();
  });

  it('[NEGATIVE] empty conditions should produce empty expression', () => {
    expect(transformConditionsToApi('single', [], 1, [])).toEqual('');
    expect(transformConditionsToApi('dropdown', [], 1, [])).toEqual('');
    expect(transformConditionsToApi('multiple', [], 1, [])).toEqual('');
    expect(consoleErrorMock).not.toHaveBeenCalled();
  });

  it('[NEGATIVE] unsuported question type should produce empty expression', () => {
    expect(transformConditionsToApi('date-time', [], 1, [])).toEqual('');
    expect(transformConditionsToApi('images', [], 1, [])).toEqual('');
    expect(transformConditionsToApi('open-ended', [], 1, [])).toEqual('');
    expect(transformConditionsToApi('rank', [], 1, [])).toEqual('');
    expect(transformConditionsToApi('slider', [], 1, [])).toEqual('');
    expect(transformConditionsToApi('' as QuestionType, [], 1, [])).toEqual('');
    expect(consoleErrorMock).not.toHaveBeenCalled();
  });

  const invalidExpressions = [
    'invalid',
    'invalid val1 "A1"',
    'contains val1 "invalid"',
    'and contains',
    'and contains val1 "A1"',
    'and contains var1 "A1" eq cnt1 1',
    'and contains val1 "A1" neq cnt1 abc',
    'xor contains val1 "A1" contains val "A2"',
    'and and and contains val1 "A2" contains val1 "A3"',
    'and or or contains val1 "A2" contains val1 "A3" contains val1 "A3"',
    'not contains val1 "A1"',
    'and not "A1"',
  ];

  it.each(invalidExpressions)(
    '[NEGATIVE] converts invalid expression to empty conditions (%s) for single selection',
    (expression) => {
      expect(transformConditionsFromApi('single', expression, answers)).toEqual([]);
      expect(transformConditionsFromApi('dropdown', expression, answers)).toEqual([]);
      expect(consoleErrorMock).toHaveBeenCalled();
    }
  );

  it.each(invalidExpressions)(
    '[NEGATIVE] converts invalid expression to empty conditions (%s) for multiple selection',
    (expression) => {
      expect(transformConditionsFromApi('multiple', expression, answers)).toEqual([]);
      expect(consoleErrorMock).toHaveBeenCalled();
    }
  );
});
