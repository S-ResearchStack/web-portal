import '@testing-library/jest-dom';
import 'jest-styled-components';
import { AppDispatch } from 'src/modules/store';
import { createTestStore } from 'src/modules/store/testing';
import {
  cleanupEditSkipLogicQuestion,
  isEditingSkipLogicSelector,
  skipLogicEditQuestionSelector,
  startEditSkipLogic,
  stopEditSkipLogic,
} from './skipLogic.slice';

describe('skipLogic.slice', () => {
  it('should open and close drawer', async () => {
    const store = createTestStore({
      'survey/edit': {
        isSaving: false,
        isLoading: false,
        isCreating: false,
        survey: {
          studyId: 'test',
          id: 'test',
          revisionId: 0,
          title: '',
          description: '',
          questions: [
            {
              id: 's1',
              children: [
                {
                  id: 'q1',
                  title: '',
                  description: '',
                  type: 'multiple',
                  answers: [
                    {
                      id: 'a1',
                      value: 'a1',
                    },
                    {
                      id: 'a2',
                      value: 'a2',
                    },
                  ],
                  options: { optional: false, includeOther: false },
                },
              ],
            },
          ],
        },
      },
      'survey/edit/skipLogic': {
        isDrawerOpen: false,
        editQuestionId: undefined,
      },
    });
    // eslint-disable-next-line prefer-destructuring
    const dispatch: AppDispatch = store.dispatch;

    expect(isEditingSkipLogicSelector(store.getState())).toBeFalse();
    expect(skipLogicEditQuestionSelector(store.getState())).toBeUndefined();

    dispatch(startEditSkipLogic('q1'));
    expect(isEditingSkipLogicSelector(store.getState())).toBeTrue();
    expect(skipLogicEditQuestionSelector(store.getState())).not.toBeUndefined();

    dispatch(stopEditSkipLogic());
    expect(isEditingSkipLogicSelector(store.getState())).toBeFalse();
    expect(skipLogicEditQuestionSelector(store.getState())).not.toBeUndefined();

    dispatch(cleanupEditSkipLogicQuestion());
    expect(isEditingSkipLogicSelector(store.getState())).toBeFalse();
    expect(skipLogicEditQuestionSelector(store.getState())).toBeUndefined();
  });

  it('[NEGATIVE] should not open for invalid question id', async () => {
    const store = createTestStore({
      'survey/edit': {
        isSaving: false,
        isLoading: false,
        isCreating: false,
        survey: {
          studyId: 'test',
          id: 'test',
          revisionId: 0,
          title: '',
          description: '',
          questions: [
            {
              id: 's1',
              children: [
                {
                  id: 'q1',
                  title: '',
                  description: '',
                  type: 'multiple',
                  answers: [
                    {
                      id: 'a1',
                      value: 'a1',
                    },
                    {
                      id: 'a2',
                      value: 'a2',
                    },
                  ],
                  options: { optional: false, includeOther: false },
                },
              ],
            },
          ],
        },
      },
      'survey/edit/skipLogic': {
        isDrawerOpen: false,
        editQuestionId: undefined,
      },
    });
    // eslint-disable-next-line prefer-destructuring
    const dispatch: AppDispatch = store.dispatch;

    expect(isEditingSkipLogicSelector(store.getState())).toBeFalse();
    expect(skipLogicEditQuestionSelector(store.getState())).toBeUndefined();

    dispatch(startEditSkipLogic('invalid'));
    expect(isEditingSkipLogicSelector(store.getState())).toBeFalse();
    expect(skipLogicEditQuestionSelector(store.getState())).toBeUndefined();
  });
});
