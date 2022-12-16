import Random from 'src/common/Random';

const SEED = 1;

let r: Random;
let rs: Random;
let mathRandomSpy: jest.SpyInstance<number, []>;

beforeEach(() => {
  mathRandomSpy = jest.spyOn(Math, 'random').mockImplementation().mockReturnValue(SEED);

  r = new Random();
  rs = new Random(SEED);
});

afterEach(() => {
  mathRandomSpy.mockRestore();
});

describe('Random without seed', () => {
  it('Should generate integer', () => {
    expect(r.int()).toEqual(0);
    expect(r.int(1, 10)).toEqual(8);
  });

  it('[NEGATIVE] Should generate integer with broken parameters', () => {
    expect(r.int(false as unknown as number, true as unknown as number)).toEqual(0);
  });

  it('Should generate float', () => {
    expect(r.num()).toEqual(0.45954178320243955);
    expect(r.num(0, 1)).toEqual(0.7448947750963271);
  });

  it('[NEGATIVE] Should generate float with broken parameters', () => {
    expect(r.num(false as unknown as number, true as unknown as number)).toEqual(
      0.45954178320243955
    );
  });

  it('Should generate Gauss integer', () => {
    expect(
      r.gaussInt({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(4);

    expect(
      r.gaussInt({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(3);
  });

  it('[NEGATIVE] Should generate Gauss integer with empty parameters', () => {
    expect(
      r.gaussInt({
        min: null as unknown as number,
        max: null as unknown as number,
        mean: null as unknown as number,
        standardDeviation: null as unknown as number,
      })
    ).toEqual(0);
  });

  it('Should generate Gauss float', () => {
    expect(
      r.gaussNum({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(3.90876834849702);

    expect(
      r.gaussNum({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(2.906543339599547);
  });

  it('[NEGATIVE] Should generate Gauss float with empty parameters', () => {
    expect(
      r.gaussNum({
        min: null as unknown as number,
        max: null as unknown as number,
        mean: null as unknown as number,
        standardDeviation: null as unknown as number,
      })
    ).toEqual(0);
  });

  it('Should select random array element', () => {
    const list = [0, 1, 2, 3, 4];
    expect(r.arrayElement(list)).toEqual(2);
    expect(r.arrayElement(list)).toEqual(3);
  });

  it('[NEGATIVE] Should select random array element from empty array', () => {
    const list = [] as number[];
    expect(r.arrayElement(list)).toEqual(undefined);
  });
});

describe('Random with seed', () => {
  it('Should generate integer', () => {
    expect(rs.int()).toEqual(1);
    expect(rs.int(1, 10)).toEqual(1);
  });

  it('[NEGATIVE] Should generate integer with broken parameters', () => {
    expect(rs.int(false as unknown as number, true as unknown as number)).toEqual(1);
  });

  it('Should generate float', () => {
    expect(rs.num()).toEqual(0.6270739405881613);
    expect(rs.num(0, 1)).toEqual(0.002735721180215478);
  });

  it('[NEGATIVE] Should generate float with broken parameters', () => {
    expect(rs.num(false as unknown as number, true as unknown as number)).toEqual(
      0.6270739405881613
    );
  });

  it('Should generate Gauss integer', () => {
    expect(
      rs.gaussInt({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(5);

    expect(
      rs.gaussInt({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(8);
  });

  it('[NEGATIVE] Should generate Gauss integer with empty parameters', () => {
    expect(
      rs.gaussInt({
        min: null as unknown as number,
        max: null as unknown as number,
        mean: null as unknown as number,
        standardDeviation: null as unknown as number,
      })
    ).toEqual(0);
  });

  it('Should generate Gauss float', () => {
    expect(
      rs.gaussNum({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(5.087669194090902);

    expect(
      rs.gaussInt({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(8);
  });

  it('[NEGATIVE] Should generate Gauss float with empty parameters', () => {
    expect(
      rs.gaussNum({
        min: null as unknown as number,
        max: null as unknown as number,
        mean: null as unknown as number,
        standardDeviation: null as unknown as number,
      })
    ).toEqual(0);
  });

  it('Should select random array element', () => {
    const list = [0, 1, 2, 3, 4];
    expect(rs.arrayElement(list)).toEqual(3);
    expect(rs.arrayElement(list)).toEqual(0);
  });

  it('[NEGATIVE] Should select random array element from empty array', () => {
    const list = [] as number[];
    expect(rs.arrayElement(list)).toEqual(undefined);
  });
});
