import React from 'react';

import { TaskItemQuestion } from 'src/modules/api/models';
import type { QuestionTypeHandler } from '..';
import QuestionCardOpenEndedOptions, { StyledTextarea } from '../../QuestionCardOpenEndedOptions';
import { isQuestionEmptyCommon, newId, pickCommonQuestionItemProps } from '../common';
import type { CommonQuestionItem, CommonQuestionOptions } from '../common/types';
import LimitsCounter from '../../LimitsCounter';

const MAX_TEXT_LENGTH = 500;

const ANSWER_VALUE_KEY = 'value';

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
      id: newId(),
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
  fromApi(ti) {
    if (ti.type !== 'QUESTION') {
      return undefined;
    }
    const tic = ti.contents as TaskItemQuestion;
    if (tic.type !== 'TEXT') {
      return undefined;
    }
    if (tic.properties?.tag !== 'TEXT') {
      return undefined;
    }

    return {
      type: 'open-ended',
      id: ti.name,
      title: tic.title || '',
      description: tic.explanation || '',
      answers: [],
      options: {
        optional: !tic.required,
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
        type: 'TEXT',
        properties: {
          tag: 'TEXT',
        },
      },
    };
  },
  renderEditorContent() {
    return <QuestionCardOpenEndedOptions />;
  },
  renderPreviewContent({ answers, onAnswersChange }) {
    const answer = answers && (answers[ANSWER_VALUE_KEY] as string | undefined);
    return (
      <LimitsCounter current={answer?.length || 0} max={MAX_TEXT_LENGTH}>
        <StyledTextarea
          data-testid="open-ended-textarea"
          value={answer}
          onChange={(evt) =>
            evt.target.value.length <= MAX_TEXT_LENGTH
              ? onAnswersChange({
                  [ANSWER_VALUE_KEY]: evt.target.value,
                })
              : evt.preventDefault()
          }
        />
      </LimitsCounter>
    );
  },
  transformAnswersOnQuestionChange({ question, previousQuestion, answers }) {
    if (previousQuestion.type !== question.type) {
      return {};
    }
    return answers;
  },
  isPreviewQuestionAnswered({ answers }) {
    const answer = (!!answers && answers[ANSWER_VALUE_KEY]) as string | undefined;
    return !!answer?.length;
  },
};
export default handler;
