import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDragLayer } from 'react-dnd';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import PlusIcon from 'src/assets/icons/plus.svg';
import Button from 'src/common/components/Button';
import SimpleGrid from 'src/common/components/SimpleGrid';
import { colors, px } from 'src/styles';
import PublishSurvey from './publish-survey/PublishSurvey';
import Preview from './survey-preview/Preview';
import { useSurveyEditor } from './surveyEditor.slice';
import Header, { HEADER_HEIGHT } from './Header';
import QuestionsEditor, { LIST_ITEM_MARGIN } from './QuestionsEditor';
import HelpFloatButton from './HelpFloatButton';

const SurveyEditorContainer = styled.div`
  display: flex;
`;

const AddQuestionButton = styled(Button)`
  border: ${px(1)} solid ${colors.updPrimary};
  margin-top: ${px(36)};
  margin-bottom: ${px(38)};
  z-index: 3;
`;

const Footer = styled.div`
  position: fixed;
  top: calc(100vh * 2 - ${px(56)} - ${px(40)});
  right: 0;
  width: 100vw;
  height: ${px(56)};
  z-index: 2;
`;

const ContentContainer = styled.div<{ $previewOpened: boolean }>`
  background-color: ${colors.updBackground};
  width: 100%;
  display: grid;
  grid-template-areas:
    'header'
    'body';
  grid-template-rows: ${px(80 + 32)} 1fr; // where 80 is header height and 32 is padding top
  grid-template-columns: 1fr;
  position: relative;
`;

const { body } = document;
const config = { attributes: true, childList: true, subtree: true };

const SurveyEditor = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPublishOpened, setPublishOpened] = useState(false);
  const { isDragging } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
  }));
  const { loadSurvey, savedOn, addQuestion, validateSurvey, saveSurvey } = useSurveyEditor();
  const [isPreviewOpened, setPreviewOpened] = useState(false);

  const pathParams = useParams() as { surveyId: string };
  const studyId = useSelectedStudyId();
  useEffect(() => {
    studyId && pathParams.surveyId && loadSurvey({ studyId, surveyId: pathParams.surveyId });
  }, [studyId, pathParams.surveyId, loadSurvey]);

  useEffect(() => {
    const scrollToNewQuestion = (mutationList: Array<MutationRecord>) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList' && !isDragging) {
          if ((mutation.target as Element).id === 'draggable-list-container') {
            if (mutation.addedNodes.length) {
              const node = mutation.addedNodes[0] as Element;
              const { top } = node.getBoundingClientRect();
              containerRef.current?.scrollBy({
                top: top - (HEADER_HEIGHT + LIST_ITEM_MARGIN),
                behavior: 'smooth',
              });
            }
          }
        }
      }
    };
    const observer = new MutationObserver(scrollToNewQuestion);
    observer.observe(body, config);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const handlePublish = useCallback(() => {
    if (validateSurvey()) {
      saveSurvey();
      setPublishOpened(true);
    }
    // TODO: should scroll it question with error is not in focus
  }, [validateSurvey, saveSurvey]);

  return (
    <>
      <SurveyEditorContainer ref={containerRef}>
        <ContentContainer $previewOpened={isPreviewOpened}>
          <Header
            onPublish={handlePublish}
            onPreview={() => setPreviewOpened(true)}
            showPreview={!isPreviewOpened}
            savedOn={savedOn}
          />
          <SimpleGrid fullScreen>
            <QuestionsEditor />
            <AddQuestionButton fill="text" icon={<PlusIcon />} onClick={addQuestion}>
              Add question
            </AddQuestionButton>
          </SimpleGrid>
          <PublishSurvey open={isPublishOpened} onClose={() => setPublishOpened(false)} />
        </ContentContainer>
        {isPreviewOpened && (
          <Preview isOpen={isPreviewOpened} onClose={() => setPreviewOpened(false)} />
        )}
      </SurveyEditorContainer>
      <Footer>
        <HelpFloatButton />
      </Footer>
    </>
  );
};

export default SurveyEditor;
