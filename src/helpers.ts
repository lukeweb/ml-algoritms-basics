/**
 * Function to calculate mean for arrays of numbers
 *
 * @param numbers number[]
 * @returns number
 */
export const mean = (numbers: number[]) =>
  numbers.reduce((sum: number, val: number) => sum + val, 0) / numbers.length;

/**
 * Function to calculate distance between two points
 *
 * @param a number[]
 * @param b number[]
 * @returns number
 */
export const distance = (a: number[], b: number[]) =>
  Math.sqrt(
    a
      .map((aPoint: number, i: number) => b[i] - aPoint)
      .reduce(
        (sumOfSquares: number, diff: number) => sumOfSquares + diff * diff,
        0,
      ),
  );
