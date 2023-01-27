import styled from 'styled-components';
import { px, typography } from 'src/styles';

const ScreenHeader = styled.div`
  ${typography.headingLargeSemibold};
  margin: ${px(16)} auto ${px(8)};
  text-align: center;
`;

export default ScreenHeader;
