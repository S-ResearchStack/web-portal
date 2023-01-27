import styled from 'styled-components';
import { px } from 'src/styles';

interface ScreenWrapperProps {
  mediaMaxHeightToScrollY: number;
  mediaMaxWidthToScrollX: number;
}

const ScreenWrapper = styled.div<ScreenWrapperProps>`
  display: flex;
  height: 100%;
  width: 100%;
  @media (max-height: ${({ mediaMaxHeightToScrollY }) => px(mediaMaxHeightToScrollY)}) {
    overflow-y: scroll;
  }
  @media (max-width: ${({ mediaMaxWidthToScrollX }) => px(mediaMaxWidthToScrollX)}) {
    overflow-x: scroll;
  }
`;

export default ScreenWrapper;
