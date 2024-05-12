import type { MouseButtons } from "./key-mappings";
import type { BrowserKeys } from "./keyboard";

export type ClickEvent = { type: "click"; click: MouseButtons };
export type MouseEvent = { type: "mousedown" | "mouseup"; code: MouseButtons };
export type KeyboardEvent = {
  type: "keydown" | "keyup";
  code: BrowserKeys;
  key: string;
};
export type TouchEvent = {
  type: "touchstart" | "touchmove" | "touchend";
  clientX: number;
  clientY: number;
  timestamp: number;
};
export type RemoteEvent = ClickEvent | MouseEvent | KeyboardEvent | TouchEvent;
