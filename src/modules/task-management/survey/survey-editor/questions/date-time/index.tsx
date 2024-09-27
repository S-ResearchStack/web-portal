import React from 'react';

import { DateTimeQuestion, DateTimeQuestionConfig } from 'src/modules/api/models';
import type { QuestionTypeHandler } from '..';
import QuestionCardDateTimeOptions from '../../QuestionCardDateTimeOptions';
import { isQuestionEmptyCommon, pickCommonQuestionItemProps } from '../common';
import type {
  CommonAnswer,
  CommonQuestionItem,
  CommonQuestionOptions,
} from '../common/types';
import { newQuestionId } from '../../../utils';

type DateTimePrimitive = number | undefined;
type DateTimeValue = {
  date?: [DateTimePrimitive];
  time?: [DateTimePrimitive];
};
type DateTimeValueIfRange = {
  date?: [DateTimePrimitive, DateTimePrimitive];
  time?: [DateTimePrimitive, DateTimePrimitive];
};

export type DateTimeAnswer = CommonAnswer & {
  value: DateTimeValue | DateTimeValueIfRange;
};

export type DateTimeQuestionItem = CommonQuestionItem & {
  type: 'date-time';
  config: DateTimeQuestionConfig;
  answers: [];
  options: CommonQuestionOptions & {
    isRange?: boolean;
  };
};

const handler: QuestionTypeHandler<DateTimeQuestionItem> = {
  type: 'date-time',
  createEmpty() {
    return {
      type: 'date-time',
      id: newQuestionId(),
      answers: [],
      title: '',
      description: '',
      config: { isDate: true, isTime: true },
      options: {
        optional: false,
        isRange: false,
      },
    };
  },
  isEmpty(q) {
    return q ? isQuestionEmptyCommon(q) : true;
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'date-time',
      options: {
        ...e.options,
        optional: !!qi.options && qi.options.optional,
      },
      answers: [],
      config: {
        isDate: true,
        isTime: true,
      },
    };
  },
  fromApi(sq) {
    if (sq.type !== 'DATETIME') {
      return undefined;
    }

    const { isDate, isTime, isRange } = sq.itemProperties as DateTimeQuestion;
    return {
      type: 'date-time',
      id: sq.id,
      title: sq.title,
      description: sq.explanation,
      answers: [],
      config: { isDate, isTime },
      options: {
        optional: !sq.required,
        isRange,
      },
    };
  },
  toApi(qi) {
    return {
      id: qi.id,
      title: qi.title,
      explanation: qi.description,
      tag: 'DATETIME',
      required: !!qi.options && !qi.options.optional,
      type: 'DATETIME',
      itemProperties: {
        isDate: qi.config && qi.config.isDate,
        isTime: qi.config && qi.config.isTime,
        isRange: qi.options && qi.options.isRange,
      },
    };
  },
  renderEditorContent({ question, onChange }) {
    if (!question || !question.config || !question.options) {
      return null;
    }

    return (
      <QuestionCardDateTimeOptions
        config={question.config}
        options={question.options}
        onChange={(config) => onChange({ config })}
      />
    );
  },
};

export default handler;
