import _uniqueId from 'lodash/uniqueId';
import _pickBy from 'lodash/pickBy';
import styled from 'styled-components';

import TextArea from 'src/modules/study-management/common/TextArea';
import { px, colors } from 'src/styles';
import type { QuestionItem } from '..';
import { CommonQuestionItem, PreviewQuestionAnswers, SelectableAnswer } from './types';

export const newId = () => _uniqueId('survey_question');

export const OTHER_ANSWER_ID = 'other';

const EMPTY_ANSWER_VALUE_DEFAULT = 'Enter option';

export const emptySelectableAnswer = (value?: string): SelectableAnswer => ({
  id: newId(),
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
  skipLogic: undefined,
});

export const filterInvalidPreviewAnswers = (
  answers: PreviewQuestionAnswers,
  question: { answers: { id: string }[] }
): PreviewQuestionAnswers =>
  _pickBy(answers, (v, aId) => !!question.answers.find((a) => a.id === aId));

export const filterUnselectedPreviewAnswers = (
  answers: PreviewQuestionAnswers
): PreviewQuestionAnswers => _pickBy(answers, (v) => v !== 0);

// TODO: User can enter "Enter option" by themselves so this is a not error-proof solution
export const isSelectableAnswerEmpty = (o: SelectableAnswer) =>
  !o || !o.value || o.value.startsWith(EMPTY_ANSWER_VALUE_DEFAULT);

export const getPreviewEmptyValue = (v: string, idx: number) =>
  !v || v.startsWith(EMPTY_ANSWER_VALUE_DEFAULT) ? `Option ${idx + 1}` : `${v}`;

export const QuestionItemWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const AnswersWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TextareaOtherAnswer = styled(TextArea)`
  height: ${px(14)} !important;
  border-bottom: ${px(1)} solid ${colors.primary10};
  margin-top: ${px(22)};

  ::placeholder {
    color: ${colors.onDisabled};
  }
`;

export const renderQuestionTitle = (q?: QuestionItem) =>
  q ? `${q.title}${q.options.optional ? '' : '*'}` : '';

export const isQuestionEmptyCommon = (q: CommonQuestionItem) =>
  !q.title && !q.description && !q.skipLogic;
