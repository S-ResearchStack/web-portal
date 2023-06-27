import React, { ChangeEvent, useCallback, useState } from 'react';
import styled from 'styled-components';

import Checkbox from 'src/common/components/CheckBox';
import { RoleType } from 'src/modules/auth/userRole';
import Button from 'src/common/components/Button';
import { useCreateStudy } from 'src/modules/studies/studies.slice';
import StudyLayout from 'src/modules/studies/StudyLayout';
import ScreenCenteredCard from 'src/modules/auth/common/ScreenCenteredCard';
import { SnackbarContainer } from 'src/modules/snackbar';
import { SpecColorType } from 'src/styles/theme';
import { px, typography } from 'src/styles';

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

const Content = styled.div`
  height: ${px(468)};
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Header = styled.div`
  ${typography.headingLargeSemibold};
  margin: 0 auto ${px(16)};
`;

const Subheader = styled.div`
  ${typography.bodySmallRegular};
  margin: 0 ${px(5)};
`;

const RolesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: ${px(240)};
  width: 100%;
  margin: ${px(40)} 0;
`;

const Label = styled.div`
  ${typography.bodySmallSemibold};
`;

const Explanation = styled.div`
  ${typography.bodySmallRegular};
  padding-left: ${px(44)};
  margin-bottom: ${px(5)};
`;

const RolesMap = [
  {
    role: 'principal-investigator',
    label: 'Principal Investigator',
    explanation: 'Full access to all aspects of the study.',
  },
  {
    role: 'research-assistant',
    label: 'Research Assistant',
    explanation: 'Access to most aspects of the study.',
  },
  {
    role: 'data-scientist',
    label: 'Data Scientist',
    explanation: "Access to most aspects of the study without participants' personal information.",
  },
];

const SelectRoleCard = ({ color, name }: { color: SpecColorType; name: string }) => {
  const [role, setRole] = useState<RoleType[]>([]);
  const { isLoading, createStudy } = useCreateStudy();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.checked) {
        setRole([...role, event.currentTarget.value as RoleType]);
      } else {
        setRole(role.filter((r) => r !== event.currentTarget.value));
      }
    },
    [setRole, role]
  );

  const handleClick = async () => {
    if (role.length) {
      createStudy(
        {
          name,
          color,
        },
        role
      );
    }
  };

  return (
    <StudyLayout>
      <MainWrapper data-testid="create-study">
        <ScreenCenteredCard
          width={55.556}
          minWidth={666}
          ratio={0.785}
          onMainButtonClick={handleClick}
        >
          <Content>
            <Header>Select Role</Header>
            <Subheader>
              Select one or more roles based on your responsibilities for this study. You will be
              able to change it later.
            </Subheader>
            <RolesWrapper>
              {RolesMap.map((r) => (
                <div key={r.role}>
                  <Checkbox
                    data-testid={`checkbox-${r.role}`}
                    onChange={handleChange}
                    value={r.role}
                    checked={role.includes(r.role as RoleType)}
                  >
                    <Label>{r.label}</Label>
                  </Checkbox>
                  <Explanation>{r.explanation}</Explanation>
                </div>
              ))}
            </RolesWrapper>
            <Button
              data-testid="create-study-send"
              disabled={!role.length}
              onClick={handleClick}
              $loading={isLoading}
              fill="solid"
            >
              Confirm
            </Button>
          </Content>
        </ScreenCenteredCard>
      </MainWrapper>
      <SnackbarContainer useSimpleGrid />
    </StudyLayout>
  );
};

export default SelectRoleCard;
