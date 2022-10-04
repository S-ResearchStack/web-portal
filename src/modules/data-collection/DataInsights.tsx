import React from 'react';
import styled from 'styled-components';

import QuestionIcon from 'src/assets/icons/question.svg';
import CollapseSection from 'src/common/components/CollapseSection';
import SimpleGrid from 'src/common/components/SimpleGrid';
import Tooltip from 'src/common/components/Tooltip';
import { userRoleSelector } from 'src/modules/auth/auth.slice';
import { useAppSelector } from 'src/modules/store';
import { Path } from 'src/modules/navigation/store';
import AvgRestingHrOverDayCard from 'src/modules/overview/AvgRestingHrOverDayCard';
import AvgRestingHrWithAgeCard from 'src/modules/overview/AvgRestingHrWithAgeCard';
import { px, colors } from 'src/styles';
import { getRoleFunction } from '../auth/userRole';
import ParticipantListCard from '../overview/ParticipantListCard';
import DataCollection from './DataCollection';

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(32)};
`;

const QuestionIconStyled = styled(QuestionIcon)`
  fill: ${colors.updTextSecondaryGray};
`;

const SQL_DOCUMENTATION_URL = 'https://en.wikipedia.org/wiki/SQL';

const DataInsights = () => {
  const userRole = useAppSelector(userRoleSelector);

  return (
    <SimpleGrid fullScreen>
      {userRole && getRoleFunction(userRole.role) === 'principal_investigator' ? (
        <CollapseSection title="Sensor Data">
          <SectionContainer>
            <AvgRestingHrOverDayCard />
            <AvgRestingHrWithAgeCard />
          </SectionContainer>
        </CollapseSection>
      ) : (
        <CollapseSection title="Participant Management">
          <ParticipantListCard subjectSection={Path.DataCollectionSubject} />
        </CollapseSection>
      )}
      <CollapseSection
        title="Data Query"
        headerExtra={
          <Tooltip
            arrow
            trigger="hover"
            position="l"
            dynamic
            content="Documentation for Data Query"
          >
            <a href={SQL_DOCUMENTATION_URL} target="_blank" rel="noreferrer">
              <QuestionIconStyled />
            </a>
          </Tooltip>
        }
      >
        <DataCollection />
      </CollapseSection>
    </SimpleGrid>
  );
};

export default DataInsights;
