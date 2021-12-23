const toKey = (x: number, y: number) => `${x},${y}`;

const printImage = (
  map: Map<string, boolean>,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) => {
  let str = "";
  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      str += map.get(toKey(x, y)) ? "#" : ".";
    }
    str += "\n";
  }
  console.log(str);
};

const enhancePixel = (
  x: number,
  y: number,
  image: Map<string, boolean>,
  algorithmString: string,
  defaultValue: number
): boolean => {
  const pixelScan = [];
  for (let dy = y - 1; dy <= y + 1; dy++) {
    for (let dx = x - 1; dx <= x + 1; dx++) {
      const key = toKey(dx, dy);
      if (image.has(key)) {
        pixelScan.push(image.get(key) ? 1 : 0);
      } else {
        pixelScan.push(defaultValue);
      }
    }
  }
  const value = parseInt(pixelScan.join(""), 2);
  const v = algorithmString.split("")[value];
  if (v === undefined) {
    throw new Error("Invalid value " + v);
  }
  if (pixelScan.length !== 9) {
    throw new Error("Wrong length " + pixelScan);
  }
  return v === "#";
};

const enhance = (
  options: {
    image: Map<string, boolean>;
    minY: number;
    minX: number;
    maxY: number;
    maxX: number;
  },
  algorithmString: string,
  defaultValue: number
) => {
  const nextImage = new Map<string, boolean>();
  const startX = options.minX - 1;
  const endX = options.maxX + 1;
  const startY = options.minY - 1;
  const endY = options.maxY + 1;
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      const pixelValue = enhancePixel(
        x,
        y,
        options.image,
        algorithmString,
        defaultValue
      );
      nextImage.set(toKey(x, y), pixelValue);
    }
  }

  return {
    image: nextImage,
    maxX: endX,
    maxY: endY,
    minX: startX,
    minY: startY,
  };
};

const countPixelsLit = (
  image: Map<string, boolean>,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) => {
  let sum = 0;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (image.get(toKey(x, y))) {
        sum++;
      }
    }
  }
  return sum;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const startMinX = 0;
  const startMaxX = input[1].length;
  const startMinY = 0;
  const startMaxY = input.length - 1;

  const startImage = new Map<string, boolean>();

  let y = 0;
  for (const r of input.slice(1)) {
    let x = 0;
    for (const c of r.split("")) {
      startImage.set(toKey(x, y), c === "#");
      x++;
    }
    y++;
  }

  let enchancementOptions = {
    image: startImage,
    minX: startMinX,
    maxX: startMaxX,
    minY: startMinY,
    maxY: startMaxY,
  };

  const enchancements = !isPartTwo ? 2 : 50;
  for (let i = 0; i < enchancements; i++) {
    const defaultValue = i % 2 === 0 ? 0 : 1;
    enchancementOptions = enhance(enchancementOptions, input[0], defaultValue);
  }

  const count = countPixelsLit(
    enchancementOptions.image,
    enchancementOptions.minX,
    enchancementOptions.maxX,
    enchancementOptions.minY,
    enchancementOptions.maxY
  );
  return count.toString();
};
