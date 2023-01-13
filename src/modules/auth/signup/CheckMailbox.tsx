import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';
import EmailSuccessImg from 'src/assets/illustrations/email_success.svg';
import Link from 'src/common/components/Link';
import Card from 'src/common/components/Card';
import ResultMessage from 'src/modules/auth/signup/ResultMessage';
import { SnackbarContainer } from 'src/modules/snackbar';
import { useAppDispatch } from 'src/modules/store';
import { resendVerificationEmail } from 'src/modules/auth/auth.slice';

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

const CheckMailbox = () => {
  const email = useMemo(() => new URLSearchParams(window.location.search).get('email') || '', []);
  const dispatch = useAppDispatch();

  const handleResend = useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      dispatch(resendVerificationEmail({ email }));
    },
    [dispatch, email]
  );

  return (
    <>
      <Container>
        <ContentCard>
          <ResultMessage
            picture={<EmailSuccessImg />}
            title="Check your mailbox"
            description={
              <>
                We’ve emailed an account activation link to
                <br />
                <strong>{email}</strong>
              </>
            }
          >
            <ResendEmailOffer>
              Didn’t get the email?
              <Link data-testid="signup-check-mailbox-resend" to="/" onClick={handleResend}>
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

export default CheckMailbox;
