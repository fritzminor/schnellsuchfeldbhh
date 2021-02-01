/* From https://github.com/tiborv/color-palette-generator/blob/master/lib/colorGen.js */
/*  https://github.com/tiborv/color-palette-generator does not seem to be still maintained */

// !!!!!!!!!!!!!!!ATTENTION: does NOT work !!!!!!!!!!!!!!!!!

import color from "color";

function genMix(length: number, arr: number[]): number[] {
  const arr1 = arr.slice(0, arr.length / 2);

  const arr2 = arr.slice(arr.length / 2);

  return arr1.reduce(
    (arr, v, i) => arr.concat(v, arr2[i]),
    [] as number[]
  );
}

export function colorGen(
  baseColor: string,
  length: number,
  mix: boolean
): string[] {
  const bc = color(baseColor);
  const baseHue = bc.hue();
  const step = 240 / length;
  const arr = Array.from(Array(length), () => Number()); //Array.apply(null, { length }).map(Number.call, Number)
  const steps = mix ? genMix(length, arr) : arr;

  return steps.map((s) =>
    bc.rotate((baseHue + step * s) % 240).hex()
  );
}
