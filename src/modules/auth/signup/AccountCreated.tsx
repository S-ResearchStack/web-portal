import React, { useCallback, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { px } from 'src/styles';
import { replace } from 'connected-react-router';
import useSearchParam from 'react-use/lib/useSearchParam';

import SuccessImg from 'src/assets/illustrations/success.svg';
import Card from 'src/common/components/Card';
import ResultMessage from 'src/modules/auth/common/ResultMessage';
import Button from 'src/common/components/Button';
import { Path } from 'src/modules/navigation/store';
import { redirectToStudyScreenByRole, useVerifyEmail } from 'src/modules/auth/auth.slice';
import { useAppDispatch } from 'src/modules/store';
import { SnackbarContainer } from 'src/modules/snackbar';
import { GENERIC_SERVER_ERROR_TEXT } from 'src/modules/api/executeRequest';

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
  margin-top: ${px(64)};

  > button {
    width: ${px(448)};
  }
`;

const AccountCreated = () => {
  const dispatch = useAppDispatch();

  const email = useSearchParam('email') || '';
  const token = useSearchParam('reset-token') || '';

  const { isLoading, error } = useVerifyEmail(
    {
      fetchArgs: token ? { token } : false,
    },
    {
      text: GENERIC_SERVER_ERROR_TEXT,
      showErrorIcon: true,
    }
  );

  useLayoutEffect(() => {
    if (!token) {
      dispatch(replace(Path.SignIn));
    }
  }, [dispatch, token]);

  const isCtaDisabled = isLoading || !!error;

  const handleNext = useCallback(() => {
    if (isCtaDisabled) {
      return;
    }

    dispatch(redirectToStudyScreenByRole());
  }, [dispatch, isCtaDisabled]);

  return (
    <>
      <Container data-testid="account-created">
        <ContentCard>
          <ResultMessage
            picture={<SuccessImg />}
            title="Account created!"
            description={
              <>
                Congratulations! You have successfully created an account for
                <br />
                <strong>{email}</strong>. Continue to the web portal to access and
                <br />
                create studies.
              </>
            }
          >
            <NextStep>
              <Button
                data-testid="account-created-next"
                disabled={isCtaDisabled}
                fill="solid"
                onClick={handleNext}
              >
                Continue to portal
              </Button>
            </NextStep>
          </ResultMessage>
        </ContentCard>
      </Container>
      <SnackbarContainer useSimpleGrid />
    </>
  );
};

export default AccountCreated;
