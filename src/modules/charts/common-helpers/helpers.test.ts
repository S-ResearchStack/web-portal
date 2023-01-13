import {
  formatTimeAxisTick,
  formatTimeAxisWithNames,
  getRangeFromSelection,
  getTooltipPosition,
  initBrushX,
  initBrushY,
  isResetButtonShown,
} from 'src/modules/charts/common-helpers/helpers';

describe('getRangeFromSelection', () => {
  it('should return range', () => {
    expect(getRangeFromSelection([1, 4])).toBe(3);
  });

  it('[NEGATIVE] should return range', () => {
    expect(getRangeFromSelection([0, 0])).toBe(0);
  });
});

describe('isResetButtonShown', () => {
  it('should check boundaries', () => {
    expect(isResetButtonShown([0, 1], [0, 1])).toBeFalse();
    expect(isResetButtonShown([0.1, 1], [0, 1])).toBeTrue();
    expect(isResetButtonShown([0, 0.9], [0, 1])).toBeTrue();
    expect(isResetButtonShown([0, 1], [0.1, 1])).toBeTrue();
    expect(isResetButtonShown([0, 1], [0, 0.9])).toBeTrue();
  });

  it('[NEGATIVE] should return true with invalid inputs', () => {
    expect(isResetButtonShown([0, undefined as unknown as number], [NaN, 1])).toBeTrue();
  });
});

describe('getTooltipPosition', () => {
  it('should calcualte position', () => {
    expect(
      getTooltipPosition(10, 250, { top: 0, bottom: 500, left: 0, right: 500 } as DOMRect)
    ).toEqual('r');
    expect(
      getTooltipPosition(490, 250, { top: 0, bottom: 500, left: 0, right: 500 } as DOMRect)
    ).toEqual('l');
    expect(
      getTooltipPosition(250, 250, { top: 0, bottom: 500, left: 0, right: 500 } as DOMRect)
    ).toEqual('t');
    expect(
      getTooltipPosition(250, 10, { top: 0, bottom: 500, left: 0, right: 500 } as DOMRect)
    ).toEqual('b');
  });

  it('[NEGATIVE] should return top position with invalid rect', () => {
    expect(getTooltipPosition(0, 0, {} as DOMRect)).toEqual('t');
    expect(getTooltipPosition(0, 0, undefined as unknown as DOMRect)).toEqual('t');
  });
});

describe('formatTimeAxisTick', () => {
  it('should format time', () => {
    expect(formatTimeAxisTick(0)).toBe('12 am');
    expect(formatTimeAxisTick(7 * 60 * 1000)).toBe('12:7 am');
  });

  it('[NEGATIVE] should format invalid value', () => {
    expect(formatTimeAxisTick(NaN)).toBe('invalid datetime');
  });
});

describe('formatTimeAxisWithNames', () => {
  it('should format specific values', () => {
    expect(formatTimeAxisWithNames(0)).toBe('MIDNIGHT');
    expect(formatTimeAxisWithNames(12 * 3600 * 1000)).toBe('NOON');
    expect(formatTimeAxisWithNames(3 * 3600 * 1000)).toBe(' ');
    expect(formatTimeAxisWithNames(4 * 3600 * 1000)).toBe('4 AM');
  });

  it('[NEGATIVE] should format invalid value', () => {
    expect(formatTimeAxisWithNames(NaN)).toBe('Invalid DateTime');
  });
});

describe('initBrushX', () => {
  it('should init brush', () => {
    expect(initBrushX(100, 100, () => {})).toBeDefined();
  });

  it('[NEGATIVE] should init brush with invalid values', () => {
    expect(initBrushX(NaN, NaN, () => {})).toBeDefined();
  });
});

describe('initBrushY', () => {
  it('should init brush', () => {
    expect(initBrushY(100, 100, () => {})).toBeDefined();
  });

  it('[NEGATIVE] should init brush with invalid values', () => {
    expect(initBrushY(NaN, NaN, () => {})).toBeDefined();
  });
});
