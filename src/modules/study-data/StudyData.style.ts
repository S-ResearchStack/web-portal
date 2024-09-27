import styled from "styled-components"
import {createTheme, IconButton} from "@mui/material"
import {px} from "src/styles";
import {styled as muiStyled} from "@mui/material/styles";

declare module '@mui/material/styles' {
  interface Palette {
    buttonIdle: Palette['primary']
    buttonSelected: Palette['primary']
  }

  interface PaletteOptions {
    buttonIdle?: PaletteOptions['primary']
    buttonSelected?: PaletteOptions['primary']
  }
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    buttonIdle: true
    buttonSelected: true
  }
}

export const studyDataTheme = createTheme({
  palette: {
    buttonIdle: {
      main: "#FFFFFF00",
      contrastText: "#474747"
    },
    buttonSelected: {
      main: "#4475E31C",
      contrastText: "#474747"
    }
  }
})

export const StudyDataText = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  overflow-wrap: anywhere;
  text-transform: none;
`

export const DownloadIconButton = muiStyled(IconButton)(({ theme }) => ({
  padding: 4,
  opacity: .45,
  '&:hover': {
    opacity: .9
  }
}))
