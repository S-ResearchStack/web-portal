import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';
import EmailSuccessImg from 'src/assets/illustrations/email_success.svg';
import Link from 'src/common/components/Link';
import Card from 'src/common/components/Card';
import ResultMessage from 'src/modules/auth/common/ResultMessage';
import { SnackbarContainer } from 'src/modules/snackbar';
import { usePasswordRecovery } from 'src/modules/auth/forgot-password/forgotPassword.slice';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useAppDispatch } from 'src/modules/store';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import usePrevious from 'react-use/lib/usePrevious';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const ContentCard = styled(Card)`
  width: 90%;
  max-width: ${px(800)};
  min-height: ${px(546)};
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ResendEmailOffer = styled.div`
  ${typography.bodySmallRegular};
  margin-top: ${px(53)};
  a {
    ${typography.bodySmallSemibold};
    color: ${colors.textPrimaryBlue};
    display: inline-block;
    margin-left: ${px(8)};
  }
`;

const ForgotPasswordCheckMailbox = () => {
  const email = useSearchParam('email') || 'only-for-dev'; // TODO: replace 'only-for-dev' to '' (empty string)
  const dispatch = useAppDispatch();

  const { isLoading, error, recoveryPassword } = usePasswordRecovery();
  const prevIsLoading = usePrevious(isLoading);

  const handleResend = useCallback(
    async (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      await recoveryPassword({ email });
    },
    [email, recoveryPassword]
  );

  // show toast when mail is resent
  useEffect(() => {
    if (!isLoading && prevIsLoading && !error) {
      dispatch(showSnackbar({ text: 'Email resent.' }));
    }
  }, [dispatch, isLoading, prevIsLoading, error]);

  return (
    <>
      <Container>
        <ContentCard>
          <ResultMessage
            picture={<EmailSuccessImg />}
            title="Check Mailbox"
            compactTitleMargin
            description={
              <>
                We&apos;ve emailed a link to reset your password to
                <br />
                <strong>{email}</strong>
              </>
            }
          >
            <ResendEmailOffer>
              Didn&apos;t get the email?
              <Link to="/" onClick={handleResend}>
                Resend the email
              </Link>
            </ResendEmailOffer>
          </ResultMessage>
        </ContentCard>
      </Container>
      <SnackbarContainer useSimpleGrid />
    </>
  );
};

export default ForgotPasswordCheckMailbox;
