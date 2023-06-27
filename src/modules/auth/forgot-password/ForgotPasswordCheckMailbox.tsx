import React, { useCallback } from 'react';
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

const TestIdContainer = styled.div`
  height: 100%;
`;

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
  const email = useSearchParam('email') || '';
  const dispatch = useAppDispatch();

  const { sendPasswordRecoveryRequest } = usePasswordRecovery();

  const handleResend = useCallback(
    async (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      const isOk = await sendPasswordRecoveryRequest({ email });
      if (isOk) {
        dispatch(showSnackbar({ text: 'Email resent.' }));
      }
    },
    [dispatch, email, sendPasswordRecoveryRequest]
  );

  return (
    <TestIdContainer data-testid="forgot-password-check-mailbox">
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
              <Link
                to="/"
                onClick={handleResend}
                data-testid="forgot-password-check-mailbox-resend"
              >
                Resend the email
              </Link>
            </ResendEmailOffer>
          </ResultMessage>
        </ContentCard>
      </Container>
      <SnackbarContainer useSimpleGrid />
    </TestIdContainer>
  );
};

export default ForgotPasswordCheckMailbox;
