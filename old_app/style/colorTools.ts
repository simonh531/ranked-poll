export function toHex(number:number) {
  const hex = number.toString(16);
  if (hex.length === 1) {
    return `0${hex}`;
  }
  return hex;
}

export function toColor(r:number, g:number, b:number, mult:number) {
  return `#${
    toHex(Math.trunc(r * mult * 256) - 1)}${
    toHex(Math.trunc(g * mult * 256) - 1)}${
    toHex(Math.trunc(b * mult * 256) - 1)}`;
}
