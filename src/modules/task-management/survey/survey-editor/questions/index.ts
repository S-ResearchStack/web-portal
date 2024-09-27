import React from 'react';

import { SurveyTaskSectionQuestion } from 'src/modules/api/models';
import type { ConfirmOptionRemovalFn } from './common/types';
import dateTimeHandler, { DateTimeQuestionItem } from './date-time';
import dropdownHandler, { DropdownSelectionQuestionItem } from './dropdown-selection';
import imageHandler, { ImageSelectionQuestionItem } from './image-selection';
import type { MultipleSelectionQuestionItem } from './multiple-selection';
import multipleHandler from './multiple-selection';
import openEndedHandler, { OpenEndedQuestionItem } from './open-ended';
import rankHandler, { RankSelectionQuestionItem } from './ranking-selection';
import scalableHandler, { ScalableQuestionItem } from './scalable';
import singleHandler, { SingleSelectionQuestionItem } from './single-selection';

export type { SelectableAnswer } from './common/types';
export type { DateTimeAnswer, DateTimeQuestionItem } from './date-time';
export type { ImagesAnswer, ImageSelectionQuestionItem } from './image-selection';
export type { OpenEndedQuestionItem } from './open-ended';
export type { ScalableAnswer } from './scalable';

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

export type QuestionTypeHandler<Q extends QuestionItem = QuestionItem> = {
  type: Q['type'];
  createEmpty(): Q;
  isEmpty(q: Q): boolean;
  convertFromOtherType(qi: QuestionItem): Q;
  fromApi(sq: SurveyTaskSectionQuestion): Q | undefined;
  toApi(qi: Q): SurveyTaskSectionQuestion | undefined;
  renderEditorContent(params: RenderEditorContentParams<Q>): React.ReactNode;
};

export const questionHandlers: {
  [T in QuestionType]: QuestionTypeHandler<Extract<QuestionItem, { type: T }>>;
} = {
  'single': singleHandler,
  'multiple': multipleHandler,
  'slider': scalableHandler,
  'dropdown': dropdownHandler,
  'images': imageHandler,
  'rank': rankHandler,
  'open-ended': openEndedHandler,
  'date-time': dateTimeHandler,
};

export const getQuestionHandler = (t: QuestionType): QuestionTypeHandler<QuestionItem> =>
  questionHandlers[t] as QuestionTypeHandler;
