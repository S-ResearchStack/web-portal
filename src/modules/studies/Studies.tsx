import React from 'react';
import StudyLayout, { StudyLayoutProps } from 'src/modules/studies/StudyLayout';
import SwitchStudy, { SwitchStudyProps } from 'src/modules/studies/SwitchStudy';
import styled from 'styled-components';
import { px } from 'src/styles';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import useMount from 'react-use/lib/useMount';
import { fetchStudies } from 'src/modules/studies/studies.slice';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';

const ContentWrapper = styled.div`
  margin-bottom: ${px(92)};
`;

type StudiesProps = StudyLayoutProps & Pick<SwitchStudyProps, 'onStudySelectionFinished'>;

const Studies: React.FC<StudiesProps> = ({ hideUser, ...props }) => {
  const userRole = useAppSelector(userRoleSelector);
  const dispatch = useAppDispatch();

  useMount(() => {
    dispatch(fetchStudies());
  });

  return (
    <StudyLayout hideUser={hideUser}>
      <ContentWrapper>
        <SwitchStudy canCreate={userRole?.role === 'team-admin'} {...props} />
      </ContentWrapper>
    </StudyLayout>
  );
};

export default Studies;
