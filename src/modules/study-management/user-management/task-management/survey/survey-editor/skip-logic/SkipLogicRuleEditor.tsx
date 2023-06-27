import React from 'react';

import styled from 'styled-components';

import DeleteIcon from 'src/assets/icons/trash_can.svg';
import Button from 'src/common/components/Button';
import { insertAfter, removeAt, replaceAt } from 'src/common/utils/array';
import { colors, px, typography } from 'src/styles';
import { QuestionItem } from '../questions';
import { SurveySection } from '../surveyEditor.slice';
import { emptySkipLogicCondition } from './helpers';
import SkipLogicConditionEditor from './SkipLogicConditionEditor';
import SkipLogicDestinationEditor from './SkipLogicDestinationEditor';
import { SkipLogicRule } from './types';
import SkipLogicConditionClauseEditor from './SkipLogicConditionClauseEditor';

const Container = styled.div`
  background: ${colors.background};
  padding: ${px(24)};
  position: relative;
`;

const Header = styled.div`
  ${typography.bodySmallSemibold};
  color: ${colors.textPrimary};
  margin-bottom: ${px(8)};
`;

const Section = styled.div`
  &:not(:first-child) {
    margin-top: ${px(24)};
  }
`;

const ConditionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(16)};
  margin-bottom: ${px(16)};
`;

const DeleteButton = styled(Button)`
  position: absolute !important;
  right: ${px(24)};
  bottom: ${px(24)};
`;

type Props = {
  id: string;
  question: QuestionItem;
  sections: SurveySection[];
  rule: SkipLogicRule;
  onChange: (r: SkipLogicRule) => void;
  onDelete?: () => void;
};

const SkipLogicRuleEditor: React.FC<Props> = ({
  id,
  question,
  sections,
  rule,
  onChange,
  onDelete,
}) => (
  <Container id={id}>
    <Section>
      <Header>If</Header>
      <ConditionsContainer>
        {rule.conditions.map((condition, idx) => {
          const isLast = idx === rule.conditions.length - 1;
          return (
            <React.Fragment key={condition.id}>
              <SkipLogicConditionEditor
                condition={condition}
                question={question}
                onChange={(c) =>
                  onChange({
                    ...rule,
                    conditions: replaceAt(rule.conditions, idx, c),
                  })
                }
                onAdd={() => {
                  const conditions = [...rule.conditions];
                  // reset clause to default 'and' when adding an item
                  conditions[idx] = {
                    ...conditions[idx],
                    clause: 'and',
                  };
                  onChange({
                    ...rule,
                    conditions: insertAfter(
                      conditions,
                      idx,
                      emptySkipLogicCondition(question.type === 'multiple')
                    ),
                  });
                }}
                onRemove={
                  rule.conditions.length === 1
                    ? undefined
                    : () => {
                        onChange({
                          ...rule,
                          conditions: removeAt(rule.conditions, idx),
                        });
                      }
                }
              />
              {!isLast && (
                <SkipLogicConditionClauseEditor
                  clause={condition.clause}
                  onChange={(clause) => {
                    onChange({
                      ...rule,
                      conditions: replaceAt(rule.conditions, idx, { ...condition, clause }),
                    });
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </ConditionsContainer>
    </Section>
    <Section>
      <Header>Then skip to</Header>
      <SkipLogicDestinationEditor
        question={question}
        sections={sections}
        destination={rule.destination}
        onChange={(d) => {
          onChange({
            ...rule,
            destination: d,
          });
        }}
      />
    </Section>
    {onDelete && (
      <DeleteButton
        data-testid="remove-rule"
        onClick={onDelete}
        fill="text"
        icon={<DeleteIcon />}
        rate="icon"
        aria-label="Delete Rule"
      />
    )}
  </Container>
);

export default SkipLogicRuleEditor;
