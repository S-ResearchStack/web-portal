import React, { ChangeEvent, useEffect, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';

import styled from 'styled-components';

import LockIcon from 'src/assets/icons/lock.svg';
import Button from 'src/common/components/Button';
import InputField from 'src/common/components/InputField';
import PasswordInputField from 'src/common/components/PasswordInputField';
import { SnackbarContainer } from 'src/modules/snackbar';
import { useAppDispatch } from 'src/modules/store';
import { px, typography } from 'src/styles';
import { activateAccount } from '../auth.slice';
import { useEnterPress } from './hooks';
import ScreenCenteredCard from '../common/ScreenCenteredCard';
import { RequirementItem, useCheckPassword } from '../common/PasswordRequirements';

const MainWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  @media (max-height: ${px(704)}) {
    overflow-y: scroll;
  }
  @media (max-width: ${px(732)}) {
    overflow-x: scroll;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

const Content = styled.div`
  height: ${px(641)};
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Header = styled.div`
  ${typography.headingLargeSemibold};
  margin: 0 auto ${px(36)};
`;

const RequirementsWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: ${px(182)};
  width: ${px(447)};
  top: ${px(8)};
  margin-bottom: ${px(24)};
`;

const AccountActivationScreen: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [isLoading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const email = useSearchParam('email') || '';
  const resetToken = useSearchParam('reset-token') || '';

  // TODO: maybe later backend will provide user name
  const [isPasswordPassed, requirements] = useCheckPassword({
    password,
    name: email.split('@')[0] || '',
  });

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleClick = async () => {
    if (disabled) {
      return;
    }
    try {
      setLoading(true);
      await dispatch(
        activateAccount({
          name,
          password,
          resetToken,
        })
      );
    } catch (err) {
      // handled by store
    } finally {
      setLoading(false);
    }
  };

  useEnterPress(handleClick);

  useEffect(() => {
    setDisabled(!password || !isPasswordPassed || !name);
  }, [password, isPasswordPassed, name]);

  return (
    <MainWrapper>
      <ScreenCenteredCard minWidth={733} width={55.556} ratio={0.96125}>
        <ContentWrapper>
          <Content>
            <Header>Account activation</Header>
            <InputField
              type="email"
              label="Email"
              value={email}
              disabled
              endExtra={{ component: <LockIcon />, extraWidth: 24 }}
              placeholder="Enter email"
            />
            <InputField
              type="text"
              label="Name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter name"
              maxLength={30}
            />
            <PasswordInputField
              error={password && !isPasswordPassed}
              label="Password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter password"
              maxLength={256}
            />
            <RequirementsWrapper>
              {requirements.map((requirement) => (
                <RequirementItem
                  key={requirement.rule}
                  rule={requirement.rule}
                  passed={!password ? undefined : requirement.passed}
                  disabled={!password}
                />
              ))}
            </RequirementsWrapper>
            <Button disabled={disabled} onClick={handleClick} fill="solid" $loading={isLoading}>
              Activate Account
            </Button>
          </Content>
          <SnackbarContainer />
        </ContentWrapper>
      </ScreenCenteredCard>
    </MainWrapper>
  );
};

export default AccountActivationScreen;
