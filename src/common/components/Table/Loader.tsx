import styled from 'styled-components';

import LineLoader from 'src/common/components/LineLoader';

const Loader = styled(LineLoader)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
`;

export default Loader;
