/**
 * Delays milliseconds
 */
export function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(res, ms);
  });
}

/**
 * Generates random number around mean between offset
 * is computed formula `Math.random() * (max - min) + min`
 */
export function random_number(mean, offset) {
  return Math.random() * (2 * offset) + (mean - offset);
}
