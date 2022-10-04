export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_WIDTH_SMALL_SCREEN = 192;
export const SIDEBAR_MINIMIZED_WIDTH = 88;

const sidebarWidth = (screenWidth: number): number => {
  let width = SIDEBAR_WIDTH;
  if (screenWidth < 1440 && screenWidth >= 1024) {
    width = SIDEBAR_WIDTH_SMALL_SCREEN;
  } else if (screenWidth < 1024) {
    width = SIDEBAR_MINIMIZED_WIDTH;
  }
  return width;
};

export const isSidebarMinimized = (screenWidth: number, isUserResize: boolean) =>
  screenWidth < 1024 || (screenWidth >= 1024 && isUserResize);

export const getSidebarWidth = (screenWidth: number, isUserResize: boolean) =>
  isSidebarMinimized(screenWidth, isUserResize)
    ? SIDEBAR_MINIMIZED_WIDTH
    : sidebarWidth(screenWidth);
