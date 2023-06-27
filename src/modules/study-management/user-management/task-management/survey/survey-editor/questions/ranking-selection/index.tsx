import React from 'react';

import { TaskItemQuestion, ChoiceQuestion } from 'src/modules/api/models';
import QuestionCardSelectableOptions from '../../QuestionCardSelectableOptions';
import PreviewDraggableList from '../../survey-preview/PreviewDraggableList';
import type { QuestionTypeHandler } from '..';
import {
  addAnswersNumber,
  emptySelectableAnswer,
  filterInvalidPreviewAnswers,
  isQuestionEmptyCommon,
  isSelectableAnswerEmpty,
  newId,
  pickCommonQuestionItemProps,
} from '../common';
import { RankAnswer } from '../common/types';
import type { CommonQuestionItem, CommonQuestionOptions } from '../common/types';

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
      id: newId(),
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
  fromApi(ti) {
    if (ti.type !== 'QUESTION') {
      return undefined;
    }
    const tic = ti.contents as TaskItemQuestion;
    if (tic.type !== 'RANK') {
      return undefined;
    }

    return {
      type: 'rank',
      id: ti.name,
      title: tic.title || '',
      description: tic.explanation || '',
      answers: (tic.properties as ChoiceQuestion).options.map((o) => ({
        id: newId(),
        value: o.value,
      })),
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
        type: 'RANK',
        properties: {
          tag: 'RANK',
          options: (qi.answers || []).map(({ value }) => ({ value })),
        },
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
  renderPreviewContent({ containerRef, question }) {
    if (!question) {
      return null;
    }

    return <PreviewDraggableList containerRef={containerRef} answers={question.answers} />;
  },
  transformAnswersOnQuestionChange({ question, previousQuestion, answers }) {
    if (previousQuestion.type !== question.type) {
      return {};
    }
    return filterInvalidPreviewAnswers(answers, question);
  },
  isPreviewQuestionAnswered({ question }) {
    return !!question && !!question.answers && question.answers.length > 1;
  },
};
export default handler;
