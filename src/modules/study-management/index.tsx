import React from 'react';

import SimpleGrid from 'src/common/components/SimpleGrid';

import ParticipantManagement from './participant-management';
import EducationManagement from './user-management/education-management/EducationManagement';
import SurveyManagement from './user-management/task-management/survey/SurveyManagement';

const StudyManagement = () => (
  <SimpleGrid fullScreen>
    <SurveyManagement />
    <ParticipantManagement />
    <EducationManagement />
  </SimpleGrid>
);

export default React.memo(StudyManagement, () => true);
