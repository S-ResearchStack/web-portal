import React, { ChangeEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import useKey from 'react-use/lib/useKey';
import useSearchParam from 'react-use/lib/useSearchParam';

import { px } from 'src/styles';
import ScreenCenteredCard from 'src/modules/auth/common/ScreenCenteredCard';
import PasswordInputField from 'src/common/components/PasswordInputField';
import Button from 'src/common/components/Button';
import { SnackbarContainer } from 'src/modules/snackbar';

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
  const email = useSearchParam('email') || '';
  const resetToken = useSearchParam('reset-token') || '';

  const [password, setPassword] = useState('');

  const { isLoading, resetPassword } = useResetPassword();

  // TODO: maybe later backend will provide user name
  const name = email.split('@')[0] || '';

  const [isPasswordPassed, requirements] = useCheckPassword({ password, name });

  const isDisabled = !email || !resetToken || !password || !isPasswordPassed;

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
    []
  );

  const handleClick = useCallback(() => {
    resetPassword({ email, password, resetToken });
  }, [resetPassword, email, password, resetToken]);

  useKey('Enter', handleClick, undefined, [handleClick]);

  return (
    <>
      <ScreenWrapper
        mediaMaxHeightToScrollY={704}
        mediaMaxWidthToScrollX={732}
        data-testid="reset-password"
      >
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
                  data-testid="reset-rassword-screen-password-field"
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
              </PasswordRequirements>
              <Button
                disabled={isDisabled}
                onClick={handleClick}
                fill="solid"
                $loading={isLoading}
                data-testid="reset-password-button"
              >
                Reset password
              </Button>
            </Content>
          </ScreenContentWrapper>
        </ScreenCenteredCard>
      </ScreenWrapper>
      <SnackbarContainer useSimpleGrid />
    </>
  );
};

export default ResetPassword;
