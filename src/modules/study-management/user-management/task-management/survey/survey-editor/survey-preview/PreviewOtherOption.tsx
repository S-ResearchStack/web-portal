import React from 'react';

import {
  QuestionItemWrapper,
  AnswersWrapper,
  TextareaOtherAnswer,
  OTHER_ANSWER_ID,
} from '../questions/common';
import type { SingleSelectionQuestionItem } from '../questions/single-selection';
import PreviewRadio from './PreviewRadio';
import PreviewCheckbox from './PreviewCheckbox';
import type { PreviewQuestionAnswers } from '../questions/common/types';
import type { MultipleSelectionQuestionItem } from '../questions/multiple-selection';
import LimitsCounter from '../LimitsCounter';

type PreviewOtherOptionProps = {
  isMultiple?: boolean;
  answers: PreviewQuestionAnswers;
  question: SingleSelectionQuestionItem | MultipleSelectionQuestionItem;
  onCheckChange: (a: PreviewQuestionAnswers) => void;
  onTextChange: (value: string) => void;
};

const MAX_OPTION_NAME_LENGTH = 50;

const PreviewOtherOption = ({
  isMultiple,
  answers,
  question,
  onCheckChange,
  onTextChange,
}: PreviewOtherOptionProps) => {
  const CheckComponent = isMultiple ? PreviewCheckbox : PreviewRadio;

  const optionName = question.answers.find((q) => q.id === OTHER_ANSWER_ID)?.value;

  return (
    <AnswersWrapper>
      <QuestionItemWrapper key={OTHER_ANSWER_ID}>
        <CheckComponent
          checked={!!answers[OTHER_ANSWER_ID]}
          kind={!isMultiple ? 'radio' : undefined}
          onChange={() => onCheckChange({ [OTHER_ANSWER_ID]: answers.other ? 0 : 1 })}
        >
          Other
        </CheckComponent>
      </QuestionItemWrapper>
      <LimitsCounter current={optionName?.length || 0} max={MAX_OPTION_NAME_LENGTH}>
        <TextareaOtherAnswer
          data-testid="textarea-other-answer"
          appearance="description"
          placeholder="Type your answer here"
          onFocus={() => onCheckChange({ [OTHER_ANSWER_ID]: 1 })}
          value={optionName}
          onChange={(evt) =>
            evt.target.value.length <= MAX_OPTION_NAME_LENGTH
              ? onTextChange(evt.target.value)
              : evt.preventDefault()
          }
        />
      </LimitsCounter>
    </AnswersWrapper>
  );
};

export default PreviewOtherOption;
