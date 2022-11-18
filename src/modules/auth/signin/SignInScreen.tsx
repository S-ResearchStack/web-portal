import React, { ChangeEvent, useEffect, useState } from 'react';

import styled from 'styled-components';

import { signin } from 'src/modules/auth/auth.slice';
import { useAppDispatch } from 'src/modules/store';
import Button from 'src/common/components/Button';
import Checkbox from 'src/common/components/CheckBox';
import InputField from 'src/common/components/InputField';
import PasswordInputField from 'src/common/components/PasswordInputField';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { colors, px, typography } from 'src/styles';
import ScreenCenteredCard from './ScreenCenteredCard';
import { useEnterPress } from './hooks';

const MainWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  @media (max-height: ${px(511)}) {
    overflow-y: scroll;
  }
  @media (max-width: ${px(682)}) {
    overflow-x: scroll;
  }
`;

const Content = styled.div`
  height: ${px(448)};
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Header = styled.div`
  ${typography.headingLargeSemibold};
  margin: 0 auto ${px(42)};
`;

const ControlsWrapper = styled.div`
  display: inline-flex;
  justify-content: space-between;
  align-items: flex-start;
  height: ${px(63)};
  color: ${colors.primary};
`;

const StyledButton = styled(Button)`
  height: ${px(34)};

  &:disabled > div {
    color: ${colors.textDisabled};
  }
`;

const ErrorText = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.statusErrorText};
  height: ${px(40)};
  width: 100%;
  text-align: center;
  padding-top: ${px(20)};
`;

const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [rememberUser, setRememberUser] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (error) {
      setError(false);
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (error) {
      setError(false);
    }
  };

  const handleClick = async () => {
    if (!isLoading && !disabled) {
      setIsLoading(true);
      setError(false);

      try {
        await dispatch(
          signin({
            email,
            password,
            rememberUser,
          })
        );
      } catch (e) {
        applyDefaultApiErrorHandlers(e, dispatch);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEnterPress(handleClick);

  const handleCheckBoxChange = () => setRememberUser(!rememberUser);

  useEffect(() => {
    if (password && email && !error) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [password, email, error]);

  return (
    <MainWrapper>
      <ScreenCenteredCard
        width={55.556}
        minWidth={683}
        ratio={0.75}
        onMainButtonClick={handleClick}
      >
        <Content>
          <Header>Sign in</Header>
          <InputField
            type="email"
            label="Email"
            value={email}
            onChange={handleEmailChange}
            error={error}
            readOnly={isLoading}
          />
          <PasswordInputField
            error={error}
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="new-password"
            readOnly={isLoading}
          />
          <ControlsWrapper>
            <Checkbox checked={rememberUser} onChange={handleCheckBoxChange}>
              <div>Remember me</div>
            </Checkbox>
            <StyledButton fill="text" width={120} rate="small" disabled>
              Forgot Password?
            </StyledButton>
          </ControlsWrapper>
          <Button disabled={disabled} onClick={handleClick} fill="solid" $loading={isLoading}>
            Sign In
          </Button>
          <ErrorText>{error && 'Incorrect email or password, please try again.'}</ErrorText>
        </Content>
      </ScreenCenteredCard>
    </MainWrapper>
  );
};

export default SignInScreen;
