import React, { FormEvent, useCallback, useContext, useRef, useState } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import { CountContext } from 'src/modules/study-management/common/LimitsCounter';
import { isInsideTest } from 'src/common/utils/testing';

export const LOCAL_STATE_DELAY = isInsideTest ? 1 : 500;

type Props<E> = {
  value?: E extends HTMLTextAreaElement ? string : string | number | readonly string[];
  onChange?: (evt: React.ChangeEvent<E>) => void;
  onInput?: (evt: React.FormEvent<E>) => void;
  max?: number | string;
};

// TODO: Add custom props for WrappedComponent
//
// function withLocalDebouncedState<
//   E extends HTMLTextAreaElement | HTMLInputElement,
// >(WrappedComponent: React.ComponentType<React.InputHTMLAttributes<E> | React.TextareaHTMLAttributes<E>>) {
//   return function Component(props: React.ComponentProps<typeof WrappedComponent>;) {
//      ...
//    }
// }

function withLocalDebouncedState<
  E extends HTMLTextAreaElement | HTMLInputElement,
  P extends Props<E>
>(WrappedComponent: React.ComponentType<P>) {
  return function Component(props: P) {
    const { value, onChange, max } = props;

    const { setCount } = useContext(CountContext);

    const [localValue, setLocalValue] = useState(value);
    const lastChangeEventRef = useRef<React.ChangeEvent<E>>();

    useUpdateEffect(() => {
      setLocalValue(value);
    }, [value]);

    useDebounce(
      () => {
        lastChangeEventRef.current && onChange?.(lastChangeEventRef.current);
      },
      LOCAL_STATE_DELAY,
      [localValue]
    );

    const handleChange = useCallback(
      (evt: React.ChangeEvent<E>) => {
        const maxToNumber = Number(max);
        const inputValue = evt.target.value;
        if (max && maxToNumber) {
          if (inputValue.length <= maxToNumber) {
            setLocalValue(inputValue);
            lastChangeEventRef.current = evt;
          }
        } else {
          setLocalValue(inputValue);
          lastChangeEventRef.current = evt;
        }
      },
      [max]
    );

    const handleSetCurrentCount = useCallback(
      (evt: FormEvent<HTMLInputElement>) => {
        const count = evt.currentTarget.value.length;
        if (Number(max) && count <= Number(max)) {
          setCount?.(count);
        }
      },
      [max, setCount]
    );

    return (
      <WrappedComponent
        {...props}
        value={localValue}
        onChange={handleChange}
        onInput={handleSetCurrentCount}
      />
    );
  };
}

export default withLocalDebouncedState;
