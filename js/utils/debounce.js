export function debounce(fn, delay) {
    let timer;
    return function inner() {
        clearTimeout(timer);
        timer = setTimeout(fn, delay);
    };
}
//# sourceMappingURL=debounce.js.map