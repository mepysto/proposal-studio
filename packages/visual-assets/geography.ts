export const mercator = (lon: number, lat: number): [number, number] => [
  (6378137 * lon * Math.PI) / 180,
  6378137 * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
];
export const unproject = (x: number, y: number): [number, number] => [
  ((x / 6378137) * 180) / Math.PI,
  ((2 * Math.atan(Math.exp(y / 6378137)) - Math.PI / 2) * 180) / Math.PI,
];
export function geographicViewport(
  bounds: { west: number; south: number; east: number; north: number },
  width: number,
  height: number,
) {
  const [xmin, ymin] = mercator(bounds.west, bounds.south),
    [xmax, ymax] = mercator(bounds.east, bounds.north);
  const scale = Math.min(width / (xmax - xmin), height / (ymax - ymin)),
    cx = (xmin + xmax) / 2,
    cy = (ymin + ymax) / 2;
  const left = cx - width / scale / 2,
    right = cx + width / scale / 2,
    bottom = cy - height / scale / 2,
    top = cy + height / scale / 2;
  const [west, south] = unproject(left, bottom),
    [east, north] = unproject(right, top);
  return {
    bounds: { west, south, east, north },
    point: (lon: number, lat: number) => {
      const [x, y] = mercator(lon, lat);
      return [(x - left) * scale, (top - y) * scale] as [number, number];
    },
    metersPerPixel: 1 / scale,
  };
}
