export function debounce(fn: () => void, delay: number) {
  void fn;
  void delay;

  return function inner() {
    console.log('INNER');
  };
}
