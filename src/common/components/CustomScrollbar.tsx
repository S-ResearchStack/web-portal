import styled from 'styled-components';
import { px, theme } from 'src/styles';

export interface CustomScrollbarProps {
  scrollbarTrackColor?: string;
  scrollbarThumbColor?: string;
  scrollbarOffsetRight?: number;
}

const THUMB_WIDTH = 4;
const OFFSET_RIGHT = 0;

const getTrackColor = ({
  scrollbarTrackColor,
  scrollbarThumbColor,
}: CustomScrollbarProps): string =>
  scrollbarTrackColor || scrollbarThumbColor || theme.colors.background;

const getThumbColor = ({ scrollbarThumbColor }: CustomScrollbarProps): string =>
  scrollbarThumbColor || theme.colors.primary;

const getScrollbarWidth = ({ scrollbarOffsetRight }: CustomScrollbarProps): string =>
  px((scrollbarOffsetRight || OFFSET_RIGHT) * 2 + THUMB_WIDTH);

export const withCustomScrollBar = <P,>(component: React.ComponentType<P>) =>
  styled(styled(component)<P & CustomScrollbarProps>`
    // Firefox
    scrollbar-width: thin;
    scrollbar-color: ${getThumbColor} ${getTrackColor};

    &::-webkit-scrollbar {
      width: ${getScrollbarWidth};
      height: ${getScrollbarWidth};
    }

    &::-webkit-scrollbar-track {
      background: ${getTrackColor};
      border-radius: ${px(4)};
      margin: ${px(1)} 0;
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${getThumbColor};
      border-radius: ${px(10)};
      border: ${({ scrollbarOffsetRight }) => px(scrollbarOffsetRight || OFFSET_RIGHT)} solid
        ${getTrackColor};
      width: ${px(THUMB_WIDTH)};
      min-height: ${getScrollbarWidth};
    }
  `);

const CustomScrollbar = withCustomScrollBar(styled.div``)``;

export default CustomScrollbar;
