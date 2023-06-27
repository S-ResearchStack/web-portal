import React, { useCallback, useEffect, useState } from 'react';
import CreateStudyCard from 'src/modules/studies/CreateStudyCard';
import SelectRoleCard from 'src/modules/studies/SelectRoleCard';
import styled from 'styled-components';

import { SpecColorType } from 'src/styles/theme';
import { px } from 'src/styles';
import StudyLayout from 'src/modules/studies/StudyLayout';

const MainWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  @media (max-height: ${px(475)}) {
    overflow-y: scroll;
  }
  @media (max-width: ${px(665)}) {
    overflow-x: scroll;
  }
`;

const CreateStudyScreen: React.FC = () => {
  const [card, setCard] = useState<'createStudy' | 'selectRole'>('createStudy');
  const [name, setName] = useState<string>('');
  const [color, setColor] = useState<SpecColorType | undefined>(undefined);

  const handleSetStudyParams = useCallback((studyName: string, avatarColor: SpecColorType) => {
    setName(studyName);
    setColor(avatarColor);
  }, []);

  useEffect(() => {
    if (name && color && card === 'createStudy') {
      setCard('selectRole');
    }
  }, [name, color, card]);

  return (
    <StudyLayout>
      <MainWrapper data-testid="create-study">
        {card === 'createStudy' && <CreateStudyCard onClick={handleSetStudyParams} />}
        {card === 'selectRole' && <SelectRoleCard color={color || 'primary'} name={name} />}
      </MainWrapper>
    </StudyLayout>
  );
};

export default CreateStudyScreen;
