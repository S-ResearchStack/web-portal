import React from 'react';

import { TaskItem } from 'src/modules/api/models';
import type { ConfirmOptionRemovalFn, PreviewQuestionAnswers } from './common/types';
import singleHandler, { SingleSelectionQuestionItem } from './single-selection';
import multipleHandler from './multiple-selection';
import type { MultipleSelectionQuestionItem } from './multiple-selection';
import scalableHandler, { ScalableQuestionItem } from './scalable';
import dropdownHandler, { DropdownSelectionQuestionItem } from './dropdown-selection';
import imageHandler, { ImageSelectionQuestionItem } from './image-selection';
import rankHandler, { RankSelectionQuestionItem } from './ranking-selection';
import openEndedHandler, { OpenEndedQuestionItem } from './open-ended';
import dateTimeHandler, { DateTimeQuestionItem } from './date-time';

export type { ScalableAnswer } from './scalable';
export type { SelectableAnswer } from './common/types';
export type { ImageSelectionQuestionItem, ImagesAnswer } from './image-selection';
export type { OpenEndedQuestionItem } from './open-ended';
export type { DateTimeQuestionItem, DateTimeAnswer } from './date-time';

export type QuestionItem =
  | SingleSelectionQuestionItem
  | MultipleSelectionQuestionItem
  | ScalableQuestionItem
  | DropdownSelectionQuestionItem
  | ImageSelectionQuestionItem
  | RankSelectionQuestionItem
  | OpenEndedQuestionItem
  | DateTimeQuestionItem;

type KeysOfUnion<T> = T extends T ? keyof T : never;

export type QuestionOptionKey = KeysOfUnion<QuestionItem['options']>;
export type QuestionAnswer = QuestionItem['answers'][number];
export type QuestionType = QuestionItem['type'];

type RenderEditorContentParams<Q extends QuestionItem> = {
  surveyId: string;
  containerRef?: React.RefObject<HTMLElement>;
  question: Q;
  onChange: (qi: Partial<Q>) => void;
  compact?: boolean;
  confirmOptionRemoval: ConfirmOptionRemovalFn;
};

type RenderPreviewContentParams<Q extends QuestionItem> = {
  containerRef?: React.RefObject<HTMLElement>;
  question: Q;
  answers: PreviewQuestionAnswers;
  onAnswersChange: (a: PreviewQuestionAnswers) => void;
  onChange: (qi: Partial<Q>) => void;
};

type TransformAnswersQuestionChangeParams<Q extends QuestionItem> = {
  question: Q;
  answers: PreviewQuestionAnswers;
  previousQuestion: QuestionItem;
};

type IsPreviewQuestionAnsweredParams<Q extends QuestionItem> = {
  question: Q;
  answers: PreviewQuestionAnswers;
};

export type QuestionTypeHandler<Q extends QuestionItem = QuestionItem> = {
  type: Q['type'];
  createEmpty(): Q;
  isEmpty(q: Q): boolean;
  convertFromOtherType(qi: QuestionItem): Q;
  fromApi(ti: TaskItem): Q | undefined;
  toApi(qi: Q): TaskItem | undefined;
  renderEditorContent(params: RenderEditorContentParams<Q>): React.ReactNode;

  renderPreviewContent(params: RenderPreviewContentParams<Q>): React.ReactNode;
  transformAnswersOnQuestionChange(
    params: TransformAnswersQuestionChangeParams<Q>
  ): PreviewQuestionAnswers;
  isPreviewQuestionAnswered(params: IsPreviewQuestionAnsweredParams<Q>): boolean;
};

export const questionHandlers: {
  [T in QuestionType]: QuestionTypeHandler<Extract<QuestionItem, { type: T }>>;
} = {
  single: singleHandler,
  multiple: multipleHandler,
  slider: scalableHandler,
  dropdown: dropdownHandler,
  images: imageHandler,
  rank: rankHandler,
  'open-ended': openEndedHandler,
  'date-time': dateTimeHandler,
};

export const getQuestionHandler = (t: QuestionType): QuestionTypeHandler<QuestionItem> =>
  questionHandlers[t] as QuestionTypeHandler;
