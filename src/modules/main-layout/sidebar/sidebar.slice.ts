import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState, AppThunk } from 'src/modules/store';

const IS_COLLAPSED_STORAGE_KEY = 'sidebar_is_collapsed';

type SidebarState = {
  isCollapsed: boolean;
  isForceCollapsed: boolean;
};

const initialState: SidebarState = {
  isCollapsed: localStorage.getItem(IS_COLLAPSED_STORAGE_KEY) === 'true',
  isForceCollapsed: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setCollapsed(state, action: PayloadAction<boolean>) {
      state.isCollapsed = action.payload;
    },
    setForceCollapsed(state, action: PayloadAction<boolean>) {
      state.isForceCollapsed = action.payload;
    },
  },
});

const { setCollapsed, setForceCollapsed } = sidebarSlice.actions;

export const toggleSidebarCollapsed = (): AppThunk => (dispatch, getStore) => {
  const newState = !getStore().sidebar.isCollapsed;
  localStorage.setItem(IS_COLLAPSED_STORAGE_KEY, JSON.stringify(newState));
  dispatch(setCollapsed(newState));
};

export const setSidebarForceCollapsed = setForceCollapsed;

export const isSidebarCollapsedSelector = (state: RootState) =>
  state.sidebar.isForceCollapsed || state.sidebar.isCollapsed;

export const isSidebarForceCollapsedSelector = (state: RootState) => state.sidebar.isForceCollapsed;

export default sidebarSlice.reducer;
