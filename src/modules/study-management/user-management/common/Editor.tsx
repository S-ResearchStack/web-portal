import React, { useCallback, useMemo, useState } from 'react';

import styled from 'styled-components';

import { Timestamp } from 'src/common/utils/datetime';
import SimpleGrid, {
  desktopMq,
  DeviceScreenMatches,
  SimpleGridSchema,
} from 'src/common/components/SimpleGrid';
import { colors, px } from 'src/styles';
import Header, {
  HEADER_HEIGHT,
  HEADER_LAPTOP_HEIGHT,
  HEADER_PADDING_TOP,
} from '../task-management/survey/survey-editor/Header';
import ExitPrompt from '../task-management/survey/survey-editor/ExitPrompt';
import EditorSectionsManager, {
  EditorItemProps,
  EditorSections,
  RenderSectionActionsParams,
} from '../task-management/survey/EditorSectionsManager';
import {
  EditorItem,
  EditorSection,
  RenderSectionHeaderParams,
  RenderSectionTitleParams,
} from '../task-management/survey/QuestionEditorGroup';
import Preview from './Preview';
import HelpFloatButton, { FloatButtonOffset, HelpFloatButtonProps } from './HelpFloatButton';

const EditorContainer = styled.div`
  display: flex;
`;

const ContentContainer = styled.div<{ $previewOpened: boolean }>`
  background-color: ${colors.background};
  width: 100%;
  display: grid;
  grid-template-areas:
    'header'
    'body';
  grid-template-rows: ${px(HEADER_LAPTOP_HEIGHT + HEADER_PADDING_TOP)} 1fr;
  grid-template-columns: 1fr;
  position: relative;
  height: fit-content;

  @media screen and ${desktopMq.media} {
    grid-template-rows: ${px(HEADER_HEIGHT + HEADER_PADDING_TOP)} 1fr;
  }
`;

const usePreview = (shouldPreviewOpen: () => boolean) => {
  const [isPreviewOpened, setPreviewOpened] = useState(false);
  return {
    isOpened: isPreviewOpened,
    open: useCallback(() => shouldPreviewOpen() && setPreviewOpened(true), [shouldPreviewOpen]),
    close: useCallback(() => setPreviewOpened(false), []),
  };
};

const usePublish = (shouldPublish: () => boolean) => {
  const [isPublishOpened, setPublishOpened] = useState(false);
  return {
    isOpened: isPublishOpened,
    open: useCallback(() => shouldPublish() && setPublishOpened(true), [shouldPublish]),
    close: useCallback(() => setPublishOpened(false), []),
  };
};

type EditorProps<D extends EditorItem, S extends EditorSection<D>> = {
  hasSavingError: boolean;
  onRequestSavingErrorExit: () => void;
  savedOn?: Timestamp;
  isSaving?: boolean;
  items: S[];
  sectionsEditor?: EditorSections<D, S>;
  shouldPublish: () => boolean;
  shouldPreviewOpen: () => boolean;
  renderPublish: (params: ReturnType<typeof usePublish>) => JSX.Element;
  renderHeadEditor: () => JSX.Element;
  renderItemsEditor: (item: EditorItemProps<D>) => JSX.Element;
  renderSectionActions?: (item: RenderSectionActionsParams<D, S>) => JSX.Element;
  renderPreview: () => JSX.Element;
  renderSectionHeader?: (params: RenderSectionHeaderParams<S>) => JSX.Element;
  renderSectionTitle?: (params: RenderSectionTitleParams) => JSX.Element | string;
  showSectionActions?: boolean;
  minCardHeight: number;
  sectionTitleTooltip?: React.ReactNode;
  backTitle: string;
  floatButton?: HelpFloatButtonProps;
  checkIfShowMergeConfirmNeeds?: (section: S, idx: number, sections: S[]) => boolean;
};

const Editor = <D extends EditorItem, S extends EditorSection<D>>({
  hasSavingError,
  onRequestSavingErrorExit,
  savedOn,
  isSaving,
  shouldPublish,
  shouldPreviewOpen,
  renderPublish,
  renderHeadEditor,
  renderItemsEditor,
  renderSectionActions,
  items,
  sectionsEditor,
  renderPreview,
  renderSectionHeader,
  renderSectionTitle,
  showSectionActions,
  minCardHeight,
  sectionTitleTooltip,
  backTitle,
  floatButton,
  checkIfShowMergeConfirmNeeds,
}: EditorProps<D, S>) => {
  const preview = usePreview(shouldPreviewOpen);
  const publish = usePublish(shouldPublish);

  const customGridSchema: Partial<DeviceScreenMatches<Partial<SimpleGridSchema>>> | undefined =
    useMemo(() => {
      if (!preview.isOpened) {
        return undefined;
      }

      return {
        desktop: {
          columnsCount: 10,
          // FIXME: into the Figma file we have 6 columns by 71px and 4 columns by 70px
          columnWidth: (71 * 6 + 70 * 4) / 10,
          marginHorizontal: 40,
        },
        laptop: {
          columnsCount: 9,
          columnWidth: 50,
          marginHorizontal: 28,
        },
      };
    }, [preview.isOpened]);

  return (
    <EditorContainer data-testid="survey-editor">
      <ExitPrompt when={hasSavingError} onExitCb={onRequestSavingErrorExit} />
      <ContentContainer $previewOpened={preview.isOpened}>
        <Header
          backTitle={backTitle}
          onPublish={publish.open}
          onPreview={preview.open}
          showPreview={!preview.isOpened}
          savedOn={savedOn}
          hasSavingError={hasSavingError}
          isSaving={isSaving}
          customGridSchema={customGridSchema}
        />
        <SimpleGrid fullScreen customSchema={customGridSchema}>
          {renderHeadEditor()}
          <EditorSectionsManager
            sectionTitleTooltip={sectionTitleTooltip}
            renderSectionTitle={renderSectionTitle}
            compactCardView={preview.isOpened}
            sectionsEditor={sectionsEditor}
            showSectionActions={showSectionActions}
            items={items}
            minCardHeight={minCardHeight}
            renderEditor={renderItemsEditor}
            renderSectionActions={renderSectionActions}
            renderSectionHeader={renderSectionHeader}
            checkIfShowMergeConfirmNeeds={checkIfShowMergeConfirmNeeds}
          />
        </SimpleGrid>
        {floatButton && <FloatButtonOffset />}
      </ContentContainer>
      {preview.isOpened && (
        <Preview
          open={preview.isOpened}
          onRequestClose={preview.close}
          renderContent={renderPreview}
        />
      )}
      {renderPublish(publish)}
      {floatButton && !preview.isOpened && <HelpFloatButton {...floatButton} />}
    </EditorContainer>
  );
};

export default Editor;
