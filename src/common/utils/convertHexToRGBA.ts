const convertHexToRGBA = (color: string, alpha = 1) => {
  let rgbaColor = '';
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return color;
    }
    rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else {
    rgbaColor = color;
  }
  return rgbaColor;
};

export default convertHexToRGBA;
