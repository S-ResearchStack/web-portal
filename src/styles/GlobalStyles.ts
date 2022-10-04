import { createGlobalStyle } from 'styled-components';

import { colors } from 'src/styles/index';

export default createGlobalStyle`
  * {
    box-sizing: border-box;
    font-family: 'Roboto', 'Open Sans', sans-serif;
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
    background: ${colors.background};
    cursor: default;
    user-select: none;
    -webkit-user-drag: none;
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

`;
