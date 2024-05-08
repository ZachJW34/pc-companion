import { Point, mouse } from "@nut-tree-fork/nut-js";
import { BrowserMouseToButtonMapping, type MouseButtons } from "./key-mappings";
import { type BrowserKeys, keyboardHandler } from "./keyboard";

type RemoteEvent =
  | { type: "click"; click: MouseButtons }
  | { type: "mousedown" | "mouseup"; code: MouseButtons }
  | {
      type: "keydown" | "keyup";
      code: BrowserKeys;
      key: string;
    }
  | {
      type: "touchmove" | "touchstart";
      clientX: number;
      clientY: number;
    }
  | { type: "touchend" };

let touchStatus:
  | { touching: false }
  | { touching: true; clientX: number; clientY: number } = { touching: false };

export async function handleEvent(e: string | Buffer) {
  const event: RemoteEvent = JSON.parse(e.toString());
  console.log("ws:recieved - ", event);

  switch (event.type) {
    case "keydown": {
      return await keyboardHandler.handleKey("press", event.code);
    }
    case "keyup": {
      return await keyboardHandler.handleKey("release", event.code);
    }
    case "click": {
      return await mouse.click(BrowserMouseToButtonMapping[event.click]);
    }
    case "mousedown": {
      return await mouse.pressButton(BrowserMouseToButtonMapping[event.code]);
    }
    case "mouseup": {
      return await mouse.releaseButton(BrowserMouseToButtonMapping[event.code]);
    }
    case "touchstart": {
      return (touchStatus = {
        touching: true,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    }
    case "touchend": {
      return (touchStatus = { touching: false });
    }
    case "touchmove": {
      if (touchStatus.touching) {
        const xDiff = event.clientX - touchStatus.clientX;
        const yDiff = event.clientY - touchStatus.clientY;
        const currentPos = await mouse.getPosition();
        const newPoint = new Point(currentPos.x + xDiff, currentPos.y + yDiff);
        touchStatus.clientX = event.clientX;
        touchStatus.clientY = event.clientY;

        return await mouse.move([newPoint]);
      }
    }
  }
}
