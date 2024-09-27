import React from 'react';

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
import type { CommonQuestionItem, CommonQuestionOptions, SelectableAnswer } from '../common/types';
import { newQuestionId } from '../../../utils';

export type DropdownSelectionQuestionItem = CommonQuestionItem & {
  type: 'dropdown';
  answers: SelectableAnswer[];
  options: CommonQuestionOptions & {
    includeOther: boolean;
  };
};

const handler: QuestionTypeHandler<DropdownSelectionQuestionItem> = {
  type: 'dropdown',
  createEmpty() {
    return {
      type: 'dropdown',
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
    return q && q.answers
      ? isQuestionEmptyCommon(q) && q.answers.every(isSelectableAnswerEmpty)
      : true;
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    const isSimilarAnswers = qi.type === 'single' || qi.type === 'multiple' || qi.type === 'rank';
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'dropdown',
      options: {
        optional: !!qi.options && qi.options.optional,
        includeOther: e.options.includeOther,
      },
      answers: isSimilarAnswers ? qi.answers : e.answers,
    };
  },
  fromApi(sq) {
    if (sq.type !== 'CHOICE') {
      return undefined;
    }

    return {
      type: 'dropdown',
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
      tag: 'DROPDOWN',
      required: !!qi.options && !qi.options.optional,
      type: 'CHOICE',
      itemProperties: {
        options: qi.answers ? qi.answers.map((a) => ({ value: a.value, label: a.value })) : [],
      },
    };
  },
  renderEditorContent({ containerRef, question, onChange, confirmOptionRemoval }) {
    if (!question) {
      return null;
    }

    return (
      <QuestionCardSelectableOptions
        uniqueId={question.id}
        type={question.type}
        data={question.answers}
        containerRef={containerRef}
        onChange={(answers) => onChange({ answers })}
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
