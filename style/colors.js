// use hsl

export default {
  'Dodger Blue': [210, 100, 56],
  'Forest Green': [120, 61, 34],
  Sienna: [19, 56, 40],
  'Blue Violet': [271, 76, 53],
};

export const toPrimary = (array) => `hsl(${array[0]}, ${array[1]}%, ${array[2]}%)`;
export const toSecondary = (array) => `hsl(${(array[0] + 30) % 360}, ${array[1]}%, ${Math.max(0, array[2] - 10)}%)`;
export const toTertiary = (array) => `hsl(${(array[0] + 330) % 360}, ${array[1]}%, ${Math.max(0, array[2] - 10)}%)`;
