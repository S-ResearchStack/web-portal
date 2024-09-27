import React from 'react';
import useMount from 'react-use/lib/useMount';

import styled from 'styled-components';

import StudyLayout, { StudyLayoutProps } from 'src/modules/studies/StudyLayout';
import SwitchStudy, { SwitchStudyProps } from 'src/modules/studies/SwitchStudy';
import { useAppDispatch } from 'src/modules/store';
import { fetchStudies } from 'src/modules/studies/studies.slice';

const ContentWrapper = styled.div``;

type StudiesProps = StudyLayoutProps & Pick<SwitchStudyProps, 'onStudySelectionFinished'>;

const Studies: React.FC<StudiesProps> = ({ ...props }) => {
  const dispatch = useAppDispatch();

  useMount(() => {
    dispatch(fetchStudies());
  });

  return (
    <StudyLayout>
      <ContentWrapper>
        <SwitchStudy {...props} />
      </ContentWrapper>
    </StudyLayout>
  );
};

export default Studies;
