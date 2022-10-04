const isDev = env.NODE_ENV !== 'production';

export const isDevShowFocus = isDev && localStorage.getItem('dev_show_focus');

export default isDev;
