import React, { useState, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import useLifecycles from 'react-use/lib/useLifecycles';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import usePrevious from 'react-use/lib/usePrevious';

import _isEqual from 'lodash/isEqual';
import styled from 'styled-components';

import Dropdown from 'src/common/components/Dropdown';
import { px, typography } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { setSidebarForceCollapsed } from 'src/modules/main-layout/sidebar/sidebar.slice';
import PreviewScreenLayout from 'src/modules/study-management/user-management/common/PreviewScreenLayout';
import { SurveyItem, useSurveyEditor } from '../surveyEditor.slice';
import SurveyPreviewQuestions from './SurveyPreviewQuestions';
import PreviewButton from './PreviewButton';
import { getQuestionHandler } from '../questions';
import { PreviewQuestionAnswers } from '../questions/common/types';
import { getPreviewScreens } from './helpers';
import PreviewProgressBar from './PreviewProgressBar';

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

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${px(24)};
  display: flex;
  flex-direction: column;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: ${px(24)};
  padding-right: ${px(24)};
  height: ${px(56)};
`;

const ProgressContainer = styled.div`
  margin: ${px(12)} ${px(24)} 0;
`;

const useAnswers = (survey: SurveyItem) => {
  const [answersByQuestionId, setAnswersByQuestionId] = useState<
    Record<string, PreviewQuestionAnswers>
  >({});
  const prevSurvey = usePrevious(survey);

  useLayoutEffect(() => {
    if (!survey || !prevSurvey || prevSurvey === survey) {
      return;
    }
    const newAnswers = { ...answersByQuestionId };
    let answersChanged = false;

    survey.questions
      .map((s) => s.children)
      .flat()
      .forEach((q) => {
        const pq = prevSurvey.questions
          .map((s) => s.children)
          .flat()
          .find((qq) => qq.id === q.id);
        if (pq && !_isEqual(q, pq)) {
          const a = answersByQuestionId[q.id];
          const na = getQuestionHandler(q.type).transformAnswersOnQuestionChange({
            question: q,
            previousQuestion: pq,
            answers: a || {},
          });
          if (!_isEqual(na, a)) {
            newAnswers[q.id] = na;
            answersChanged = true;
          }
        }
      });

    if (answersChanged) {
      setAnswersByQuestionId(newAnswers);
    }
  }, [answersByQuestionId, survey, prevSurvey]);

  return {
    getAnswersForQuestion: useCallback(
      (questionId: string) => answersByQuestionId[questionId] || {},
      [answersByQuestionId]
    ),
    setAnswersForQuestion: useCallback(
      (questionId: string, answers: PreviewQuestionAnswers) =>
        setAnswersByQuestionId((a) => ({
          ...a,
          [questionId]: answers,
        })),
      []
    ),
  };
};

const SurveyPreview = () => {
  const dispatch = useAppDispatch();
  const { survey, updateQuestion } = useSurveyEditor();
  const { getAnswersForQuestion, setAnswersForQuestion } = useAnswers(survey);

  const screens = useMemo(
    () => (survey.questions ? getPreviewScreens(survey.questions, getAnswersForQuestion) : []),
    [survey.questions, getAnswersForQuestion]
  );

  const dropdownItems = useMemo(
    () =>
      screens.map((s, idx) => ({
        label: s.label,
        key: idx,
      })),
    [screens]
  );

  const numScreens = screens.length;
  const [activeScreenIdx, setActiveScreenIdx] = useState(0);
  const activeScreen = screens[activeScreenIdx];

  const handleChangeScreen = useCallback(
    (index: number) => {
      if (index > numScreens - 1 || index < 0) {
        return;
      }

      setActiveScreenIdx(index);
    },
    [numScreens]
  );

  useUpdateEffect(() => {
    if (activeScreenIdx > numScreens - 1) {
      handleChangeScreen(numScreens - 1);
    }
  }, [numScreens]);

  useLifecycles(
    () => {
      dispatch(setSidebarForceCollapsed(true));
    },
    () => {
      dispatch(setSidebarForceCollapsed(false));
    }
  );

  const isNextDisabled = !activeScreen?.isComplete;

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <DropdownWrapper>
        <DropdownLabel>Switch to</DropdownLabel>
        <Dropdown items={dropdownItems} activeKey={activeScreenIdx} onChange={setActiveScreenIdx} />
      </DropdownWrapper>
      <PreviewScreenLayout title={survey.title || 'Survey title goes here'}>
        <ProgressContainer>
          <PreviewProgressBar maxIndex={numScreens} activeIndex={activeScreenIdx + 1} />
        </ProgressContainer>
        <Content ref={contentRef}>
          {activeScreen ? (
            <SurveyPreviewQuestions
              contentRef={contentRef}
              questions={activeScreen.questions}
              onChange={updateQuestion}
              onAnswersChange={(questionId, answers) => setAnswersForQuestion(questionId, answers)}
            />
          ) : null}
        </Content>
        <Buttons>
          <PreviewButton
            data-testid="survey-preview-prev"
            disabled={activeScreenIdx === 0}
            width={75}
            onClick={() => handleChangeScreen(activeScreenIdx - 1)}
          >
            Previous
          </PreviewButton>
          <PreviewButton
            data-testid="survey-preview-next"
            width={activeScreenIdx === numScreens - 1 ? 60 : 41}
            onClick={() => handleChangeScreen(activeScreenIdx + 1)}
            disabled={isNextDisabled}
          >
            {activeScreenIdx === numScreens - 1 ? 'Submit' : 'Next'}
          </PreviewButton>
        </Buttons>
      </PreviewScreenLayout>
    </>
  );
};

export default SurveyPreview;
