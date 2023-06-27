beforeAll(() => {
  (SVGElement.prototype as SVGTextContentElement).getComputedTextLength = () => 0;
});
