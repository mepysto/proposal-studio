/** Ports are computed from the final visible bounds, never from text baselines. */
export type ConnectorBox = { x: number; y: number; w: number; h: number };
export function facingPorts(from: ConnectorBox, to: ConnectorBox, axis: "horizontal" | "vertical" = "horizontal") {
  if (axis === "horizontal") {
    const right = to.x >= from.x + from.w;
    if (!right && from.x < to.x + to.w) throw new Error("Connector boxes overlap on horizontal routing axis");
    return { start: [right ? from.x + from.w : from.x, from.y + from.h / 2], end: [right ? to.x : to.x + to.w, to.y + to.h / 2] };
  }
  const down = to.y >= from.y + from.h;
  if (!down && from.y < to.y + to.h) throw new Error("Connector boxes overlap on vertical routing axis");
  return { start: [from.x + from.w / 2, down ? from.y + from.h : from.y], end: [to.x + to.w / 2, down ? to.y : to.y + to.h] };
}
