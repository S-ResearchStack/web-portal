import React from 'react';
import StudyLayout, { StudyLayoutProps } from 'src/modules/studies/StudyLayout';
import SwitchStudy, { SwitchStudyProps } from 'src/modules/studies/SwitchStudy';
import styled from 'styled-components';
import { px } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import useMount from 'react-use/lib/useMount';
import { fetchStudies } from 'src/modules/studies/studies.slice';

const ContentWrapper = styled.div`
  margin-bottom: ${px(92)};
`;

type StudiesProps = StudyLayoutProps & SwitchStudyProps;

const Studies: React.FC<StudiesProps> = ({ hideUser, ...props }) => {
  const dispatch = useAppDispatch();

  useMount(() => {
    dispatch(fetchStudies());
  });

  return (
    <StudyLayout hideUser={hideUser}>
      <ContentWrapper>
        <SwitchStudy {...props} />
      </ContentWrapper>
    </StudyLayout>
  );
};

export default Studies;
