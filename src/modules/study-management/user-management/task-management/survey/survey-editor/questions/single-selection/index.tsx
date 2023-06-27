import React from 'react';

import _omit from 'lodash/omit';

import { ChoiceQuestion, TaskItemQuestion } from 'src/modules/api/models';
import type { CommonQuestionItem, CommonQuestionOptions, SelectableAnswer } from '../common/types';
import type { QuestionTypeHandler } from '..';
import QuestionCardSelectableOptions from '../../QuestionCardSelectableOptions';
import PreviewRadio from '../../survey-preview/PreviewRadio';
import PreviewOtherOption from '../../survey-preview/PreviewOtherOption';
import {
  emptySelectableAnswer,
  filterInvalidPreviewAnswers,
  newId,
  pickCommonQuestionItemProps,
  QuestionItemWrapper,
  AnswersWrapper,
  OTHER_ANSWER_ID,
  getPreviewEmptyValue,
  isQuestionEmptyCommon,
  isSelectableAnswerEmpty,
  addAnswersNumber,
} from '../common';
import { hasQuestionAnswerAssociatedSkipLogic } from '../../skip-logic/helpers';

export type SingleSelectionQuestionItem = CommonQuestionItem & {
  type: 'single';
  answers: SelectableAnswer[];
  options: CommonQuestionOptions & {
    includeOther: boolean;
  };
};

const handler: QuestionTypeHandler<SingleSelectionQuestionItem> = {
  type: 'single',
  createEmpty() {
    return {
      type: 'single',
      id: newId(),
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
    return isQuestionEmptyCommon(q) && q.answers && q.answers.every(isSelectableAnswerEmpty);
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    const isSimilar = qi.type === 'multiple';
    const isSimilarAnswers = qi.type === 'dropdown' || qi.type === 'multiple' || qi.type === 'rank';
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'single',
      options: {
        optional: !!qi.options && qi.options.optional,
        includeOther: isSimilar && !!qi.options ? qi.options.includeOther : e.options.includeOther,
      },
      answers: isSimilarAnswers ? qi.answers : e.answers,
    };
  },
  fromApi(ti) {
    if (ti.type !== 'QUESTION') {
      return undefined;
    }
    const tic = ti.contents as TaskItemQuestion;
    if (tic.type !== 'CHOICE') {
      return undefined;
    }

    return {
      type: 'single',
      id: ti.name,
      title: tic.title || '',
      description: tic.explanation || '',
      answers: (tic.properties as ChoiceQuestion).options.map((o) => ({
        id: newId(),
        value: o.value,
      })),
      options: {
        optional: !tic.required,
        includeOther: false, // TODO: get from API
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
        type: 'CHOICE',
        properties: {
          tag: 'RADIO',
          options: qi.answers
            ? qi.answers
                .filter((answer) => answer.id !== OTHER_ANSWER_ID)
                .map((a) => ({ value: a.value }))
            : [],
        },
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
          if (hasQuestionAnswerAssociatedSkipLogic(question, item)) {
            confirmOptionRemoval(removeOption);
          } else {
            removeOption();
          }
        }}
      />
    );
  },
  renderPreviewContent({ question, answers, onAnswersChange, onChange }) {
    if (!question || !question.answers || !question.options) {
      return null;
    }

    return (
      <AnswersWrapper>
        {question.answers
          .filter((a) => a.id !== OTHER_ANSWER_ID)
          .map((a, idx) => (
            <QuestionItemWrapper key={a.id}>
              <PreviewRadio
                checked={!!answers[a.id]}
                value={idx}
                kind="radio"
                onChange={() => onAnswersChange({ [a.id]: answers[a.id] ? 0 : 1 })}
              >
                {getPreviewEmptyValue(a.value, idx)}
              </PreviewRadio>
            </QuestionItemWrapper>
          ))}
        {question.options.includeOther && (
          <PreviewOtherOption
            answers={answers}
            question={question}
            onCheckChange={onAnswersChange}
            onTextChange={(value) =>
              onChange({
                ...question,
                answers: [
                  ...question.answers.filter((q) => q.id !== OTHER_ANSWER_ID),
                  { id: OTHER_ANSWER_ID, value },
                ],
              })
            }
          />
        )}
      </AnswersWrapper>
    );
  },
  transformAnswersOnQuestionChange({ question, previousQuestion, answers }) {
    if (previousQuestion.type !== question.type) {
      return {};
    }
    if (previousQuestion.options.includeOther && !question.options.includeOther) {
      return _omit(answers, [OTHER_ANSWER_ID]);
    }
    return filterInvalidPreviewAnswers(answers, question);
  },
  isPreviewQuestionAnswered({ answers }) {
    return Object.keys(answers).some((aId) => answers[aId] === 1);
  },
};
export default handler;
