export const scrollToRef = (
  ref: React.RefObject<HTMLElement>,
  options?: ScrollIntoViewOptions
) => {
  if (ref.current) {
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    });
  }
};