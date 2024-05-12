import { Point, mouse } from "@nut-tree-fork/nut-js";
import type { TouchEvent } from "./events";
import type { ScreenHandler } from "./screen";

export class TouchHandler {
  #touchStatus: {
    clientX: number;
    clientY: number;
    time: number;
  } | null = null;

  startTouch(event: TouchEvent) {
    this.#touchStatus = {
      clientX: event.clientX,
      clientY: event.clientY,
      time: event.timestamp,
    };
  }

  async move(event: TouchEvent, screenHandler: ScreenHandler) {
    if (!this.#touchStatus) return;

    const timeDelta = event.timestamp - this.#touchStatus.time;
    if (timeDelta === 0) return;

    const currentPos = await mouse.getPosition();

    const xDiff = event.clientX - this.#touchStatus.clientX;
    const yDiff = event.clientY - this.#touchStatus.clientY;
    const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
    const veloctiy = distance / timeDelta;
    const scaledVelocity = accFunc(veloctiy);
    const scalar = scaledVelocity / veloctiy;
    const scaledXDiff = scalar * xDiff;
    const scaledYDiff = scalar * yDiff;

    const newX = floor(currentPos.x + scaledXDiff, screenHandler.width);
    const newY = floor(currentPos.y + scaledYDiff, screenHandler.height);

    const newPoint = new Point(newX, newY);
    this.#touchStatus = {
      clientX: event.clientX,
      clientY: event.clientY,
      time: event.timestamp,
    };

    return await mouse.move([newPoint]);
  }

  async endTouch() {
    this.#touchStatus = null;
  }
}

function accFunc(x: number) {
  return x + 0.5 * x ** 3;
}

function floor(current: number, max: number) {
  if (current <= 0) {
    return 0;
  } else if (current >= max) {
    return max;
  } else {
    return Math.round(current);
  }
}
