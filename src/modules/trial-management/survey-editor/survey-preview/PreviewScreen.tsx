import styled from 'styled-components';
import React, { FC, useState, useMemo } from 'react';
import { useUpdateEffect } from 'react-use';
import _without from 'lodash/without';

import { colors, px, typography } from 'src/styles';
import { useSurveyEditor, ScalableAnswer } from '../surveyEditor.slice';
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
  color: ${colors.updTextPrimary};
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
  color: ${colors.updTextSecondaryGray};
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
}

const PreviewScreen: FC<PreviewScreenProps> = ({ activeQuestionIndex }: PreviewScreenProps) => {
  const { survey } = useSurveyEditor();
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const activeQuestion = useMemo(
    () => survey.questions[activeQuestionIndex],
    [activeQuestionIndex, survey]
  );

  useUpdateEffect(() => {
    setSelectedIndex(undefined);
    setSelectedIndexes([]);
  }, [activeQuestion, activeQuestionIndex]);

  const questionTitle = useMemo(
    () => (
      <QuestionHeader>
        <QuestionTitle>
          {activeQuestion.optional ? activeQuestion.title : `${activeQuestion.title}*`}
        </QuestionTitle>
        <QuestionDescription>{activeQuestion.description}</QuestionDescription>
      </QuestionHeader>
    ),
    [activeQuestion]
  );

  const multipleQuestion = useMemo(
    () => (
      <QuestionContainer>
        {questionTitle}
        {activeQuestion.answers.map((a, idx) => (
          <QuestionItemWrapper key={a.id}>
            <PreviewCheckbox
              checked={selectedIndexes.includes(idx)}
              value={idx}
              onChange={() =>
                selectedIndexes.includes(idx)
                  ? setSelectedIndexes(_without(selectedIndexes, idx))
                  : setSelectedIndexes(selectedIndexes.concat(idx))
              }
            >
              {`${a.value}`}
            </PreviewCheckbox>
          </QuestionItemWrapper>
        ))}
      </QuestionContainer>
    ),
    [activeQuestion.answers, questionTitle, selectedIndexes]
  );

  const singleQuestion = useMemo(
    () => (
      <QuestionContainer>
        {questionTitle}
        {activeQuestion.answers.map((a, idx) => (
          <QuestionItemWrapper key={a.id}>
            <PreviewRadio
              checked={selectedIndex === idx}
              value={idx}
              kind="radio"
              onChange={() => setSelectedIndex(idx)}
            >
              {`${a.value}`}
            </PreviewRadio>
          </QuestionItemWrapper>
        ))}
      </QuestionContainer>
    ),
    [activeQuestion.answers, questionTitle, selectedIndex]
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
            activeIndex={selectedIndex}
            onChange={(index) => setSelectedIndex(index)}
          />
        </SliderWrapper>
      </QuestionContainer>
    );
  }, [activeQuestion, questionTitle, selectedIndex]);

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
    <ScreenContent>
      <PreviewProgressBar
        maxIndex={survey.questions.length}
        activeIndex={activeQuestionIndex + 1}
      />
      {activeQuestionComponent}
    </ScreenContent>
  );
};

export default PreviewScreen;
