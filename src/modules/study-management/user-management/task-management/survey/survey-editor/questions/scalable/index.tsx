import React from 'react';

import _clamp from 'lodash/clamp';
import styled from 'styled-components';

import { ScaleQuestion, TaskItemQuestion } from 'src/modules/api/models';
import { px } from 'src/styles';
import type { QuestionTypeHandler } from '..';
import QuestionCardScalableOptions from '../../QuestionCardScalableOptions';
import PreviewSlider from '../../survey-preview/PreviewSlider';
import { isQuestionEmptyCommon, newId, pickCommonQuestionItemProps } from '../common';
import type { CommonAnswer, CommonQuestionItem, CommonQuestionOptions } from '../common/types';

const ANSWER_VALUE_KEY = 'value';

const SliderWrapper = styled.div`
  margin-top: ${px(24)};
`;

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
  id: newId(),
  label: '',
  value: 0,
  ...p,
});

const handler: QuestionTypeHandler<ScalableQuestionItem> = {
  type: 'slider',
  createEmpty() {
    return {
      type: 'slider',
      id: newId(),
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
  fromApi(ti) {
    if (ti.type !== 'QUESTION') {
      return undefined;
    }
    const tic = ti.contents as TaskItemQuestion;
    if (tic.type !== 'SCALE') {
      return undefined;
    }

    const props = tic.properties as ScaleQuestion;

    return {
      type: 'slider',
      id: ti.name,
      title: tic.title || '',
      description: tic.explanation || '',
      answers: [
        { id: 'low', label: props.lowLabel || '', value: props.low },
        { id: 'high', label: props.highLabel || '', value: props.high },
      ],
      options: {
        optional: !tic.required,
      },
    };
  },
  toApi(qi) {
    if (!qi || !qi.answers || !qi.options) {
      return undefined;
    }

    const [low, high] = qi.answers;
    return {
      name: qi.id,
      type: 'QUESTION',
      sequence: 0,
      contents: {
        title: qi.title,
        explanation: qi.description,
        required: !qi.options.optional,
        type: 'SCALE',
        properties: {
          tag: 'SLIDER',
          low: low.value,
          lowLabel: low.label,
          high: high.value,
          highLabel: high.label,
        },
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

  renderPreviewContent({ question, answers, onAnswersChange }) {
    const [minAnswer, maxAnswer] = question.answers;

    if (!minAnswer || !maxAnswer) {
      return null;
    }

    return (
      <SliderWrapper>
        <PreviewSlider
          maxIndex={+maxAnswer.value}
          minIndex={+minAnswer.value}
          maxLabel={maxAnswer.label}
          minLabel={minAnswer.label}
          activeIndex={answers[ANSWER_VALUE_KEY] as number}
          onChange={(index) => onAnswersChange({ [ANSWER_VALUE_KEY]: index })}
        />
      </SliderWrapper>
    );
  },
  transformAnswersOnQuestionChange({ question, previousQuestion, answers }) {
    if (previousQuestion.type !== question.type) {
      return {};
    }
    const [minAnswer, maxAnswer] = question.answers;
    const v = answers[ANSWER_VALUE_KEY];
    if (!Number.isFinite(v)) {
      return {};
    }

    return {
      [ANSWER_VALUE_KEY]: _clamp(v as number, minAnswer.value, maxAnswer.value),
    };
  },
  isPreviewQuestionAnswered({ answers }) {
    return Number.isFinite(answers[ANSWER_VALUE_KEY]);
  },
};
export default handler;
