import styled from 'styled-components';
import { colors, px, typography } from 'src/styles';

const Banner = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.updPrimary} !important;
  background-color: ${colors.updPrimary10};
  border-radius: ${px(4)};
  padding: ${px(16)} ${px(24)};
  max-width: 100%;

  > div:not(:first-child) {
    margin-top: ${px(4)};
  }
`;

export default Banner;
