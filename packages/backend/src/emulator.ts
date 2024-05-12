import { MouseClass, mouse, screen } from "@nut-tree-fork/nut-js";
import { BrowserMouseToButtonMapping } from "./key-mappings";
import { KeyboardHandler } from "./keyboard";
import type { RemoteEvent } from "./events";
import { TouchHandler } from "./touch";
import { ScreenHandler } from "./screen";
import { debugLogger } from "./utils";

export class Emulator {
  #keyboardHandler: KeyboardHandler;
  #touchHandler: TouchHandler;
  #screenHandler: ScreenHandler;
  #mouseHandler: MouseClass;

  static async NEW() {
    return new Emulator({
      keyboardHandler: new KeyboardHandler(),
      touchHandler: new TouchHandler(),
      screenHandler: new ScreenHandler({
        width: await screen.width(),
        height: await screen.height(),
      }),
      mouseHandler: mouse,
    });
  }

  constructor(handlers: {
    keyboardHandler: KeyboardHandler;
    touchHandler: TouchHandler;
    screenHandler: ScreenHandler;
    mouseHandler: MouseClass;
  }) {
    this.#keyboardHandler = handlers.keyboardHandler;
    this.#touchHandler = handlers.touchHandler;
    this.#screenHandler = handlers.screenHandler;
    this.#mouseHandler = handlers.mouseHandler;
  }

  async handleEvent(e: string | Buffer) {
    const event: RemoteEvent = JSON.parse(e.toString());
    debugLogger("ws:recieved - ", event);

    switch (event.type) {
      case "keydown": {
        return await this.#keyboardHandler.pressKey(event.code);
      }
      case "keyup": {
        return await this.#keyboardHandler.releaseKey(event.code);
      }
      case "click": {
        return await this.#mouseHandler.click(
          BrowserMouseToButtonMapping[event.click]
        );
      }
      case "mousedown": {
        return await this.#mouseHandler.pressButton(
          BrowserMouseToButtonMapping[event.code]
        );
      }
      case "mouseup": {
        return await this.#mouseHandler.releaseButton(
          BrowserMouseToButtonMapping[event.code]
        );
      }
      case "touchstart": {
        return this.#touchHandler.startTouch(event);
      }
      case "touchmove": {
        return this.#touchHandler.move(event, this.#screenHandler);
      }
      case "touchend": {
        return this.#touchHandler.endTouch();
      }
    }
  }
}
