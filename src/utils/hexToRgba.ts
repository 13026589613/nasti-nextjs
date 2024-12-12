export const hexToRgba = (hex: string, alpha: number = 1): string => {
  if (hex?.includes("#")) {
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else {
    return hex;
  }
};

export const isBlackRange = (rgbaColor: string, threshold = 50) => {
  const rgba = rgbaColor?.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/
  );
  if (!rgba) {
    return;
  }

  const r = parseInt(rgba[1], 10);
  const g = parseInt(rgba[2], 10);
  const b = parseInt(rgba[3], 10);

  return r <= threshold && g <= threshold && b <= threshold;
};
