/* eslint-disable no-bitwise */
type GaussParams = {
  min?: number;
  max?: number;
  mean?: number;
  standardDeviation?: number;
};

class Random {
  #state: number;

  public static shared = new Random();

  constructor(seed?: number) {
    this.#state = seed || Math.random() * 1e5;
  }

  num(min = 0, max = 1) {
    return min + this.getNext() * (max - min);
  }

  int(min = 0, max = 1) {
    return Math.round(this.num(min, max));
  }

  gaussNum(params: GaussParams): number {
    const { min = 0, max = 1, mean = (max + min) / 2, standardDeviation = max - min / 2 } = params;

    let n;
    do {
      n = this.getNextGauss(mean, standardDeviation);
    } while (n < min || n > max);

    return n;
  }

  date(start: Date | number, end: Date | number): Date {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return new Date(this.int(startDate.valueOf(), endDate.valueOf()));
  }

  gaussInt(params: GaussParams) {
    return Math.round(this.gaussNum(params));
  }

  arrayElement<T>(a: T[]) {
    return a[this.int(0, a.length - 1)];
  }

  private getNextGauss(mean: number, sd: number) {
    let x1;
    let x2;
    let w;

    do {
      x1 = this.num(0, 2) - 1;
      x2 = this.num(0, 2) - 1;
      w = x1 * x1 + x2 * x2;
    } while (w >= 1);

    w = Math.sqrt((-2 * Math.log(w)) / w);

    const y1 = x1 * w;

    return y1 * sd + mean;
  }

  private getNext() {
    // Mulberry32 based on https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    this.#state += 0x6d2b79f5;
    let n = this.#state;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  }
}

export default Random;
/* eslint-enable no-bitwise */
