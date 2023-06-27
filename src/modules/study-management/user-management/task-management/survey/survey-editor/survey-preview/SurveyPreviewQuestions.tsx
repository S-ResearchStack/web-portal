import React, { FC } from 'react';

import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';
import { QuestionItem } from '../surveyEditor.slice';
import { getQuestionHandler } from '../questions';
import { PreviewQuestionAnswers } from '../questions/common/types';
import { PreviewScreenQuestion } from './helpers';

const ScreenContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${px(32)};
`;

const QuestionHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuestionTitle = styled.div`
  ${typography.headingSmall};
  color: ${colors.textPrimary};
  width: 100%;
`;

const QuestionDescription = styled.div`
  margin: ${px(4)} 0 ${px(16)};
  ${typography.bodySmallRegular};
  line-height: ${px(18)};
  color: ${colors.textSecondaryGray};
  width: 100%;
`;

const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  textarea {
    height: ${px(114)};
  }
`;

interface PreviewScreenProps {
  questions: PreviewScreenQuestion[];
  onAnswersChange: (questionId: QuestionItem['id'], answers: PreviewQuestionAnswers) => void;
  onChange: (qi: Partial<QuestionItem>) => void;
  contentRef: React.RefObject<HTMLElement>;
}

const SurveyPreviewQuestions: FC<PreviewScreenProps> = ({
  contentRef,
  questions,
  onAnswersChange,
  onChange,
}: PreviewScreenProps) => (
  <ScreenContent data-testid="survey-preview-questions">
    {questions.map((question) => (
      <QuestionContainer key={question.id}>
        {(() => {
          const titlePostfix = !question.options.optional && question.title ? '*' : '';
          const title = question.title || 'Question title goes here';

          return (
            <QuestionHeader>
              <QuestionTitle>{`${title}${titlePostfix}`}</QuestionTitle>
              <QuestionDescription>{question.description}</QuestionDescription>
            </QuestionHeader>
          );
        })()}
        {(() =>
          getQuestionHandler(question.type)?.renderPreviewContent({
            containerRef: contentRef,
            question,
            answers: question.previewAnswer,
            onAnswersChange: (answers) => onAnswersChange(question.id, answers),
            onChange,
          }))()}
      </QuestionContainer>
    ))}
  </ScreenContent>
);

export default SurveyPreviewQuestions;
