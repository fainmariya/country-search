export function debounce(fn: () => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return function inner() {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}
