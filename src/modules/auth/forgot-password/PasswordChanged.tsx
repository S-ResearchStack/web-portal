import React, { useCallback } from 'react';
import styled from 'styled-components';
import { px } from 'src/styles';
import useSearchParam from 'react-use/lib/useSearchParam';

import SuccessImg from 'src/assets/illustrations/success.svg';
import Card from 'src/common/components/Card';
import ResultMessage from 'src/modules/auth/common/ResultMessage';
import Button from 'src/common/components/Button';
import { redirectToStudyScreenByRole } from 'src/modules/auth/auth.slice';
import { useAppDispatch } from 'src/modules/store';

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

const NextStep = styled.div`
  margin-top: ${px(32)};

  > button {
    width: ${px(448)};
  }
`;

const PasswordChanged = () => {
  const dispatch = useAppDispatch();
  const email = useSearchParam('email') || '';

  const handleNext = useCallback(() => {
    dispatch(redirectToStudyScreenByRole());
  }, [dispatch]);

  return (
    <Container data-testid="password-changed">
      <ContentCard>
        <ResultMessage
          picture={<SuccessImg />}
          title="Password Changed!"
          compactTitleMargin
          description={
            <>
              Congratulations! You have successfully changed the password for
              <br />
              <strong>{email}</strong>. Continue to the web portal to access and
              <br />
              create studies.
            </>
          }
        >
          <NextStep>
            <Button fill="solid" onClick={handleNext} data-testid="password-changed-next-button">
              Continue to Portal
            </Button>
          </NextStep>
        </ResultMessage>
      </ContentCard>
    </Container>
  );
};

export default PasswordChanged;
