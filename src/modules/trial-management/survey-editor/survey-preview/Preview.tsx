import styled from 'styled-components';
import React, { FC, useState, useCallback, useMemo } from 'react';
import { useLifecycles, useUpdateEffect } from 'react-use';

import AppbarBack from 'src/assets/icons/appbar_back.svg';
import Plus from 'src/assets/icons/plus.svg';
import Button from 'src/common/components/Button';
import Dropdown from 'src/common/components/Dropdown';
import { animation, colors, px, typography, boxShadow } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { setSidebarForceCollapsed } from 'src/modules/main-layout/sidebar/sidebar.slice';
import { useSurveyEditor } from '../surveyEditor.slice';
import PreviewScreen from './PreviewScreen';
import PreviewButton from './PreviewButton';

const PreviewContainer = styled.div<{ $isOpen: boolean }>`
  min-width: ${({ $isOpen }) => ($isOpen ? px(350) : px(0))};
  height: 100vh;
  padding: ${px(48)} 0 ${px(100)};
  display: flex;
  flex-direction: column;
  box-shadow: ${boxShadow.card};
  background-color: ${colors.updSurface};
  position: sticky;
  top: 0;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: all 300ms ${animation.defaultTiming};
  grid-area: preview;
`;

const CloseButtonWrapper = styled.div`
  height: ${px(48)};
  padding: 0 ${px(37)};
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

const ScrollableScreenContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  width: ${px(270)};
  position: relative;
  box-shadow: ${boxShadow.previewScreen};
  display: flex;
  flex-direction: row;
  max-height: ${px(600)};
  margin: 0 ${px(40)};
`;

const Screen = styled.div`
  width: ${px(360)};
  height: ${px(800)};
  min-height: ${px(800)};
  position: absolute;
  top: 0;
  left: 0;
  transform: scale(0.75) translateY(-17%) translateX(-17%);
  padding: ${px(32)} ${px(24)} 0;
`;

const Header = styled.div`
  display: flex;
  height: ${px(56)};
  align-items: center;
  margin-bottom: ${px(12)};

  svg {
    margin-right: ${px(8)};
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
  height: ${px(56)};
  align-items: center;
  position: absolute;
  bottom: ${px(48)};
  left: ${px(24)};
  width: ${px(312)};
  self-align: flex-end;

  button div {
    ${typography.headingXMedium}
  }
`;

interface PreviewProps {
  isOpen?: boolean;
  onClose: () => void;
}

const Preview: FC<PreviewProps> = ({ isOpen, onClose }: PreviewProps) => {
  const dispatch = useAppDispatch();
  const { survey } = useSurveyEditor();
  const dropdownItems = useMemo(
    () =>
      survey.questions.map((q, index) => ({
        label: `Question ${index + 1}`,
        key: index,
      })),
    [survey.questions]
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

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

  return (
    <PreviewContainer $isOpen={!!isOpen}>
      <CloseButtonWrapper>
        <Button icon={<Plus />} fill="text" width={138} onClick={onClose}>
          Close Preview
        </Button>
      </CloseButtonWrapper>
      <DropdownWrapper>
        <DropdownLabel>Switch to</DropdownLabel>
        <Dropdown
          items={dropdownItems}
          activeKey={activeQuestionIndex}
          onChange={setActiveQuestionIndex}
        />
      </DropdownWrapper>
      <ScrollableScreenContainer>
        <Screen>
          <Header>
            <AppbarBack />
            <SurveyTitle>{survey.title}</SurveyTitle>
          </Header>
          {survey.questions.length ? (
            <PreviewScreen activeQuestionIndex={activeQuestionIndex} />
          ) : null}
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
            >
              {activeQuestionIndex === survey.questions.length - 1 ? 'Submit' : 'Next'}
            </PreviewButton>
          </Buttons>
        </Screen>
      </ScrollableScreenContainer>
    </PreviewContainer>
  );
};

export default Preview;
