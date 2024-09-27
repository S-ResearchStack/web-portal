import React, { useMemo } from 'react';
import styled from 'styled-components';
import PasswordValidator from 'password-validator';

import { px, typography } from 'src/styles';
import Radio from 'src/common/components/Radio';

export const PasswordRequirements = styled.div`
  margin-top: ${px(14)};
  margin-bottom: ${px(26)};
`;

const RequirementContainer = styled.div`
  height: ${px(40)};

  * {
    cursor: default;
  }
`;

const RequirementText = styled.span<{ error: boolean }>`
  ${typography.bodyXSmallRegular};
  color: ${({ error, theme }) => (error ? theme.colors.textDisabled : theme.colors.textPrimary)};
`;

type PasswordRequirement = {
  rule: string;
  passed?: boolean;
  validator: PasswordValidator;
};

const getRequirements = (email: string) =>
  [
    {
      rule: 'Be at least 12 characters in length',
      validator: new PasswordValidator().is().min(12),
    },
    {
      rule: 'Contains 1 upper case, 1 lower case, 1 number, and 1 special character',
      validator: new PasswordValidator()
        .has()
        .uppercase()
        .has()
        .lowercase()
        .has()
        .digits()
        .has()
        .symbols(),
    },
    {
      rule: 'Does not contain more than 3 identical characters in a row',
      validator: new PasswordValidator().not(/(.)\1{3,}/g),
    },
    {
      rule: 'Does not contain email',
      validator: new PasswordValidator().not(email),
    },
  ].filter((r) => !!r) as PasswordRequirement[];

const checkPassword = (email: string, password: string): Array<PasswordRequirement> =>
  getRequirements(email).map((r) => ({
    ...r,
    passed: password.length ? (r.validator.validate(password) as boolean) : undefined,
  }));

interface UseCheckPasswordParams {
  email: string;
  password: string;
}

export const useCheckPassword = ({
  email,
  password,
}: UseCheckPasswordParams): [boolean, PasswordRequirement[]] =>
  useMemo(
    () => [
      checkPassword(email, password).every((r) => r.passed === true),
      checkPassword(email, password),
    ],
    [email, password]
  );

interface RequirementProps {
  passed?: boolean;
  rule: string;
  disabled?: boolean;
}

export const RequirementItem = ({ passed, rule, disabled }: RequirementProps) => (
  <RequirementContainer key={`${rule}-wrapper`}>
    <Radio
      data-testid="auth-signup-radio"
      readOnly
      kind={passed !== false ? 'success' : 'error'}
      color={passed ? 'statusSuccess' : 'disabled'}
      checked
      disabled={disabled}
    >
      <RequirementText error={passed !== true}>{rule}</RequirementText>
    </Radio>
  </RequirementContainer>
);
