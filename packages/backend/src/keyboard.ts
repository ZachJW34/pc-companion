import { Key, keyboard } from "@nut-tree-fork/nut-js";
import { getPlatform } from "./utils";

export const BrowserToKeyMapping = {
  KeyA: Key.A,
  KeyB: Key.B,
  KeyC: Key.C,
  KeyD: Key.D,
  KeyE: Key.E,
  KeyF: Key.F,
  KeyG: Key.G,
  KeyH: Key.H,
  KeyI: Key.I,
  KeyJ: Key.J,
  KeyK: Key.K,
  KeyL: Key.L,
  KeyM: Key.M,
  KeyN: Key.N,
  KeyO: Key.O,
  KeyP: Key.P,
  KeyQ: Key.Q,
  KeyR: Key.R,
  KeyS: Key.S,
  KeyT: Key.T,
  KeyU: Key.U,
  KeyV: Key.V,
  KeyW: Key.W,
  KeyX: Key.X,
  KeyY: Key.Y,
  KeyZ: Key.Z,
  ShiftLeft: Key.LeftShift,
  ShiftRight: Key.RightShift,
  Backspace: Key.Backspace,
  Space: Key.Space,
  ArrowLeft: Key.Left,
  ArrowDown: Key.Down,
  ArrowUp: Key.Up,
  ArrowRight: Key.Right,
  Enter: Key.Enter,
  Digit0: Key.Num0,
  Digit1: Key.Num1,
  Digit2: Key.Num2,
  Digit3: Key.Num3,
  Digit4: Key.Num4,
  Digit5: Key.Num5,
  Digit6: Key.Num6,
  Digit7: Key.Num7,
  Digit8: Key.Num8,
  Digit9: Key.Num9,
  F1: Key.F1,
  F2: Key.F2,
  F3: Key.F3,
  F4: Key.F4,
  F5: Key.F5,
  F6: Key.F6,
  F7: Key.F7,
  F8: Key.F8,
  F9: Key.F9,
  F10: Key.F10,
  F11: Key.F11,
  F12: Key.F12,
  Minus: Key.Minus,
  Equal: Key.Equal,
  BracketLeft: Key.LeftBracket,
  BracketRight: Key.RightBracket,
  Tab: Key.Tab,
  CapsLock: Key.CapsLock,
  Comma: Key.Comma,
  Period: Key.Period,
  Slash: Key.Slash,
  Backslash: Key.Backslash,
  Escape: Key.Escape,
  ControlLeft: Key.LeftControl,
  ControlRight: Key.RightControl,
  Quote: Key.Quote,
  Semicolon: Key.Semicolon,
  AltLeft: Key.LeftAlt,
  AltRight: Key.RightAlt,
  Backquote: Key.Grave,
  Windows: Key.LeftWin,
  Home: Key.Home,
  MetaLeft: Key.LeftCmd,
  MetaRight: Key.RightCmd,
  Multiply: Key.Multiply,
  Subtract: Key.Subtract,
  Insert: Key.Insert,
  PageUp: Key.PageUp,
  PageDown: Key.PageDown,
  Add: Key.Add,
  End: Key.End,
} as const;

export type BrowserKeys = keyof typeof BrowserToKeyMapping;

export class KeyboardHandler {
  async pressKey(code: BrowserKeys): Promise<void> {
    const realKey = this.#getRealKey(code);
    if (realKey) {
      await keyboard.pressKey(realKey);
    }
  }

  async releaseKey(code: BrowserKeys): Promise<void> {
    const realKey = this.#getRealKey(code);
    if (realKey) {
      await keyboard.releaseKey(realKey);
    }
  }

  #getRealKey(code: BrowserKeys) {
    const realKey = BrowserToKeyMapping[code];

    if (code === "Windows" && getPlatform() !== "windows") {
      return null;
    } else {
      return realKey;
    }
  }
}
