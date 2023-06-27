import React, { useMemo } from 'react';

import styled from 'styled-components';

import { px } from 'src/styles';
import { QuestionItem } from '../questions';
import { SurveySection } from '../surveyEditor.slice';
import { SkipLogicDropdown } from './common';
import { getAllowedTargets } from './helpers';
import { SkipLogicDestination } from './types';

const Container = styled.div`
  display: grid;
  grid-template-columns: ${px(180)} ${px(460)};
  column-gap: ${px(16)};
`;

const SkipLogicDestinationEditor = ({
  question,
  sections,
  destination,
  onChange,
}: {
  question: QuestionItem;
  sections: SurveySection[];
  destination: SkipLogicDestination;
  onChange: (v: SkipLogicDestination) => void;
}) => {
  const typeItems = useMemo(() => {
    const qType = { key: 'question' as const, label: 'Question' };
    const sType = { key: 'section' as const, label: 'Section' };
    return [qType, sType];
  }, []);

  const targetType = useMemo(
    () => (sections.length > 1 ? 'section' : 'question'),
    [sections.length]
  );

  return (
    <Container>
      <SkipLogicDropdown
        disabled
        arrowIcon={<span />}
        placeholder="Type..."
        items={typeItems}
        activeKey={targetType}
      />
      <SkipLogicDropdown
        placeholder="Destination..."
        items={getAllowedTargets({ ...destination, targetType }, question, sections).map((t) => ({
          key: t.targetId,
          label: t.label,
        }))}
        activeKey={destination.targetId}
        onChange={(targetId) => onChange({ ...destination, targetType, targetId })}
      />
    </Container>
  );
};

export default SkipLogicDestinationEditor;
