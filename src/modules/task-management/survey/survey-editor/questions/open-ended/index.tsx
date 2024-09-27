import React from 'react';

import { newQuestionId } from '../../../utils';
import type { QuestionTypeHandler } from '..';
import QuestionCardOpenEndedOptions from '../../QuestionCardOpenEndedOptions';
import { isQuestionEmptyCommon, pickCommonQuestionItemProps } from '../common';
import type { CommonQuestionItem, CommonQuestionOptions } from '../common/types';

export type OpenEndedQuestionItem = CommonQuestionItem & {
  type: 'open-ended';
  answers: [];
  options: CommonQuestionOptions;
};

const handler: QuestionTypeHandler<OpenEndedQuestionItem> = {
  type: 'open-ended',
  createEmpty() {
    return {
      type: 'open-ended',
      id: newQuestionId(),
      title: '',
      description: '',
      answers: [],
      options: {
        optional: false,
      },
    };
  },
  isEmpty(q) {
    return isQuestionEmptyCommon(q);
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'open-ended',
      answers: [],
      options: {
        ...e.options,
        optional: !!qi.options && qi.options.optional,
      },
    };
  },
  fromApi(sq) {
    if (sq.type !== 'TEXT') {
      return undefined;
    }

    return {
      type: 'open-ended',
      id: sq.id,
      title: sq.title,
      description: sq.explanation,
      answers: [],
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
      tag: 'TEXT',
      required: !!qi.options && !qi.options.optional,
      type: 'TEXT',
    };
  },
  renderEditorContent() {
    return <QuestionCardOpenEndedOptions />;
  },
};
export default handler;
