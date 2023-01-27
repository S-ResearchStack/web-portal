import React, { ChangeEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import useKey from 'react-use/lib/useKey';
import useSearchParam from 'react-use/lib/useSearchParam';

import { px } from 'src/styles';
import ScreenCenteredCard from 'src/modules/auth/common/ScreenCenteredCard';
import PasswordInputField from 'src/common/components/PasswordInputField';
import Button from 'src/common/components/Button';

import {
  PasswordRequirements,
  RequirementItem,
  useCheckPassword,
} from '../common/PasswordRequirements';
import { useResetPassword } from './resetPassword.slice';
import ScreenHeader from '../common/ScreenHeader';
import ScreenWrapper from '../common/ScreenWrapper';
import ScreenContentWrapper from '../common/ScreenContentWrapper';

const Content = styled.div`
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled(ScreenHeader)`
  margin: ${px(0)} auto ${px(36)};
`;

const InputsWrapper = styled.div`
  margin-top: ${px(3)};
  margin-bottom: ${px(10)};
  display: flex;
  align-items: stretch;
  flex-direction: column;
  row-gap: ${px(17)};
`;

const ResetPassword = () => {
  const email = useSearchParam('email') || 'only-for-dev'; // TODO: replace 'only-for-dev' to '' (empty string)
  const resetToken = useSearchParam('resetToken') || 'only-for-dev'; // TODO: replace 'only-for-dev' to '' (empty string)

  const [password, setPassword] = useState('');

  // TODO: handle error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isLoading, error, resetPassword } = useResetPassword();

  const name = 'name'; // TODO: receive from a endpoint
  const similarPrevious: undefined | boolean = !password ? undefined : !password.includes('pass'); // TODO: receive from a endpoint

  // TODO: maybe add validation for a similar password?
  const [isPasswordPassed, requirements] = useCheckPassword({ password, name });

  const isDisabled = !email || !resetToken || !password || !isPasswordPassed;

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
    []
  );

  const handleClick = useCallback(() => {
    resetPassword({ email, password, resetToken });
  }, [resetPassword, email, password, resetToken]);

  useKey('Enter', handleClick);

  return (
    <ScreenWrapper mediaMaxHeightToScrollY={704} mediaMaxWidthToScrollX={732}>
      <ScreenCenteredCard minWidth={800} width={55.556} ratio={557 / 800}>
        <ScreenContentWrapper>
          <Content>
            <Header>Reset Password</Header>
            <InputsWrapper>
              <PasswordInputField
                name="password"
                error={password && !isPasswordPassed}
                withoutErrorText
                label="New password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter password"
              />
            </InputsWrapper>
            <PasswordRequirements>
              {requirements.map((requirement) => (
                <RequirementItem
                  key={requirement.rule}
                  rule={requirement.rule}
                  passed={!password ? undefined : requirement.passed}
                  disabled={!password}
                />
              ))}
              <RequirementItem
                rule="Must be different from previous used passwords"
                passed={similarPrevious}
                disabled={!password}
              />
            </PasswordRequirements>
            <Button disabled={isDisabled} onClick={handleClick} fill="solid" $loading={isLoading}>
              Reset password
            </Button>
          </Content>
        </ScreenContentWrapper>
      </ScreenCenteredCard>
    </ScreenWrapper>
  );
};

export default ResetPassword;
