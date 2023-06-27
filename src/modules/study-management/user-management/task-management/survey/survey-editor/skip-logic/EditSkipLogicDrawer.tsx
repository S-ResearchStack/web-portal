import React, { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import styled, { css } from 'styled-components';
import _isEqual from 'lodash/isEqual';
import useKey from 'react-use/lib/useKey';

import PlusIcon from 'src/assets/icons/plus.svg';
import DeleteIcon from 'src/assets/icons/trash_can.svg';
import Button from 'src/common/components/Button';
import CustomScrollbar from 'src/common/components/CustomScrollbar';
import Drawer from 'src/common/components/Drawer';
import Modal from 'src/common/components/Modal';
import { removeAt, replaceAt } from 'src/common/utils/array';
import { useShowSnackbar } from 'src/modules/snackbar';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import { boxShadow, colors, px, typography } from 'src/styles';
import { renderQuestionTitle } from '../questions/common';
import { surveySectionsSelector, useSurveyEditor } from '../surveyEditor.slice';
import { emptySkipLogicRule, isEmptyRule, isEmptyRules, isNewRulesCanBeAdded } from './helpers';
import {
  cleanupEditSkipLogicQuestion,
  isEditingSkipLogicSelector,
  skipLogicEditQuestionSelector,
  stopEditSkipLogic,
} from './skipLogic.slice';
import SkipLogicRuleEditor from './SkipLogicRuleEditor';
import { QuestionItemSkipLogic, SkipLogicRule } from './types';
import withOnScroll from './withOnScroll';

const HEADER_BUTTON_WIDTH = 164;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${px(32)} 0;
  > * {
    padding: 0 ${px(32)};
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 ${px(32)};
`;

const Title = styled.div`
  ${typography.headingLargeSemibold};
  color: ${colors.textPrimaryDark};
  margin-top: ${px(8)};
`;

const Subheader = styled.div<{ $topShadow?: boolean }>`
  margin-top: ${px(32)};
  display: grid;
  grid-template-areas:
    'idx idx'
    'title remove_btn';
  grid-template-columns: 1fr min-content;
  gap: ${px(16)};
  padding-bottom: ${px(16)};
  z-index: 1;
  ${({ $topShadow }) =>
    $topShadow &&
    css`
      // make box shadow appear only at the bottom
      clip-path: inset(0px 0px ${px(-30)} 0px);
      ${boxShadow.skipLogicHeader}
    `};
`;

const QuestionIdx = styled.div`
  grid-area: idx;
  ${typography.headingSmall};
  color: ${colors.textPrimaryDark};
`;

const QuestionTitle = styled.div`
  grid-area: title;
  ${typography.bodyMediumRegular};
  color: ${colors.textPrimaryDark};
`;

const RemoveAllButton = styled(Button)`
  grid-area: remove_btn;
  height: ${px(24)};
`;

const RulesList = withOnScroll(styled(CustomScrollbar)`
  padding-top: ${px(16)};
  padding-right: ${px(28)}; // override 32 to account for scrollbar
  overflow-y: scroll;
  flex: 1;

  > *:not(:first-child) {
    margin-top: ${px(24)};
  }
`);

const AddRuleButton = styled(Button)``;

const getRuleId = (idx: number) => `rule-${idx}`;

const useScrollToNewItem = (items: SkipLogicRule[]) => {
  const prevItems = usePrevious(items);

  useEffect(() => {
    if (prevItems && prevItems?.length < items.length) {
      const elementSelector = `[id="${getRuleId(items.length - 1)}"]`;
      const element = document.querySelector(elementSelector);
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [prevItems, items.length]);
};

const EditSkipLogicDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDrawerOpened = useAppSelector(isEditingSkipLogicSelector);
  const drawerRef = useRef<HTMLDivElement>(null);

  const sections = useAppSelector(surveySectionsSelector);
  const questions = useMemo(() => sections?.map((s) => s.children).flat() ?? [], [sections]);
  const { question, questionIndex = 0 } = useAppSelector(skipLogicEditQuestionSelector) || {};

  const isMulti = question?.type === 'multiple';

  const [rules, setRules] = useState<SkipLogicRule[]>([]);

  const getEmptyRules = () => [emptySkipLogicRule(isMulti)];

  useLayoutEffect(() => {
    setRules(question?.skipLogic?.rules || getEmptyRules());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const surveyEditor = useSurveyEditor();
  const showSnackbar = useShowSnackbar();

  const getSkipLogicToSave = (): QuestionItemSkipLogic | undefined =>
    isEmptyRules(rules) ? undefined : { rules };

  const onCloseTransitionFinished = () => dispatch(cleanupEditSkipLogicQuestion());

  const stopEditSaveChanges = () => {
    const skipLogic = getSkipLogicToSave();
    const hasChangesFromOriginal = !_isEqual(skipLogic?.rules, question?.skipLogic?.rules);
    if (question && hasChangesFromOriginal) {
      surveyEditor.updateQuestion({
        id: question.id,
        skipLogic,
      });
      showSnackbar({
        text: 'Skip logic saved successfully.',
      });
    }
    dispatch(stopEditSkipLogic());
  };

  const [isUnsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);

  const stopEditDiscardChanges = () => {
    setUnsavedChangesModalOpen(false);
    dispatch(stopEditSkipLogic());
  };

  const handleCancel = () => {
    const skipLogic = getSkipLogicToSave();
    const hasChangesFromOriginal = !_isEqual(skipLogic?.rules, question?.skipLogic?.rules);
    if (hasChangesFromOriginal) {
      setUnsavedChangesModalOpen(true);
    } else {
      stopEditDiscardChanges();
    }
  };

  useKey('Escape', handleCancel, undefined, [handleCancel]);

  const unsavedChangesModal = (
    <Modal
      open={isUnsavedChangesModalOpen}
      title="Unsaved Changes"
      description={[
        'If you leave this page, any changes you have made will be lost. Are you sure you want to leave this page?',
      ]}
      acceptLabel="Leave page"
      declineLabel="Keep editing"
      onAccept={stopEditDiscardChanges}
      onDecline={() => setUnsavedChangesModalOpen(false)}
    />
  );

  const [pendingRemoveRuleIdx, setPendingRemoveRuleIdx] = useState<number | undefined>(undefined);
  const removeRuleModal = (
    <Modal
      open={pendingRemoveRuleIdx !== undefined}
      title="Remove Rule"
      description={[
        'Removing the rule removes this specific conditional jump for this question. The question will proceed to the next question sequentially instead of considering the condition. Are you sure?',
      ]}
      acceptLabel="Remove"
      declineLabel="Cancel"
      onAccept={() => {
        if (pendingRemoveRuleIdx !== undefined) {
          setRules(removeAt(rules, pendingRemoveRuleIdx));
          setPendingRemoveRuleIdx(undefined);
        }
      }}
      onDecline={() => {
        setPendingRemoveRuleIdx(undefined);
      }}
    />
  );

  const [isRemoveSkipLogicModalOpen, setRemoveSkipLogicModalOpen] = useState(false);
  const removeSkipLogicModal = (
    <Modal
      open={isRemoveSkipLogicModalOpen}
      title="Remove Skip Logic"
      description={[
        'Removing the skip logic removes all conditional jump for this question. The question will proceed to the next question sequentially regardless of the answer chosen. Are you sure?',
      ]}
      acceptLabel="Remove skip logic"
      declineLabel="Cancel"
      onAccept={() => {
        setRemoveSkipLogicModalOpen(false);
        setRules(getEmptyRules());
      }}
      onDecline={() => {
        setRemoveSkipLogicModalOpen(false);
      }}
    />
  );

  const handleRemoveAllRules = () => {
    setRemoveSkipLogicModalOpen(true);
  };

  const handleSave = () => {
    stopEditSaveChanges();
  };

  const handleAddRule = () => {
    setRules([...rules, emptySkipLogicRule(isMulti)]);
  };

  const handleRuleChange = (r: SkipLogicRule, idx: number) => {
    setRules(replaceAt(rules, idx, r));
  };

  const handleRuleDelete = (idx: number) => {
    if (isEmptyRule(rules[idx])) {
      setRules(removeAt(rules, idx));
    } else {
      setPendingRemoveRuleIdx(idx);
    }
  };

  const [isTopShadowVisible, setTopShadowVisible] = useState(false);

  useScrollToNewItem(rules);

  return (
    <>
      <Drawer ref={drawerRef} open={isDrawerOpened} onExited={onCloseTransitionFinished}>
        <Container>
          <HeaderButtons>
            <Button
              fill="text"
              double="left"
              color="primary"
              onClick={handleCancel}
              width={HEADER_BUTTON_WIDTH}
            >
              Cancel
            </Button>
            <Button fill="solid" onClick={handleSave} width={HEADER_BUTTON_WIDTH}>
              Save
            </Button>
          </HeaderButtons>
          <Title>Add Skip Logic</Title>
          <Subheader $topShadow={isTopShadowVisible}>
            <QuestionIdx>Question {questionIndex + 1}</QuestionIdx>
            <QuestionTitle>{renderQuestionTitle(question)}</QuestionTitle>
            <RemoveAllButton
              rippleOff
              width={111}
              fill="text"
              icon={<DeleteIcon />}
              disabled={isEmptyRules(rules)}
              onClick={handleRemoveAllRules}
            >
              Remove all
            </RemoveAllButton>
          </Subheader>
          <RulesList
            onScroll={(s) => {
              const shouldHaveTopShadowVisible = s.y > 0;
              if (isTopShadowVisible !== shouldHaveTopShadowVisible) {
                setTopShadowVisible(shouldHaveTopShadowVisible);
              }
            }}
          >
            {question &&
              rules.map((r, idx) => (
                <SkipLogicRuleEditor
                  key={r.id}
                  id={getRuleId(idx)}
                  question={question}
                  sections={sections || []}
                  rule={r}
                  onChange={(nr) => handleRuleChange(nr, idx)}
                  onDelete={rules.length > 1 ? () => handleRuleDelete(idx) : undefined}
                />
              ))}
            <AddRuleButton
              fill="bordered"
              icon={<PlusIcon />}
              onClick={handleAddRule}
              disabled={!question || !isNewRulesCanBeAdded(question, questions)}
            >
              Add rule
            </AddRuleButton>
          </RulesList>
        </Container>
      </Drawer>
      {unsavedChangesModal}
      {removeRuleModal}
      {removeSkipLogicModal}
    </>
  );
};

export default EditSkipLogicDrawer;
