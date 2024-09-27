import React, {useState} from "react";
import {
  loadNextHistory,
  loadPrevHistory,
  useHasNextHistory,
  useHasPrevHistory,
  useStageState,
} from "src/modules/study-data/studyData.slice";
import styled from "styled-components";
import {useAppDispatch} from "src/modules/store";
import {Grid, styled as styledMui} from "@mui/material";
import {StudyDataText} from "src/modules/study-data/StudyData.style";
import Button from "@mui/material/Button";
import {colors, typography} from "src/styles";
import PathIcon from "@mui/icons-material/Folder"
import StudyDataTitle from "src/common/components/StudyDataTitle";
import {ArrowBack, ArrowForward} from "@mui/icons-material";
import StudyDataFile from "src/modules/study-data/viewer/StudyDataFile";
import StudyDataFolder from "src/modules/study-data/viewer/StudyDataFolder";

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 8px;
  margin-bottom: 8px;
`

const PathContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 72px);
  height: 32px;
  padding-left: 14px;
  padding-right: 14px;
  border: solid 1px ${colors.black08};
  border-radius: 4px;
  white-space: pre-wrap;
  flex-shrink: 0;
`

const NavigationButton = styledMui(Button)({
  padding: 0,
  margin: 0,
  marginRight: 4,
  minWidth: 32,
  minHeight: 32,
  backgroundColor: "#fff",
  border: "solid 1px rgba(0, 0, 0, 0.1)",
  borderRadius: 4,
  ":hover": {
    backgroundColor: "rgba(0, 0, 0, 0.1)"
  },
  "&.Mui-disabled": {
    borderColor: "#fff"
  }
})

const TopLeftContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const TopText = styled(StudyDataText)<{disabled?: boolean}>`
  ${typography.bodySmallRegular};
  align-self: center;
  margin-left: 8px;
  color: ${p => p.disabled ? "grey" : undefined}
`

interface PathTopProps {
  path: string[]
}
const Path = ({ path }: PathTopProps) =>
  <PathContainer>
    <TopLeftContainer>
      <PathIcon width={24} height={24} style={{flexShrink: 0, color: "lightskyblue"}}/>
      <TopText>{path.slice(0, path.length).join("   ▸   ")}</TopText>
    </TopLeftContainer>
  </PathContainer>

interface StudyDataViewerProps {
  studyId?: string
}

const StudyDataViewer = ({ studyId }: StudyDataViewerProps) => {
  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const stageState = useStageState()
  const hasNextHistory = useHasNextHistory()
  const hasPrevHistory = useHasPrevHistory()

  const handleForward = async () => {
    if(!isLoading) {
      setIsLoading(true)
      await dispatch(loadNextHistory())
      setIsLoading(false)
    }
  }

  const handleBackward = async () => {
    if(!isLoading) {
      setIsLoading(true)
      await dispatch(loadPrevHistory())
      setIsLoading(false)
    }
  }

  const gridHeight = "calc(100vh - 312px)"

  return (
    <Grid
      data-testid='grid-study-data'
      container
      alignContent="flex-start"
      columnSpacing={2}
      paddingLeft={1}
      paddingRight={1}
    >
      <Grid item xs={12}>
        <StudyDataTitle title="Directory" />
      </Grid>
      <Grid item xs={12}>
        <TopContainer>
          <NavigationButton
            data-testid='back-button'
            disabled={isLoading || !hasPrevHistory}
            variant="contained"
            disableElevation
            onClick={handleBackward}
          >
            <ArrowBack sx={{ color: hasPrevHistory ? "rgba(0, 0, 0, 0.3)" : "#fff"}}/>
          </NavigationButton>
          <NavigationButton
            data-testid='forward-button'
            disabled={isLoading || !hasNextHistory}
            variant="contained"
            disableElevation
            onClick={handleForward}
          >
            <ArrowForward sx={{ color: hasNextHistory ? "rgba(0, 0, 0, 0.3)" : "#fff"}}/>
          </NavigationButton>
          <Path path={stageState.path}/>
        </TopContainer>
      </Grid>
      <Grid item xs={3} height={gridHeight}>
        <StudyDataFolder isLoadingParent={isLoading} studyId={studyId}/>
      </Grid>
      <Grid item xs={9} height={gridHeight}>
        <StudyDataFile isLoadingParent={isLoading} studyId={studyId}/>
      </Grid>
    </Grid>
  )
}

export default StudyDataViewer
