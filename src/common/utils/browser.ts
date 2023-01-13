export interface MatchedBrowser {
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

const vendor = navigator.vendor || '';
const userAgent = navigator.userAgent || '';

if (vendor.match(/google/i)) {
  browser.isChrome = true;
} else if (vendor.match(/apple/i)) {
  browser.isSafari = true;
} else if (userAgent.match(/firefox\//i)) {
  browser.isFirefox = true;
} else if (userAgent.match(/edge\//i)) {
  browser.isEdge = true;
} else if (userAgent.match(/trident\//i)) {
  browser.isIe = true;
}

export default browser;
