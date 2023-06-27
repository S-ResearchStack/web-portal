import React from 'react';
import useMount from 'react-use/lib/useMount';

import styled from 'styled-components';

import { isTeamAdmin } from 'src/modules/auth/userRole';
import StudyLayout, { StudyLayoutProps } from 'src/modules/studies/StudyLayout';
import SwitchStudy, { SwitchStudyProps } from 'src/modules/studies/SwitchStudy';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import { fetchStudies } from 'src/modules/studies/studies.slice';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';

const ContentWrapper = styled.div``;

type StudiesProps = StudyLayoutProps & Pick<SwitchStudyProps, 'onStudySelectionFinished'>;

const Studies: React.FC<StudiesProps> = ({ ...props }) => {
  const userRole = useAppSelector(userRoleSelector)?.roles;
  const dispatch = useAppDispatch();

  useMount(() => {
    dispatch(fetchStudies());
  });

  return (
    <StudyLayout>
      <ContentWrapper>
        <SwitchStudy canCreate={!!isTeamAdmin(userRole)} {...props} />
      </ContentWrapper>
    </StudyLayout>
  );
};

export default Studies;
