import React, { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { useLifecycles, useUpdateEffect } from 'react-use';

import styled from 'styled-components';
import usePrevious from 'react-use/lib/usePrevious';

import AppbarBack from 'src/assets/icons/appbar_back.svg';
import Close from 'src/assets/icons/close.svg';
import Button from 'src/common/components/Button';
import Dropdown from 'src/common/components/Dropdown';
import { animation, colors, px, typography, boxShadow } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { setSidebarForceCollapsed } from 'src/modules/main-layout/sidebar/sidebar.slice';
import { SurveyItem, useSurveyEditor } from '../surveyEditor.slice';
import PreviewScreen from './PreviewScreen';
import PreviewButton from './PreviewButton';

const PreviewContainer = styled.div<{ $isOpen: boolean }>`
  min-width: ${({ $isOpen }) => ($isOpen ? px(350) : px(0))};
  height: 100vh;
  padding: ${px(48)} 0 ${px(100)};
  display: flex;
  flex-direction: column;
  box-shadow: ${boxShadow.card};
  background-color: ${colors.surface};
  position: sticky;
  top: 0;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: all 300ms ${animation.defaultTiming};
  grid-area: preview;
`;

const CloseButton = styled(Button)`
  margin-left: ${px(24)};
  > div {
    svg {
      margin-right: ${px(4)};
    }
  }
`;

const DropdownLabel = styled.div`
  ${typography.bodyMediumRegular};
  margin-right: ${px(18)};
  white-space: nowrap;
`;

const DropdownWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: ${px(24)} 0 ${px(24)};
  padding: 0 ${px(40)};
`;

const Container = styled.div`
  // height: ${px(800)};
  // min-height: ${px(800)};
  flex: 1;
  width: ${px(270)};
  position: relative;
  box-shadow: ${boxShadow.previewScreen};
  display: flex;
  flex-direction: row;
  max-height: ${px(600)};
  margin: 0 ${px(40)};
  overflow: hidden;
`;

const Screen = styled.div`
  width: ${px(360)};
  height: 134%;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  transform: scale(0.75) translateY(-17%) translateX(-17%);
`;

const Content = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${px(32)} ${px(24)} ${px(56)};
`;

const Header = styled.div`
  display: flex;
  height: ${px(56)};
  align-items: center;
  margin-bottom: ${px(14)};

  svg {
    margin-right: ${px(16)};
  }
`;

const SurveyTitle = styled.div`
  ${typography.bodyLargeRegular};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: ${px(276)};
`;

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  left: ${px(24)};
  right: ${px(24)};
  bottom: 0;
  height: ${px(75)};
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 50%);
`;

type AnswerItem = Record<string, number | undefined>;

type AnswersMap = Record<string, AnswerItem | undefined>;

const useAnswers = (survey: SurveyItem) => {
  const [answers, setAnswers] = useState<AnswersMap>({});
  const prevSurvey = usePrevious(survey);

  useEffect(() => {
    const preparedAnswers: AnswersMap = Object.fromEntries(
      survey.questions.map((question) => {
        const prevQuestion = prevSurvey?.questions.find((q) => q.id === question.id);
        const isTypeChanged = prevQuestion && prevQuestion.type !== question.type;

        switch (question.type) {
          case 'multiple':
          case 'single':
            return [
              question.id,
              !isTypeChanged
                ? Object.fromEntries(
                    question.answers.map((answer) => [
                      answer.id,
                      answers[question.id]?.[answer.id] || 0,
                    ])
                  )
                : undefined,
            ];

          case 'slider':
            return [
              question.id,
              typeof answers[question.id]?.[question.id] !== 'undefined' && !isTypeChanged
                ? {
                    [question.id]:
                      typeof answers[question.id]?.[question.id] === 'number'
                        ? Math.min(
                            Math.max(
                              answers[question.id]?.[question.id] as number,
                              question.answers[0].value as number
                            ),
                            question.answers[1].value as number
                          )
                        : undefined,
                  }
                : undefined,
            ];

          default:
            throw new Error('Unexpected question type');
        }
      })
    );

    setAnswers(preparedAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survey]);

  const setAnswer = useCallback(
    (idx: string, answer: AnswerItem) => {
      const currentAnswer = survey.questions.find((q) => q.id === idx);

      if (currentAnswer) {
        setAnswers({
          ...answers,
          [idx]: currentAnswer.type === 'multiple' ? { ...answers[idx], ...answer } : answer,
        });
      }
    },
    [answers, survey]
  );

  return {
    answers,
    setAnswer,
  };
};

interface PreviewProps {
  isOpen?: boolean;
  onClose: () => void;
}

const Preview: FC<PreviewProps> = ({ isOpen, onClose }: PreviewProps) => {
  const dispatch = useAppDispatch();
  const { survey } = useSurveyEditor();
  const { answers, setAnswer } = useAnswers(survey);

  const dropdownItems = useMemo(
    () =>
      survey.questions.map((q, index) => ({
        label: `Question ${index + 1}`,
        key: index,
      })),
    [survey.questions]
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const activeQuestion = useMemo(
    () => survey.questions[activeQuestionIndex],
    [activeQuestionIndex, survey]
  );

  const handleChangeActiveQuestion = useCallback(
    (index: number) => {
      if (index > survey.questions.length - 1 || index < 0) {
        return;
      }

      setActiveQuestionIndex(index);
    },
    [survey.questions.length]
  );

  useUpdateEffect(() => {
    if (activeQuestionIndex > survey.questions.length - 1) {
      handleChangeActiveQuestion(survey.questions.length - 1);
    }
  }, [survey.questions]);

  useLifecycles(
    () => {
      dispatch(setSidebarForceCollapsed(true));
    },
    () => {
      dispatch(setSidebarForceCollapsed(false));
    }
  );

  const isNextDisabled = useMemo(
    () =>
      activeQuestion &&
      !Object.values(answers[activeQuestion.id] || {}).some((v) =>
        activeQuestion.type === 'slider' ? typeof v !== 'undefined' : v
      ) &&
      !survey.questions[activeQuestionIndex].optional,
    [activeQuestion, activeQuestionIndex, answers, survey.questions]
  );

  return (
    <PreviewContainer $isOpen={!!isOpen}>
      <CloseButton icon={<Close />} fill="text" width={164} onClick={onClose}>
        Close Preview
      </CloseButton>
      <DropdownWrapper>
        <DropdownLabel>Switch to</DropdownLabel>
        <Dropdown
          items={dropdownItems}
          activeKey={activeQuestionIndex}
          onChange={setActiveQuestionIndex}
        />
      </DropdownWrapper>
      <Container>
        <Screen>
          <Content>
            <Header>
              <AppbarBack />
              <SurveyTitle>{survey.title || 'Survey title goes here'}</SurveyTitle>
            </Header>
            {survey.questions.length ? (
              <PreviewScreen
                activeQuestion={activeQuestion}
                activeQuestionIndex={activeQuestionIndex}
                answers={answers}
                setAnswer={setAnswer}
              />
            ) : null}
          </Content>
          <Buttons>
            <PreviewButton
              disabled={activeQuestionIndex === 0}
              width={75}
              onClick={() => handleChangeActiveQuestion(activeQuestionIndex - 1)}
            >
              Previous
            </PreviewButton>
            <PreviewButton
              width={activeQuestionIndex === survey.questions.length - 1 ? 60 : 41}
              onClick={() => handleChangeActiveQuestion(activeQuestionIndex + 1)}
              disabled={isNextDisabled}
            >
              {activeQuestionIndex === survey.questions.length - 1 ? 'Submit' : 'Next'}
            </PreviewButton>
          </Buttons>
        </Screen>
      </Container>
    </PreviewContainer>
  );
};

export default Preview;
