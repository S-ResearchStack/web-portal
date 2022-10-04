import React from 'react';

import { Path } from 'src/modules/navigation/store';
import CollapseSection from 'src/common/components/CollapseSection';
import SimpleGrid from 'src/common/components/SimpleGrid';
import ParticipantListCard from '../overview/ParticipantListCard';
import SurveyManagement from './SurveyManagement';

const StudyManagement = () => (
  <SimpleGrid fullScreen>
    <CollapseSection title="Participant Management">
      <ParticipantListCard subjectSection={Path.TrialManagementSubject} />
    </CollapseSection>
    <SurveyManagement />
  </SimpleGrid>
);

export default React.memo(StudyManagement, () => true);
