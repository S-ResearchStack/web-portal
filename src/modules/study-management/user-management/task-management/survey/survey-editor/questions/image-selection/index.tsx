import React from 'react';

import { v4 as uuid } from 'uuid';
import _pickBy from 'lodash/pickBy';
import styled from 'styled-components';

import { ChoiceQuestion, TaskItemQuestion } from 'src/modules/api/models';
import { px } from 'src/styles';
import type { QuestionTypeHandler } from '..';
import QuestionCardImageOptions from '../../QuestionCardImageOptions';
import {
  filterInvalidPreviewAnswers,
  filterUnselectedPreviewAnswers,
  isQuestionEmptyCommon,
  newId,
  pickCommonQuestionItemProps,
} from '../common';
import type { CommonAnswer, CommonQuestionItem, CommonQuestionOptions } from '../common/types';
import ImageCheckBox from './ImageCheckbox';

const ImagesWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${px(10)};
`;

export type ImagesAnswer = CommonAnswer & {
  image: string;
  value: string;
  touched?: boolean;
};

export type ImageSelectionQuestionItem = CommonQuestionItem & {
  type: 'images';
  answers: ImagesAnswer[];
  options: CommonQuestionOptions & {
    imageLabels: boolean;
    multiSelect: boolean;
  };
};

const emptyImagesAnswer = (p?: Pick<ImagesAnswer, 'touched'>): ImagesAnswer => ({
  id: newId(),
  image: '',
  value: '',
  ...p,
});

const handler: QuestionTypeHandler<ImageSelectionQuestionItem> = {
  type: 'images',
  createEmpty() {
    return {
      type: 'images',
      id: newId(),
      title: '',
      description: '',
      answers: [
        emptyImagesAnswer({ touched: true }),
        emptyImagesAnswer({ touched: true }),
        emptyImagesAnswer({ touched: false }),
      ],
      options: {
        optional: false,
        imageLabels: true,
        multiSelect: true,
      },
    };
  },
  isEmpty(q) {
    return q && q.answers
      ? isQuestionEmptyCommon(q) && q.answers.every((a) => !a.image && !a.value)
      : true;
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'images',
      options: {
        ...e.options,
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
    if (tic.type !== 'CHOICE') {
      return undefined;
    }

    const props = tic.properties as ChoiceQuestion;
    if (props.tag !== 'IMAGE' && props.tag !== 'MULTIIMAGE') {
      return undefined;
    }

    const answers = props.options.map((o) => ({
      id: newId(),
      value: o.label || '',
      image: o.value,
      touched: true,
    }));

    return {
      type: 'images',
      id: ti.name,
      title: tic.title || '',
      description: tic.explanation || '',
      answers: answers.length < 8 ? [...answers, emptyImagesAnswer({ touched: false })] : answers,
      options: {
        optional: !tic.required,
        imageLabels: !props.options.every((o) => o.label === undefined),
        multiSelect: props.tag === 'MULTIIMAGE',
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
          tag: qi.options?.multiSelect ? 'MULTIIMAGE' : 'IMAGE',
          options: (qi?.answers || [])
            .filter((a) => a.touched)
            .map((a) => ({
              label: qi.options.imageLabels ? a.value : undefined,
              value: a.image,
            })),
        },
      },
    };
  },
  renderEditorContent({ surveyId, containerRef, question, onChange, compact }) {
    if (!question) {
      return null;
    }

    return (
      <QuestionCardImageOptions
        containerRef={containerRef}
        compact={compact}
        uniqueId={question.id}
        data={question.answers}
        options={question.options}
        onChange={(answers) => onChange({ answers })}
        onDescriptionChange={(description) => onChange({ description })}
        createEmptyAnswer={() => emptyImagesAnswer({ touched: false })}
        getUploadObjectPath={(file) => `survey/${surveyId}/${uuid()}-${file.name}`}
      />
    );
  },

  renderPreviewContent({ question, answers, onAnswersChange }) {
    if (!question || !question.options || !question.answers || !answers) {
      return null;
    }

    const isMultiselect = question.options.multiSelect;
    const isShowLabels = question.options.imageLabels;

    return (
      <ImagesWrapper>
        {question.answers
          .filter((a) => a.touched)
          .map((a, idx) => (
            <ImageCheckBox
              key={a.id}
              title={a.value}
              image={a.image}
              checked={!!answers[a.id]}
              value={idx}
              multiselect={isMultiselect}
              showLabels={isShowLabels}
              onChange={() =>
                onAnswersChange({
                  ...(isMultiselect ? answers : {}),
                  [a.id]: answers[a.id] ? 0 : 1,
                })
              }
            />
          ))}
      </ImagesWrapper>
    );
  },
  transformAnswersOnQuestionChange({ question, previousQuestion, answers }) {
    if (previousQuestion.type !== question.type) {
      return {};
    }
    let a = filterInvalidPreviewAnswers(answers, question);

    // remove all answers except first one if multiselect is disabled
    if (previousQuestion.options.multiSelect && !question.options.multiSelect) {
      a = filterUnselectedPreviewAnswers(a);
      a = _pickBy(a, (v, aId) => aId === Object.keys(a)[0]);
    }

    return a;
  },
  isPreviewQuestionAnswered({ answers }) {
    return !!answers && Object.keys(answers).some((aId) => answers[aId] === 1);
  },
};
export default handler;
