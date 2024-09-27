import React from 'react';

import _clamp from 'lodash/clamp';

import { newQuestionId } from '../../../utils';
import { ScaleQuestion } from 'src/modules/api/models';
import type { QuestionTypeHandler } from '..';
import QuestionCardScalableOptions from '../../QuestionCardScalableOptions';
import { isQuestionEmptyCommon, pickCommonQuestionItemProps } from '../common';
import type { CommonAnswer, CommonQuestionItem, CommonQuestionOptions } from '../common/types';

export type ScalableAnswer = CommonAnswer & {
  label: string;
  value: number;
};

export type ScalableQuestionItem = CommonQuestionItem & {
  type: 'slider';
  answers: ScalableAnswer[];
  options: CommonQuestionOptions;
};

const emptyScalableAnswer = (p?: Partial<Pick<ScalableAnswer, 'value'>>): ScalableAnswer => ({
  id: newQuestionId(),
  label: '',
  value: 0,
  ...p,
});

const handler: QuestionTypeHandler<ScalableQuestionItem> = {
  type: 'slider',
  createEmpty() {
    return {
      type: 'slider',
      id: newQuestionId(),
      title: '',
      description: '',
      answers: [emptyScalableAnswer({ value: 0 }), emptyScalableAnswer({ value: 10 })],
      options: {
        optional: false,
      },
    };
  },
  isEmpty(q) {
    return isQuestionEmptyCommon(q) && q.answers && q.answers.every((a) => !a.label);
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'slider',
      options: {
        optional: !!qi.options && qi.options.optional,
      },
      answers: e.answers,
    };
  },
  fromApi(sq) {
    if (sq.type !== 'SCALE') {
      return undefined;
    }

    const props = sq.itemProperties as ScaleQuestion;
    return {
      type: 'slider',
      id: sq.id,
      title: sq.title,
      description: sq.explanation,
      answers: [
        { id: 'low', label: props.lowLabel || '', value: props.low },
        { id: 'high', label: props.highLabel || '', value: props.high },
      ],
      options: {
        optional: !sq.required,
      },
    };
  },
  toApi(qi) {
    if (!qi || !qi.answers || !qi.options)
    {
      return undefined;
    }

    const [low, high] = qi.answers;
    return {
      id: qi.id,
      title: qi.title,
      explanation: qi.description,
      tag: 'SLIDER',
      required: !qi.options.optional,
      type: 'SCALE',
      itemProperties: {
        low: low.value,
        lowLabel: low.label,
        high: high.value,
        highLabel: high.label,
      },
    };
  },
  renderEditorContent({ question, onChange, compact }) {
    if (!question) {
      return null;
    }

    return (
      <QuestionCardScalableOptions
        compact={compact}
        data={question.answers}
        onChange={(answers) => onChange({ answers })}
      />
    );
  },
};
export default handler;
