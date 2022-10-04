import styled, { keyframes } from 'styled-components';
import { animation, px } from 'src/styles';

// TODO: should depend on element size
const BACKGROUND_SIZE = 400;

const SkeletonAnimation = keyframes`
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: ${px(BACKGROUND_SIZE)} 0;
  }
`;

const SkeletonLoading = styled.div`
  border-radius: ${px(4)};
  background: linear-gradient(112.52deg, #e6e6e6 0%, rgba(217, 217, 217, 0) 50%, #e6e6e6 100%);
  background-size: ${px(BACKGROUND_SIZE)} ${px(100)};
  animation: ${SkeletonAnimation} 1s infinite ${animation.defaultTiming};
`;

export default SkeletonLoading;
