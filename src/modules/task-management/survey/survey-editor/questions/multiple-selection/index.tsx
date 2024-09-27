import React from 'react';

import _omit from 'lodash/omit';

import { newQuestionId } from '../../../utils';
import { ChoiceQuestion } from 'src/modules/api/models';
import type { QuestionTypeHandler } from '..';
import QuestionCardSelectableOptions from '../../QuestionCardSelectableOptions';
import {
  emptySelectableAnswer,
  pickCommonQuestionItemProps,
  OTHER_ANSWER_ID,
  isQuestionEmptyCommon,
  isSelectableAnswerEmpty,
  addAnswersNumber,
} from '../common';
import type { CommonQuestionItem, CommonQuestionOptions, SelectableAnswer } from '../common/types';

export type MultipleSelectionQuestionItem = CommonQuestionItem & {
  type: 'multiple';
  answers: SelectableAnswer[];
  options: CommonQuestionOptions & {
    includeOther: boolean;
  };
};

const handler: QuestionTypeHandler<MultipleSelectionQuestionItem> = {
  type: 'multiple',
  createEmpty() {
    return {
      type: 'multiple',
      id: newQuestionId(),
      title: '',
      description: '',
      answers: addAnswersNumber([emptySelectableAnswer(), emptySelectableAnswer()]),
      options: {
        optional: false,
        includeOther: false,
      },
    };
  },
  isEmpty(q) {
    return q ? isQuestionEmptyCommon(q) && q.answers.every(isSelectableAnswerEmpty) : true;
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    const isSimilar = qi.type === 'single';
    const isSimilarAnswers = qi.type === 'dropdown' || qi.type === 'single' || qi.type === 'rank';
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'multiple',
      options: {
        optional: !!qi.options && qi.options.optional,
        includeOther: isSimilar ? qi.options.includeOther : e.options.includeOther,
      },
      answers: isSimilarAnswers ? qi.answers : e.answers,
    };
  },
  fromApi(sq) {
    if (sq.type !== 'CHOICE') {
      return undefined;
    }

    return {
      type: 'multiple',
      id: sq.id,
      title: sq.title,
      description: sq.explanation,
      answers: (sq.itemProperties as ChoiceQuestion).options.map((o) => ({
        id: newQuestionId(),
        value: o.value,
      })),
      options: {
        optional: !sq.required,
        includeOther: false, // TODO: get from API
      },
    };
  },
  toApi(qi) {
    return {
      id: qi.id,
      title: qi.title,
      explanation: qi.description,
      tag: 'CHECKBOX',
      required: !!qi.options && !qi.options.optional,
      type: 'CHOICE',
      itemProperties: {
        options: qi.answers
          ? qi.answers
            .filter((answer) => answer.id !== OTHER_ANSWER_ID)
            .map((a) => ({ value: a.value, label: a.value }))
          : [],
      },
    };
  },
  renderEditorContent({ containerRef, question, onChange, confirmOptionRemoval }) {
    if (!question || !question.answers || !question.options) {
      return null;
    }

    return (
      <QuestionCardSelectableOptions
        uniqueId={question.id}
        type={question.type}
        data={question.answers}
        withOtherOption={question.options.includeOther}
        onChange={(answers) => onChange({ answers })}
        containerRef={containerRef}
        onAdd={(value) =>
          onChange({
            answers: [...question.answers, emptySelectableAnswer(value)],
          })
        }
        onRemove={(item) => {
          const removeOption = () => {
            onChange({
              answers: question.answers.filter((a) => a.id !== item.id),
            });
          };
          removeOption();
        }}
      />
    );
  },
};
export default handler;
