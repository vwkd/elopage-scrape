export function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(res, ms);
  });
}

// mean +- random offset, computed formula `Math.random() * (max - min) + min`
export function random_number(mean, offset) {
  return Math.random() * (2 * offset) + (mean - offset);
}
