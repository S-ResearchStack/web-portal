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

  it('Should generate float', () => {
    expect(r.num()).toEqual(0.45954178320243955);
    expect(r.num(0, 1)).toEqual(0.7448947750963271);
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
      r.gaussInt({
        min: 1,
        max: 10,
        mean: 5,
        standardDeviation: 4,
      })
    ).toEqual(3);
  });

  it('Should select random array element', () => {
    const list = [0, 1, 2, 3, 4];
    expect(r.arrayElement(list)).toEqual(2);
    expect(r.arrayElement(list)).toEqual(3);
  });
});

describe('Random with seed', () => {
  it('Should generate integer', () => {
    expect(rs.int()).toEqual(1);
    expect(rs.int(1, 10)).toEqual(1);
  });

  it('Should generate float', () => {
    expect(rs.num()).toEqual(0.6270739405881613);
    expect(rs.num(0, 1)).toEqual(0.002735721180215478);
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

  it('Should select random array element', () => {
    const list = [0, 1, 2, 3, 4];
    expect(rs.arrayElement(list)).toEqual(3);
    expect(rs.arrayElement(list)).toEqual(0);
  });
});
