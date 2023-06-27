import React from 'react';

import styled from 'styled-components';

import QuestionIcon from 'src/assets/icons/question.svg';
import CollapseSection from 'src/common/components/CollapseSection';
import SimpleGrid from 'src/common/components/SimpleGrid';
import Tooltip from 'src/common/components/Tooltip';
import { Path } from 'src/modules/navigation/store';
import { colors } from 'src/styles';
import ParticipantListCard from '../overview/ParticipantListCard';
import DataCollection from './DataCollection';

const QuestionIconStyled = styled(QuestionIcon)`
  fill: ${colors.textSecondaryGray};
`;

const SQL_DOCUMENTATION_URL = 'https://s-healthstack.io/running-a-query.html';

const DataInsights = () => (
  <SimpleGrid fullScreen>
    <CollapseSection title="Participant Management">
      <ParticipantListCard subjectSection={Path.DataCollectionSubject} />
    </CollapseSection>
    <CollapseSection
      title="Data Query"
      headerExtra={
        <Tooltip arrow static trigger="hover" position="l" content="Documentation for Data Query">
          <a
            href={SQL_DOCUMENTATION_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Data Query Documentation"
          >
            <QuestionIconStyled />
          </a>
        </Tooltip>
      }
    >
      <DataCollection />
    </CollapseSection>
  </SimpleGrid>
);

export default DataInsights;
