import React from 'react';

import styled from 'styled-components';

import MinusIcon from 'src/assets/icons/minus_button.svg';
import PlusIcon from 'src/assets/icons/plus_button.svg';
import Button from 'src/common/components/Button';
import { px } from 'src/styles';
import { QuestionItem } from '../questions';
import { SkipLogicDropdown } from './common';
import { getAllowedSelectedCountValues, getAllowedSpecificOptions } from './helpers';
import { SkipLogicCondition } from './types';

const Container = styled.div<{ $isMulti?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $isMulti }) =>
    $isMulti ? `${px(180)} ${px(264)} ${px(180)} 1fr` : `${px(388)} ${px(252)} 1fr`};
  column-gap: ${px(16)};
`;

const AddRemoveButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${px(8)};
`;

const SkipLogicConditionEditor = ({
  question,
  condition,
  onChange,
  onAdd,
  onRemove,
}: {
  question: QuestionItem;
  condition: SkipLogicCondition;
  onChange: (c: SkipLogicCondition) => void;
  onAdd?: () => void;
  onRemove?: () => void;
}) => {
  const handleChange = (c: Partial<SkipLogicCondition>, fullUpdate = false) => {
    onChange(fullUpdate ? (c as SkipLogicCondition) : { ...condition, ...c });
  };

  const isMulti = question.type === 'multiple';

  return (
    <Container $isMulti={isMulti}>
      {isMulti && (
        <SkipLogicDropdown
          key="type"
          placeholder="Logic type..."
          placeholderTextColor="textPrimary"
          items={[
            {
              key: 'specific_option',
              label: 'Specific option',
              tooltip: 'Creates the rule based on a selected option.',
            },
            {
              key: 'selected_count',
              label: 'Total selected',
              tooltip: 'Creates the rule based on the number of options selected.',
            },
          ]}
          activeKey={condition.type}
          onChange={(type) =>
            handleChange({ id: condition.id, type, clause: condition.clause }, true)
          }
        />
      )}
      {condition.type === 'empty' && (
        <>
          <SkipLogicDropdown key="option" placeholder="Option..." disabled />
          <SkipLogicDropdown key="condition" placeholder="Condition..." disabled />
        </>
      )}
      {condition.type === 'specific_option' && (
        <>
          <SkipLogicDropdown
            key="option"
            placeholder="Option..."
            placeholderTextColor={!isMulti ? 'textPrimary' : undefined}
            items={getAllowedSpecificOptions(question).map((o) => ({
              key: o.optionId,
              label: o.label,
            }))}
            activeKey={condition.optionId}
            onChange={(k) => handleChange({ optionId: k })}
          />
          <SkipLogicDropdown
            key="condition"
            placeholder="Condition..."
            items={[
              { key: 'selected', label: 'Is selected' },
              { key: 'not_selected', label: 'Is not selected' },
            ]}
            activeKey={condition.optionCondition}
            onChange={(c) => handleChange({ optionCondition: c })}
          />
        </>
      )}
      {condition.type === 'selected_count' && (
        <>
          <SkipLogicDropdown
            key="condition"
            placeholder="Condition..."
            items={[
              { key: 'equal', label: 'Is equal to' },
              { key: 'not_equal', label: 'Is not equal to' },
              { key: 'greater', label: 'Is greater than' },
              { key: 'greater_or_equal', label: 'Is greater than or equal to' },
              { key: 'less', label: 'Is less than' },
              { key: 'less_or_equal', label: 'Is less than or equal to' },
            ]}
            activeKey={condition.countCondition}
            onChange={(c) => handleChange({ countCondition: c })}
          />
          <SkipLogicDropdown
            key="number"
            placeholder="Number..."
            items={getAllowedSelectedCountValues(question, condition).map((n) => ({
              key: n,
              label: String(n),
            }))}
            activeKey={condition.count}
            onChange={(count) => handleChange({ count })}
          />
        </>
      )}
      <AddRemoveButtonsContainer>
        <Button
          data-testid="remove-condition"
          fill="text"
          icon={<MinusIcon />}
          rate="icon"
          disabled={!onRemove}
          onClick={onRemove}
          aria-label="Remove"
        />
        <Button
          data-testid="add-condition"
          fill="text"
          icon={<PlusIcon />}
          rate="icon"
          disabled={!onAdd}
          onClick={onAdd}
          aria-label="Add"
        />
      </AddRemoveButtonsContainer>
    </Container>
  );
};

export default SkipLogicConditionEditor;
