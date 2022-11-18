import smoothScroll from 'smoothscroll-polyfill';
import _isNull from 'lodash/isNull';
import _isObject from 'lodash/isObject';
import browser from 'src/common/utils/browser';

type ArgumentTypes<F extends () => unknown> = F extends (...args: infer A) => unknown ? A : never;

// safari smooth scroll fix
if (browser.isSafari) {
  smoothScroll.polyfill();

  const prevScrollTo = window.scrollTo;

  // issue: https://github.com/iamdustan/smoothscroll/issues/161
  Object.assign(window, {
    scrollTo: ((...args) => {
      if (_isObject(args[0])) {
        args[0].left = _isNull(args[0].left) ? undefined : args[0].left;
        args[0].top = _isNull(args[0].top) ? undefined : args[0].top;
      } else {
        args[0] = _isNull(args[0]) ? undefined : args[0];
        args[1] = _isNull(args[1]) ? undefined : args[1];
      }

      prevScrollTo(...(args as ArgumentTypes<typeof window.scrollTo>));
    }) as typeof window.scrollTo,
  });
}
