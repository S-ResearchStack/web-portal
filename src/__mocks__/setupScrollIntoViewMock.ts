beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});
