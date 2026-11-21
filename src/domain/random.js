export function randomInt(min, max, rand = Math.random) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(rand() * (max - min + 1)) + min;
}
