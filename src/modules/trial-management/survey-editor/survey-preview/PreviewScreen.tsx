import styled from 'styled-components';
import React, { FC, useMemo } from 'react';

import { colors, px, typography } from 'src/styles';
import { useSurveyEditor, ScalableAnswer, QuestionItem } from '../surveyEditor.slice';
import PreviewProgressBar from './PreviewProgressBar';
import PreviewSlider from './PreviewSlider';
import PreviewRadio from './PreviewRadio';
import PreviewCheckbox from './PreviewCheckbox';

const ScreenContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuestionHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${px(30)};
`;

const QuestionTitle = styled.div`
  ${typography.headingSmall};
  color: ${colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  width: 100%;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: pre-line;
`;

const QuestionDescription = styled.div`
  margin: ${px(4)} 0 ${px(16)};
  ${typography.bodySmallRegular};
  line-height: ${px(18)};
  color: ${colors.textSecondaryGray};
  height: ${px(54)};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  width: 100%;
  -webkit-line-clamp: 3; /* number of lines to show */
  line-clamp: 3;
  -webkit-box-orient: vertical;
  white-space: pre-line;
`;

const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SliderWrapper = styled.div`
  margin-top: 30%;
`;

const QuestionItemWrapper = styled.div`
  display: flex;
  align-items: center;
`;

interface PreviewScreenProps {
  activeQuestionIndex: number;
  activeQuestion: QuestionItem;
  answers: Record<string, Record<string, number | undefined> | undefined>;
  setAnswer: (idx: string, answer: Record<string, number | undefined>) => void;
}

const PreviewScreen: FC<PreviewScreenProps> = ({
  activeQuestionIndex,
  activeQuestion,
  setAnswer,
  answers,
}: PreviewScreenProps) => {
  const { survey } = useSurveyEditor();

  const questionTitle = useMemo(() => {
    const titlePostfix = !activeQuestion.optional && activeQuestion.title ? '*' : '';
    const title = activeQuestion.title || 'Question title goes here';

    return (
      <QuestionHeader>
        <QuestionTitle>{`${title}${titlePostfix}`}</QuestionTitle>
        <QuestionDescription>{activeQuestion.description}</QuestionDescription>
      </QuestionHeader>
    );
  }, [activeQuestion]);

  const multipleQuestion = useMemo(
    () => (
      <QuestionContainer>
        {questionTitle}
        {activeQuestion.answers.map((a, idx) => (
          <QuestionItemWrapper key={a.id}>
            <PreviewCheckbox
              checked={!!answers[activeQuestion.id]?.[a.id]}
              value={idx}
              onChange={() => {
                setAnswer(activeQuestion.id, {
                  [a.id]: answers[activeQuestion.id]?.[a.id] ? 0 : 1,
                });
              }}
            >
              {a.value ? `${a.value}` : `Option ${idx + 1}`}
            </PreviewCheckbox>
          </QuestionItemWrapper>
        ))}
      </QuestionContainer>
    ),
    [activeQuestion.answers, activeQuestion.id, answers, questionTitle, setAnswer]
  );

  const singleQuestion = useMemo(
    () => (
      <QuestionContainer>
        {questionTitle}
        {activeQuestion.answers.map((a, idx) => (
          <QuestionItemWrapper key={a.id}>
            <PreviewRadio
              checked={!!answers[activeQuestion.id]?.[a.id]}
              value={idx}
              kind="radio"
              onChange={() =>
                setAnswer(activeQuestion.id, { [a.id]: answers[activeQuestion.id]?.[a.id] ? 0 : 1 })
              }
            >
              {a.value ? `${a.value}` : `Option ${idx + 1}`}
            </PreviewRadio>
          </QuestionItemWrapper>
        ))}
      </QuestionContainer>
    ),
    [activeQuestion.answers, activeQuestion.id, answers, questionTitle, setAnswer]
  );

  const sliderQuestion = useMemo(() => {
    const minAnswer = activeQuestion.answers[0] as ScalableAnswer;
    const maxAnswer = activeQuestion.answers[1] as ScalableAnswer;

    if (!minAnswer || !maxAnswer) {
      return null;
    }

    return (
      <QuestionContainer>
        {questionTitle}
        <SliderWrapper>
          <PreviewSlider
            maxIndex={+maxAnswer.value}
            minIndex={+minAnswer.value}
            maxLabel={maxAnswer.label}
            minLabel={minAnswer.label}
            activeIndex={answers[activeQuestion.id]?.[activeQuestion.id]}
            onChange={(index) => setAnswer(activeQuestion.id, { [activeQuestion.id]: index })}
          />
        </SliderWrapper>
      </QuestionContainer>
    );
  }, [activeQuestion.answers, activeQuestion.id, answers, questionTitle, setAnswer]);

  const activeQuestionComponent = useMemo(() => {
    switch (activeQuestion.type) {
      case 'multiple':
        return multipleQuestion;
      case 'slider':
        return sliderQuestion;
      default:
        return singleQuestion;
    }
  }, [activeQuestion, multipleQuestion, singleQuestion, sliderQuestion]);

  return (
    <ScreenContent data-testid="survey-preview-screen">
      <PreviewProgressBar
        maxIndex={survey.questions.length}
        activeIndex={activeQuestionIndex + 1}
      />
      {activeQuestionComponent}
    </ScreenContent>
  );
};

export default PreviewScreen;
