import { ForwardedRef, MutableRefObject, RefCallback } from 'react';
import _isFunction from 'lodash/isFunction';

const combineRefs =
  <T>(
    refs: Array<MutableRefObject<T> | ForwardedRef<T> | RefCallback<T>>
  ): ((commonRef: T | null) => void) =>
  (commonRef) =>
    commonRef &&
    refs.forEach((ref) => {
      if (_isFunction(ref)) {
        ref(commonRef);
      } else if (ref && 'current' in ref) {
        ref.current = commonRef;
      }
    });

export default combineRefs;
