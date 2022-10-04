export const scrollToTop = (el: HTMLElement, onDone: () => void) => {
  const onScroll = () => {
    if (!el.scrollTop) {
      el.removeEventListener('scroll', onScroll);
      onDone();
    }
  };
  el.addEventListener('scroll', onScroll);
  onScroll();
  el.scrollTo({ top: 0, behavior: 'smooth' });
};
