import React from 'react';

import { newQuestionId } from '../../../utils';
import { ChoiceQuestion } from 'src/modules/api/models';
import type { QuestionTypeHandler } from '..';
import QuestionCardSelectableOptions from '../../QuestionCardSelectableOptions';
import {
  addAnswersNumber,
  emptySelectableAnswer,
  isQuestionEmptyCommon,
  isSelectableAnswerEmpty,
  pickCommonQuestionItemProps
} from '../common';
import type { CommonQuestionItem, CommonQuestionOptions } from '../common/types';
import { RankAnswer } from '../common/types';

export type RankSelectionQuestionItem = CommonQuestionItem & {
  type: 'rank';
  answers: RankAnswer[];
  options: CommonQuestionOptions;
};

const handler: QuestionTypeHandler<RankSelectionQuestionItem> = {
  type: 'rank',
  createEmpty() {
    return {
      type: 'rank',
      id: newQuestionId(),
      title: '',
      description: '',
      answers: addAnswersNumber([emptySelectableAnswer(), emptySelectableAnswer()]),
      options: {
        optional: false,
      },
    };
  },
  isEmpty(q) {
    return isQuestionEmptyCommon(q) && q.answers && q.answers.every(isSelectableAnswerEmpty);
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    const isSimilarAnswers =
      qi.type === 'single' || qi.type === 'multiple' || qi.type === 'dropdown';
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'rank',
      options: {
        optional: !!qi.options && qi.options.optional,
      },
      answers: isSimilarAnswers ? qi.answers.map(({ id, value }) => ({ id, value })) : e.answers,
    };
  },
  fromApi(sq) {
    if (sq.type !== 'RANKING') {
      return undefined;
    }

    return {
      type: 'rank',
      id: sq.id,
      title: sq.title,
      description: sq.explanation,
      answers: (sq.itemProperties as ChoiceQuestion).options.map((o) => ({
        id: newQuestionId(),
        value: o.value,
      })),
      options: {
        optional: !sq.required,
      },
    };
  },
  toApi(qi) {
    return {
      id: qi.id,
      title: qi.title,
      explanation: qi.description,
      required: !!qi.options && !qi.options.optional,
      type: 'RANKING',
      tag: 'RANKING',
      itemProperties: {
        options: (qi.answers || []).map((a) => ({ value: a.value, label: a.value })),
      },
    };
  },
  renderEditorContent({ containerRef, question, onChange }) {
    if (!question) {
      return null;
    }

    return (
      <QuestionCardSelectableOptions
        uniqueId={question.id}
        type={question.type}
        data={question.answers}
        onChange={(answers) => onChange({ answers: answers as RankAnswer[] })}
        containerRef={containerRef}
        onAdd={(value) =>
          onChange({
            answers: [...question.answers, emptySelectableAnswer(value)],
          })
        }
        onRemove={(item) =>
          onChange({
            answers: question.answers.filter((a) => a.id !== item.id),
          })
        }
      />
    );
  },
};
export default handler;
