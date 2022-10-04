interface MatchedBrowser {
  isSafari: boolean;
  isFirefox: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isIe: boolean;
}

const browser: MatchedBrowser = {
  isSafari: false,
  isFirefox: false,
  isChrome: false,
  isEdge: false,
  isIe: false,
};

if (navigator.vendor.match(/google/i)) {
  browser.isChrome = true;
} else if (navigator.vendor.match(/apple/i)) {
  browser.isSafari = true;
} else if (navigator.userAgent.match(/firefox\//i)) {
  browser.isFirefox = true;
} else if (navigator.userAgent.match(/edge\//i)) {
  browser.isEdge = true;
} else if (navigator.userAgent.match(/trident\//i)) {
  browser.isIe = true;
}

export default browser;
