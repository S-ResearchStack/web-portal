import _uniqueId from 'lodash/uniqueId';
import _pickBy from 'lodash/pickBy';

import { newQuestionId } from '../../../utils';
import { CommonQuestionItem, SelectableAnswer } from './types';

export const OTHER_ANSWER_ID = 'other';

const EMPTY_ANSWER_VALUE_DEFAULT = 'Enter option';

export const emptySelectableAnswer = (value?: string): SelectableAnswer => ({
  id: newQuestionId(),
  value: value || EMPTY_ANSWER_VALUE_DEFAULT,
});

export const addAnswersNumber = (answers: SelectableAnswer[]) =>
  answers.map((a, i) => ({
    ...a,
    value: `${a.value} ${i + 1}`,
  }));

export const pickCommonQuestionItemProps = (qi: CommonQuestionItem): CommonQuestionItem => ({
  id: qi.id,
  title: qi.title,
  description: qi.description,
  // TODO: potentially we can transfer skip logic when converting between certain question types
});

// TODO: User can enter "Enter option" by themselves so this is a not error-proof solution
export const isSelectableAnswerEmpty = (o: SelectableAnswer) =>
  !o || !o.value || o.value.startsWith(EMPTY_ANSWER_VALUE_DEFAULT);

export const isQuestionEmptyCommon = (q: CommonQuestionItem) =>
  !q.title && !q.description;
