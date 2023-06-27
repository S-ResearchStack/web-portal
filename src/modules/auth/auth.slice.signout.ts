import { STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY } from 'src/modules/overview/studyProgress.slice';
import {
  STORAGE_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
  STORAGE_USER_NAME_KEY,
} from 'src/modules/auth/utils';

export const signout = () => {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  localStorage.removeItem(STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY);
  localStorage.removeItem(STORAGE_USER_NAME_KEY);

  window.location.reload();
};
