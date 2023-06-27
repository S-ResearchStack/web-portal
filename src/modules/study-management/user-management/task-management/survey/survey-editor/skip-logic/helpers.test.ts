import {
  isSkipLogicComplete,
  isEmptyCondition,
  isNewRulesCanBeAdded,
  getAllowedSelectedCountValues,
  getAllowedSpecificOptions,
  isSectionTargetAllowed,
  hasQuestionAssociatedSkipLogic,
  hasQuestionAnswerAssociatedSkipLogic,
  getAllowedTargets,
  removeInvalidSkipLogic,
} from 'src/modules/study-management/user-management/task-management/survey/survey-editor/skip-logic/helpers';
import {
  QuestionItem,
  SelectableAnswer,
  SurveyItem,
} from 'src/modules/study-management/user-management/task-management/survey/survey-editor/surveyEditor.slice';
import {
  SkipLogicCondition,
  SkipLogicSelectedCountCondition,
  SkipLogicDestination,
} from 'src/modules/study-management/user-management/task-management/survey/survey-editor/skip-logic/types';

const questionWithId = { id: 'id' } as QuestionItem;

const sections = [
  { id: 'id', children: [questionWithId] },
  { id: 'id2', children: [{ id: 'id2' } as QuestionItem] },
];

describe('get skip logic complete', () => {
  it('should get skip logic completion', async () => {
    expect(
      isSkipLogicComplete({
        rules: [
          {
            id: '1',
            destination: { targetId: 'id', targetType: 'question' },
            conditions: [
              {
                id: '1',
                type: 'specific_option',
                optionId: 'test',
                optionCondition: 'not_selected',
                clause: 'and',
              },
              {
                id: '2',
                type: 'selected_count',
                countCondition: 'less',
                count: 1,
                clause: 'and',
              },
            ],
          },
        ],
      })
    ).toBeTrue();
  });

  it('[NEGATIVE] should get skip logic completion with empty data', async () => {
    expect(isSkipLogicComplete()).toBeTrue();
  });
});

describe('get is condition empty', () => {
  it('should get condition empty state', async () => {
    [
      { id: '1', type: 'empty' as const, clause: 'and' as const },
      { id: '1', type: 'specific_option' as const, clause: 'and' as const },
      { id: '1', type: 'selected_count' as const, clause: 'and' as const },
    ].forEach((c) => expect(isEmptyCondition(c)).toBeTrue());
  });

  it('[NEGATIVE] should get condition empty state with wrong type', async () => {
    expect(isEmptyCondition({} as SkipLogicCondition)).toBeTrue();
  });
});

describe('get is new rules can be added', () => {
  it('[NEGATIVE] should get is new rules can be added with empty data', async () => {
    expect(isNewRulesCanBeAdded({} as QuestionItem, [])).toBeTrue();
  });
});

describe('get allowed selected count values', () => {
  it('[NEGATIVE] Should get allowed selected count values with empty data', async () => {
    expect(
      getAllowedSelectedCountValues(
        { answers: [] } as QuestionItem,
        {} as SkipLogicSelectedCountCondition
      )
    ).toEqual([]);
  });
});

describe('get allowed specific options', () => {
  it('Should get allowed specific options', async () => {
    expect(
      getAllowedSpecificOptions({
        type: 'single',
        answers: [{ id: 'id', value: 'value' }],
      } as QuestionItem)
    ).toEqual([{ optionId: 'id', label: 'value' }]);
  });

  it('[NEGATIVE] Should get allowed specific options with empty type', async () => {
    expect(getAllowedSpecificOptions({} as QuestionItem)).toEqual([]);
  });
});

describe('get allowed section target', () => {
  it('Should get allowed specific options with no sections', async () => {
    expect(isSectionTargetAllowed(questionWithId, sections)).toBeTrue();
  });

  it('[NEGATIVE] Should get allowed specific options with no sections', async () => {
    expect(isSectionTargetAllowed({} as QuestionItem, [])).toBeFalse();
  });
});

describe('get question associated skip logic', () => {
  it('Should get question associated skip logic', async () => {
    expect(
      hasQuestionAssociatedSkipLogic(questionWithId, [
        {
          id: 'id2',
          skipLogic: { rules: [{ destination: { targetType: 'question', targetId: 'id' } }] },
        } as QuestionItem,
      ])
    ).toBeTrue();
  });

  it('[NEGATIVE] Should get question associated skip logic with no data', async () => {
    expect(hasQuestionAssociatedSkipLogic({} as QuestionItem, [])).toBeFalse();
  });
});

describe('get question answer associated skip logic', () => {
  it('Should get question answer associated skip logic', async () => {
    expect(
      hasQuestionAnswerAssociatedSkipLogic(
        {
          id: 'id2',
          skipLogic: { rules: [{ conditions: [{ type: 'specific_option', optionId: 'id' }] }] },
        } as QuestionItem,
        { id: 'id' } as SelectableAnswer
      )
    ).toBeTrue();
  });

  it('[NEGATIVE] Should get question associated skip logic with no data', async () => {
    expect(
      hasQuestionAnswerAssociatedSkipLogic({} as QuestionItem, {} as SelectableAnswer)
    ).toBeFalse();
  });
});

describe('get allowed targets', () => {
  it('Should get allowed targets', async () => {
    const expectation = expect.arrayContaining([
      {
        label: expect.any(String),
        targetId: expect.any(String),
      },
    ]);

    expect(
      getAllowedTargets({ targetId: 'id', targetType: 'question' }, questionWithId, sections)
    ).toEqual(expectation);

    expect(
      getAllowedTargets({ targetId: 'id', targetType: 'section' }, questionWithId, sections)
    ).toEqual(expectation);
  });

  it('[NEGATIVE] Should get allowed targets with empty data', async () => {
    expect(getAllowedTargets({} as SkipLogicDestination, {} as QuestionItem, [])).toEqual([]);
  });
});

describe('remove invalid skip logic', () => {
  it('Should remove invalid skip logic', async () => {
    const getSurvey = (
      type: 'specific_option' | 'selected_count',
      params?: { optionId?: string } | { count?: number },
      destination?: {
        targetId?: string;
        targetType?: 'question' | 'section';
      }
    ) =>
      ({
        questions: [
          {
            children: [
              {
                answers: [],
                skipLogic: {
                  rules: [
                    {
                      destination: { targetId: 'id2', targetType: 'section', ...destination },
                      conditions: [{ type, ...params }],
                    },
                  ],
                },
              },
            ],
          },
        ],
      } as SurveyItem);

    expect(removeInvalidSkipLogic(getSurvey('specific_option', { optionId: 'id' }))).toEqual(
      getSurvey(
        'specific_option',
        { optionId: undefined },
        { targetId: undefined, targetType: 'question' }
      )
    );

    expect(removeInvalidSkipLogic(getSurvey('selected_count', { count: 1 }))).toEqual(
      getSurvey(
        'selected_count',
        { optionId: undefined },
        { targetId: undefined, targetType: 'question' }
      )
    );
  });

  it('[NEGATIVE] Should remove invalid skip logic with no data', async () => {
    const survey = { questions: [] } as never as SurveyItem;
    expect(removeInvalidSkipLogic(survey)).toEqual(survey);
  });
});
