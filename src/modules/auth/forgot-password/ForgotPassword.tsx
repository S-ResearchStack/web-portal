import React, { ChangeEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import useKey from 'react-use/lib/useKey';
import { push } from 'connected-react-router';

import { colors, px, typography } from 'src/styles';
import ScreenCenteredCard from 'src/modules/auth/common/ScreenCenteredCard';
import InputField from 'src/common/components/InputField';
import Button from 'src/common/components/Button';
import Link from 'src/common/components/Link';
import { Path } from 'src/modules/navigation/store';
import { usePasswordRecovery } from 'src/modules/auth/forgot-password/forgotPassword.slice';
import ScreenHeader from 'src/modules/auth/common/ScreenHeader';
import ScreenWrapper from 'src/modules/auth/common/ScreenWrapper';
import ScreenContentWrapper from 'src/modules/auth/common/ScreenContentWrapper';
import { useAppDispatch } from 'src/modules/store';
import { SnackbarContainer } from 'src/modules/snackbar';

const Header = styled(ScreenHeader)`
  margin: ${px(16)} auto ${px(8)};
`;

const Content = styled.div`
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
  padding-bottom: ${px(16)};
`;

const Caption = styled.div`
  ${typography.bodyMediumRegular};
  margin: 0 auto ${px(42)};
  text-align: center;
`;

const Actions = styled.div`
  margin-top: ${px(21)};
`;

const CreateAccountLink = styled(Link)`
  ${typography.bodySmallSemibold};
  color: ${colors.textPrimaryBlue};
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();

  const { isLoading, sendPasswordRecoveryRequest, error, clearError } = usePasswordRecovery();

  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value);
      if (error) {
        clearError();
      }
    },
    [clearError, error]
  );

  const handleClick = useCallback(async () => {
    const isOk = await sendPasswordRecoveryRequest({ email });
    if (isOk) {
      dispatch(push(`${Path.ForgotPasswordConfirm}?email=${encodeURIComponent(email)}`));
    }
  }, [dispatch, sendPasswordRecoveryRequest, email]);

  useKey('Enter', handleClick, undefined, [handleClick]);

  return (
    <>
      <ScreenWrapper
        data-testid="forgot-password"
        mediaMaxHeightToScrollY={704}
        mediaMaxWidthToScrollX={732}
      >
        <ScreenCenteredCard minWidth={800} width={55.556} ratio={477 / 800}>
          <ScreenContentWrapper>
            <Content>
              <Header>Forgot Password</Header>
              <Caption>
                Enter the email address associated with your account and we&apos;ll email
                instructions to reset your password.
              </Caption>
              <InputField
                data-testid="forgot-password-screen-email-field"
                name="email"
                type="email"
                label="Email"
                error={
                  error?.isNotFound ? (
                    <div data-testid="forgot-password-not-found-error">
                      There&apos;s no account with this email. Try again or{' '}
                      <CreateAccountLink to={Path.AccountCreate}>Create account</CreateAccountLink>
                    </div>
                  ) : null
                }
                value={email}
                onChange={handleEmailChange}
                readOnly={isLoading}
                placeholder="Enter email"
                maxLength={256}
              />
              <Actions>
                <Button
                  disabled={!email || !!error}
                  onClick={handleClick}
                  fill="solid"
                  $loading={isLoading}
                  data-testid="forgot-password-request-button"
                >
                  Request instructions
                </Button>
              </Actions>
            </Content>
          </ScreenContentWrapper>
        </ScreenCenteredCard>
      </ScreenWrapper>
      <SnackbarContainer useSimpleGrid />
    </>
  );
};

export default ForgotPassword;
