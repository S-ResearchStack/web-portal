import React from 'react';

import { DateTimeQuestion, TaskItemQuestion, DateTimeQuestionConfig } from 'src/modules/api/models';
import DateTimePreview from './DateTimePreview';
import type { QuestionTypeHandler } from '..';
import QuestionCardDateTimeOptions from '../../QuestionCardDateTimeOptions';
import { isQuestionEmptyCommon, newId, pickCommonQuestionItemProps } from '../common';
import type {
  CommonAnswer,
  CommonQuestionItem,
  CommonQuestionOptions,
  DateTimeAnswers,
} from '../common/types';

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

const ANSWER_VALUE_KEY = 'date-time';

const handler: QuestionTypeHandler<DateTimeQuestionItem> = {
  type: 'date-time',
  createEmpty() {
    return {
      type: 'date-time',
      id: newId(),
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
  fromApi(ti) {
    if (ti.type !== 'QUESTION') {
      return undefined;
    }
    const tic = ti.contents as TaskItemQuestion;
    if (tic.type !== 'DATETIME') {
      return undefined;
    }

    const { isDate, isTime, isRange, tag } = tic.properties as DateTimeQuestion;
    if (tag !== 'DATETIME') {
      return undefined;
    }

    return {
      type: 'date-time',
      id: ti.name,
      title: tic.title || '',
      description: tic.explanation || '',
      answers: [],
      config: { isDate, isTime },
      options: {
        optional: !tic.required,
        isRange,
      },
    };
  },
  toApi(qi) {
    return {
      name: qi.id,
      type: 'QUESTION',
      sequence: 0,
      contents: {
        title: qi.title,
        explanation: qi.description,
        required: !!qi.options && !qi.options.optional,
        type: 'DATETIME',
        properties: {
          tag: 'DATETIME',
          isDate: qi.config && qi.config.isDate,
          isTime: qi.config && qi.config.isTime,
          isRange: qi.options && qi.options.isRange,
        },
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
  renderPreviewContent({ question, answers, onAnswersChange }) {
    if (!question || !question.options || !answers) {
      return null;
    }

    const { config, options } = question;

    return (
      <DateTimePreview
        config={config}
        options={options}
        answers={
          (answers[ANSWER_VALUE_KEY] || {
            date: new Date(),
            time: new Date(),
            datesRange: [],
            timesRange: [],
          }) as DateTimeAnswers
        }
        onAnswersChange={(newAnswers: DateTimeAnswers) =>
          onAnswersChange({
            [ANSWER_VALUE_KEY]: newAnswers,
          })
        }
      />
    );
  },
  transformAnswersOnQuestionChange({ question, previousQuestion, answers }) {
    if (previousQuestion.type !== question.type) {
      return {};
    }
    return answers;
  },
  isPreviewQuestionAnswered({ answers, question }) {
    if (!answers || !question) {
      return false;
    }

    const { config, options } = question;
    const { isRange } = options;

    if (!answers[ANSWER_VALUE_KEY]) {
      return !isRange;
    }

    const { date, time, datesRange, timesRange } = answers[ANSWER_VALUE_KEY] as DateTimeAnswers;
    const { isDate, isTime } = config;

    const dateFilled = isRange ? datesRange.length === 2 : !!date;
    const timeFilled = isRange ? timesRange.length === 2 : !!time;

    return (!isDate || dateFilled) && (!isTime || timeFilled);
  },
};

export default handler;
