import React, { FC, useMemo, useState } from 'react';

import styled from 'styled-components';

import { px, typography } from 'src/styles';

const LimitsCounterContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding-right: ${px(60)};
  }
`;

const LimitsCounterValues = styled.div<{ $error: boolean }>`
  position: absolute;
  right: ${px(16)};
  ${typography.labelRegular};
  color: ${({ $error, theme }) =>
    $error ? theme.colors.statusErrorText : theme.colors.textSecondaryGray};
`;

export interface LimitsCounterProps extends React.PropsWithChildren {
  current: number;
  max: number;
  error?: boolean;
}

export const CountContext = React.createContext<{
  setCount?: (count: number) => void;
}>({});

const LimitsCounter: FC<LimitsCounterProps> = ({ max, current, error, children }) => {
  const [count, setCount] = useState<number>(current || 0);
  const value = useMemo(() => ({ setCount }), [setCount]);
  return (
    <CountContext.Provider value={value}>
      <LimitsCounterContainer>
        {children}
        <LimitsCounterValues $error={!!error}>{`${count}/${max}`}</LimitsCounterValues>
      </LimitsCounterContainer>
    </CountContext.Provider>
  );
};

export default LimitsCounter;
