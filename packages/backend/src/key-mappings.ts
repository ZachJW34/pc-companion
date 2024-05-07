import { Button } from "@nut-tree-fork/nut-js";

export const BrowserMouseToButtonMapping = {
  left: Button.LEFT,
  middle: Button.MIDDLE,
  right: Button.RIGHT,
};

export type MouseButtons = keyof typeof BrowserMouseToButtonMapping;
