import API from "src/modules/api"
import {AppThunk} from "src/modules/store";
import applyDefaultApiErrorHandlers from "src/modules/api/applyDefaultApiErrorHandlers";
import {showSnackbar} from "src/modules/snackbar/snackbar.slice";
import {FAILED_TO_GET_DOWNLOAD_URL} from "src/modules/study-data/StudyData.message";
import {useSelectedStudyId} from "src/modules/studies/studies.slice";

export const getFileDownloadUrl = (studyId: string, filePath: string): AppThunk<Promise<string | undefined>> =>
  async (dispatch) => {
    let url
    try {
      const {data, checkError} = await API.getFileDownloadUrls({studyId, filePaths: [filePath]})
      checkError()
      url = data[0].url
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch)
      dispatch(showSnackbar({text: FAILED_TO_GET_DOWNLOAD_URL}))
    }
    return url
  }

export const getFileDownloadUrls = (studyId: string, filePaths: string[]): AppThunk<Promise<string[]>> =>
  async (dispatch) => {
    // const studyId = useSelectedStudyId()
    // if(!studyId) return []

    let urls: string[] = []
    try {
      const { data, checkError } = await API.getFileDownloadUrls({studyId, filePaths})
      checkError()
      urls = data.map(d => d.url)
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch)
      dispatch(showSnackbar({text: FAILED_TO_GET_DOWNLOAD_URL}))
    }
    return urls
  }

export const getZippedFileDownloadUrls = (studyId: string, subjectNumbers: string[]): AppThunk<Promise<string[]>> =>
  async (dispatch) => {
    let urls: string[] = []
    try {
      const { data, checkError } = await API.getZippedFileDownloadUrls({studyId, subjectNumbers})
      checkError()
      urls = data.map(d => d.url)
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch)
      dispatch(showSnackbar({text: FAILED_TO_GET_DOWNLOAD_URL}))
    }
    return urls
  }

// It is not possible to download multiple presigned urls using the <a> tag
// We can solve this problem by using the <iframe> tag
export const executeDownload = (url: string) => {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  iframe.onload = () => document.body.removeChild(iframe)
  document.body.appendChild(iframe)
}

//TODO: Need update later
export const executeDownloadFiles = (url: string, fileName: string) => {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    })
    .catch(() => { });
}
