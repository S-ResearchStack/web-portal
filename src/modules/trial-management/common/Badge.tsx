import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';

const Badge = styled.div<{ $isLoading?: boolean }>`
  ${typography.bodyXSmallSemibold};
  color: ${colors.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  min-width: ${px(24)};
  height: ${px(24)};
  border-radius: ${px(12)};
  background-color: ${({ $isLoading, theme }) =>
    $isLoading ? theme.colors.primaryLight : theme.colors.primaryLight};

  &:empty {
    display: none;
  }
`;

export default Badge;
