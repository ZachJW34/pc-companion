import { keyboard, mouse, Point } from "@nut-tree/nut-js";
import { BrowserMouseToButtonMapping, MouseButtons } from "./key-mappings";
import { WebSocketServer } from "ws";
import { BrowserKeys, handleKey } from "./keyboard";

const wss = new WebSocketServer({ port: 8080 });

type RemoteEvent =
  | { type: "click"; click: MouseButtons }
  | { type: "keydown" | "keyup"; code: BrowserKeys; key: string }
  | {
      type: "touchmove" | "touchstart";
      clientX: number;
      clientY: number;
    }
  | { type: "touchend" };

let touchStatus:
  | { touching: false }
  | { touching: true; clientX: number; clientY: number } = { touching: false };

async function main() {
  console.log("PC-Companion is running...");
  wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", async (data) => {
      const event: RemoteEvent = JSON.parse(data.toString());
      console.log("ws:recieved - ", event);
      switch (event.type) {
        case "keydown": {
          return await handleKey(event.code, "press");
        }
        case "keyup": {
          return await handleKey(event.code, "release");
        }
        case "click": {
          return await mouse.click(BrowserMouseToButtonMapping[event.click]);
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
            const newPoint = new Point(
              currentPos.x + xDiff,
              currentPos.y + yDiff
            );
            touchStatus.clientX = event.clientX;
            touchStatus.clientY = event.clientY;

            return await mouse.move([newPoint]);
          }
        }
      }
    });
  });
}

main();
