import React from 'react';

import _pickBy from 'lodash/pickBy';
import { v4 as uuid } from 'uuid';

import { ChoiceQuestion } from 'src/modules/api/models';
import type { QuestionTypeHandler } from '..';
import QuestionCardImageOptions from '../../QuestionCardImageOptions';
import {
  isQuestionEmptyCommon,
  pickCommonQuestionItemProps
} from '../common';
import type { CommonAnswer, CommonQuestionItem, CommonQuestionOptions } from '../common/types';
import { newQuestionId } from '../../../utils';

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
  id: newQuestionId(),
  image: '',
  value: '',
  ...p,
});

const handler: QuestionTypeHandler<ImageSelectionQuestionItem> = {
  type: 'images',
  createEmpty() {
    return {
      type: 'images',
      id: newQuestionId(),
      title: '',
      description: '',
      answers: [
        emptyImagesAnswer({ touched: true }),
        emptyImagesAnswer({ touched: true }),
        emptyImagesAnswer({ touched: false }),
      ],
      options: {
        optional: false,
        imageLabels: false,
        multiSelect: false,
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
  fromApi(sq) {
    if (sq.tag !== 'IMAGE') {
      return undefined;
    }

    const answers = (sq.itemProperties as ChoiceQuestion).options.map((o) => ({
      id: newQuestionId(),
      value: o.label || '',
      image: o.value,
      touched: true,
    }));

    return {
      type: 'images',
      id: sq.id,
      title: sq.title,
      description: sq.explanation,
      answers: answers.length < 8 ? [...answers, emptyImagesAnswer({ touched: false })] : answers,
      options: {
        optional: !sq.required,
        imageLabels: !(sq.itemProperties as ChoiceQuestion).options.every((o) => o.label === undefined),
        multiSelect: false,
      },
    };
  },
  toApi(qi) {
    return {
      id: qi.id,
      title: qi.title,
      explanation: qi.description,
      required: !!qi.options && !qi.options.optional,
      type: 'CHOICE',
      tag: 'IMAGE',
      itemProperties: {
        options: (qi?.answers || [])
          .filter((a) => a.touched)
          .map((a) => ({
            label: qi.options.imageLabels ? a.value : '',
            value: a.image.split('/').pop() || '',
          })),
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
};
export default handler;
