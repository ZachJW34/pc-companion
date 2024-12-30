import type { MouseButtons } from "./key-mappings";
import type { BrowserKeys } from "./keyboard";

type Debug = { log?: string };

export type ClickEvent = { type: "click"; click: MouseButtons } & Debug;
export type MouseEvent = {
  type: "mousedown" | "mouseup";
  code: MouseButtons;
} & Debug;
export type KeyboardEvent = {
  type: "keydown" | "keyup";
  code: BrowserKeys;
  key: string;
} & Debug;
export type TouchEvent = {
  type: "touchstart" | "touchmove" | "touchend";
  clientX: number;
  clientY: number;
  timestamp: number;
} & Debug;
export type RemoteEvent = ClickEvent | MouseEvent | KeyboardEvent | TouchEvent;
