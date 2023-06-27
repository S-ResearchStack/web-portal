import React from 'react';

import styled from 'styled-components';

import Radio from 'src/common/components/Radio';
import { ChoiceQuestion, TaskItemQuestion } from 'src/modules/api/models';
import Dropdown, {
  CheckmarkContainer,
  Icon,
  Label,
  MenuItem,
  ValueItem,
} from 'src/common/components/Dropdown';
import { colors, px } from 'src/styles';
import { PREVIEW_SCALE, previewDropdownMenuClassName } from 'src/styles/GlobalStyles';
import type { QuestionTypeHandler } from '..';
import QuestionCardSelectableOptions from '../../QuestionCardSelectableOptions';
import {
  addAnswersNumber,
  emptySelectableAnswer,
  filterInvalidPreviewAnswers,
  getPreviewEmptyValue,
  isQuestionEmptyCommon,
  isSelectableAnswerEmpty,
  newId,
  pickCommonQuestionItemProps,
} from '../common';
import type { CommonQuestionItem, CommonQuestionOptions, SelectableAnswer } from '../common/types';
import { hasQuestionAnswerAssociatedSkipLogic } from '../../skip-logic/helpers';

const PreviewDropdown = styled(Dropdown)<{ $active: boolean }>`
  display: flex;
  border-bottom: ${px(7)} solid transparent;
  border-top: ${px(7)} solid transparent;
  border-radius: ${px(4)};
  outline: ${colors.primaryDisabled} solid ${px(1)};
  outline-color: ${({ $active, theme }) => $active && theme.colors.primary};
  width: ${px(312)};
  min-width: ${px(312)};

  &:hover {
    outline: ${colors.primary} solid ${px(1)};
  }
  & ${Icon} {
    display: none;
  }
  & ${ValueItem} {
    display: flex;
    justify-content: space-between;
    padding: 0 ${px(18)};
    border-color: transparent !important;
    &:hover {
      border-color: transparent !important;
    }
  }
  & ${Label} {
    font-size: ${px(16)};
  }
`;

const Item = styled(MenuItem)`
  display: flex;
  grid-template: none;
  gap: 0;
  padding: 0;
  justify-content: flex-start;
  width: 100%;
  min-width: 100%;

  & ${CheckmarkContainer} {
    width: 0;
    display: none;
  }

  & ${Icon} {
    transform: scale(${PREVIEW_SCALE});
    justify-content: flex-start;
  }

  & ${Label} {
    font-size: ${px(12)};
  }
`;

export type DropdownSelectionQuestionItem = CommonQuestionItem & {
  type: 'dropdown';
  answers: SelectableAnswer[];
  options: CommonQuestionOptions & {
    includeOther: boolean;
  };
};

const handler: QuestionTypeHandler<DropdownSelectionQuestionItem> = {
  type: 'dropdown',
  createEmpty() {
    return {
      type: 'dropdown',
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
    return q && q.answers
      ? isQuestionEmptyCommon(q) && q.answers.every(isSelectableAnswerEmpty)
      : true;
  },
  convertFromOtherType(qi) {
    const e = this.createEmpty();
    const isSimilarAnswers = qi.type === 'single' || qi.type === 'multiple' || qi.type === 'rank';
    return {
      ...pickCommonQuestionItemProps(qi),
      type: 'dropdown',
      options: {
        optional: !!qi.options && qi.options.optional,
        includeOther: e.options.includeOther,
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
      type: 'dropdown',
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
          tag: 'DROPDOWN',
          options: qi.answers ? qi.answers.map((a) => ({ value: a.value })) : [],
        },
      },
    };
  },
  renderEditorContent({ containerRef, question, onChange, confirmOptionRemoval }) {
    if (!question) {
      return null;
    }

    return (
      <QuestionCardSelectableOptions
        uniqueId={question.id}
        type={question.type}
        data={question.answers}
        containerRef={containerRef}
        onChange={(answers) => onChange({ answers })}
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
  renderPreviewContent({ question, answers, onAnswersChange }) {
    if (!question || !question.answers || !answers) {
      return null;
    }

    const userSelect = Object.entries(answers).filter(([, v]) => v);
    return (
      <PreviewDropdown
        items={question.answers.map((a, idx) => ({
          icon: (
            <Radio
              onChange={() => {}} // required prop, but redundant here
              checked={!!answers[a.id]}
              kind="radio"
            />
          ),
          label: getPreviewEmptyValue(a.value, idx),
          key: a.id,
        }))}
        activeKey={userSelect.length ? userSelect[0][0] : ''}
        placeholder="Select One"
        backgroundType="light"
        maxVisibleMenuItems={7}
        menuItemHeight={42}
        menuClassName={previewDropdownMenuClassName}
        onChange={(a) =>
          onAnswersChange({
            [a]: answers[a] ? 0 : 1,
          })
        }
        $active={!!userSelect.length}
        menuItemComponent={Item}
      />
    );
  },
  transformAnswersOnQuestionChange({ question, previousQuestion, answers }) {
    if (previousQuestion.type !== question.type) {
      return {};
    }
    return filterInvalidPreviewAnswers(answers, question);
  },
  isPreviewQuestionAnswered({ answers }) {
    return !!answers && Object.keys(answers).some((aId) => answers[aId] === 1);
  },
};
export default handler;
