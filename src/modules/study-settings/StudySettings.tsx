import React, { FC, ReactElement, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { useHistory } from 'react-router-dom';

import { useShowSnackbar } from 'src/modules/snackbar';
import SimpleGrid from 'src/common/components/SimpleGrid';
import CollapseSection from 'src/common/components/CollapseSection';

import MembersList from './MembersList';
import MemberEditDrawer from './MemberEditDrawer';
import { NEW_STUDY_QUERY_PARAM_NAME } from './utils';

interface StudySettingsProps {
  isSwitchStudy: boolean;
  isSwitchStudyInTransition: boolean;
}

const StudySettings: FC<StudySettingsProps> = ({
  isSwitchStudy,
  isSwitchStudyInTransition,
}): ReactElement => {
  const isNewStudy = useSearchParam(NEW_STUDY_QUERY_PARAM_NAME) === 'true';
  const showSnackbar = useShowSnackbar();
  const history = useHistory();
  const [isCollapsed, setCollapsed] = useState(false);

  useEffectOnce(() => {
    if (isNewStudy) {
      showSnackbar({ text: 'Study created.' });
      history.replace({ pathname: history.location.pathname }); // to remove query params
    }
  });

  return (
    <SimpleGrid data-testid="settings" fullScreen>
      <CollapseSection title="Settings" onCollapsedChange={setCollapsed}>
        <MembersList
          shouldShowInviteTooltip={isNewStudy}
          canShowInviteTooltip={!isSwitchStudy && !isSwitchStudyInTransition && !isCollapsed}
        />
      </CollapseSection>
      <MemberEditDrawer />
    </SimpleGrid>
  );
};

export default StudySettings;
