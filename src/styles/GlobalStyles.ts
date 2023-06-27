import { createGlobalStyle } from 'styled-components';
import { px } from 'src/styles/utils';

export const previewDropdownMenuClassName = 'preview-dropdown-menu';
export const PREVIEW_SCALE = 0.75;

export default createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html, body {
    height: 100%;
    width: 100%;
    margin: 0;
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    background: ${({ theme }) => theme.colors.background};
    user-select: none;
    -webkit-user-drag: none;
    font-family: Inter, sans-serif;
  }
  
  input,
  input:focus {
    ::-webkit-textfield-decoration-container {
      visibility: hidden;
    }
  }

  #root {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  *:focus,
  *:focus-visible {
    outline: none;
  }
  
  .recharts-surface {
    overflow: visible;
  }

  .${previewDropdownMenuClassName} {
    border: none;
    filter: drop-shadow(
      0 
      ${px(5 * PREVIEW_SCALE)} 
      ${px(12 * PREVIEW_SCALE)} 
      rgba(0, 0, 0, 0.12)
    ); // TODO unknown color
    margin-top: ${px(8 * PREVIEW_SCALE)};
  }
`;
