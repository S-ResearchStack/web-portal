import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { push } from 'connected-react-router';
import useKey from 'react-use/lib/useKey';
import usePrevious from 'react-use/lib/usePrevious';

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

  const { isLoading, error, recoveryPassword } = usePasswordRecovery();
  const prevIsLoading = usePrevious(isLoading);

  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value),
    []
  );

  const handleClick = useCallback(() => {
    recoveryPassword({ email });
  }, [email, recoveryPassword]);

  // redirect to the next step when mail is sent
  useEffect(() => {
    if (!isLoading && prevIsLoading && !error) {
      dispatch(push(`${Path.ForgotPasswordConfirm}?email=${email}`));
    }
  }, [dispatch, isLoading, prevIsLoading, error, email]);

  useKey('Enter', handleClick);

  return (
    <ScreenWrapper mediaMaxHeightToScrollY={704} mediaMaxWidthToScrollX={732}>
      <ScreenCenteredCard minWidth={800} width={55.556} ratio={477 / 800}>
        <ScreenContentWrapper>
          <Content>
            <Header>Forgot Password</Header>
            <Caption>
              Enter the email address associated with your account and we&apos;ll email instructions
              to reset your password.
            </Caption>
            <InputField
              name="email"
              type="email"
              label="Email"
              error={
                error ? ( // TODO: make real error
                  <>
                    There&apos;s no account with this email. Try again or{' '}
                    <CreateAccountLink to={Path.AccountCreate}>Create account</CreateAccountLink>
                  </>
                ) : null
              }
              value={email}
              onChange={handleEmailChange}
              readOnly={isLoading}
            />
            <Actions>
              <Button disabled={!email} onClick={handleClick} fill="solid" $loading={isLoading}>
                Request instructions
              </Button>
            </Actions>
          </Content>
        </ScreenContentWrapper>
      </ScreenCenteredCard>
    </ScreenWrapper>
  );
};

export default ForgotPassword;
