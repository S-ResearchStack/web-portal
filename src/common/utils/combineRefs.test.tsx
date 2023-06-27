import { MutableRefObject, RefCallback, useRef } from 'react';
import { renderHook } from '@testing-library/react';
import combineRefs from 'src/common/utils/combineRefs';

describe('combineRefs util', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should mutate passed array if get refs array', () => {
    const { result: firstRef } = renderHook(() => useRef(null));
    const { result: secondRef } = renderHook(() => useRef(null));
    const common = { test: null };

    const refsArray: Array<MutableRefObject<{ test: null } | null>> = [
      firstRef.current,
      secondRef.current,
    ];
    const combine = combineRefs(refsArray);
    combine(common);

    expect(refsArray).toMatchObject([{ current: { test: null } }, { current: { test: null } }]);
  });

  it('[NEGATIVE] should not mutate passed array if empty array passed', async () => {
    const common = { test: null };

    const refsArray: Array<MutableRefObject<{ test: null } | null>> = [];
    const combine = combineRefs(refsArray);
    combine(common);

    expect(refsArray).toMatchObject([]);
  });

  it('should call cb functions if array function passed', () => {
    const common = { first: 0, second: 0 };
    const firstRef = (instance: { first: number; second: number }) => {
      common.first = instance.first + 1;
    };
    const secondRef = (instance: { first: number; second: number }) => {
      common.second = instance.second + 1;
    };
    const refsArray: Array<RefCallback<{ first: number; second: number }>> = [firstRef, secondRef];

    const combine = combineRefs(refsArray);
    combine(common);

    expect(common).toMatchObject({ first: 1, second: 1 });
  });

  it('[NEGATIVE] should not call cb function if empty array passed', async () => {
    const common = { first: 0, second: 0 };

    const refsArray: Array<RefCallback<{ first: number; second: number }>> = [];

    const combine = combineRefs(refsArray);
    combine(common);

    expect(common).toMatchObject({ first: 0, second: 0 });
  });
});
