<script setup lang="ts">
import { useWsStore } from "@/store/ws";
import { Button } from "./ui/button";

const { send } = useWsStore();
const keys = [
  {
    text: "Ctrl",
    code: "ControlLeft",
  },
  {
    text: "Alt",
    code: "AltLeft",
  },
  {
    text: "Del",
    code: "Delete",
  },
  {
    text: "Win",
    code: "Windows",
  },
  {
    text: "Esc",
    code: "Escape",
  },
  {
    text: "Tab",
    code: "Tab",
  },
  {
    text: "Home",
    code: "Home",
  },
];

function functionKeyHandler(type: "keyup" | "keydown", code: string) {
  console.log(`FunctionKey event (${type}):`, code);
  send({ type, code });
}
</script>

<template>
  <div class="flex gap-2 justify-center flex-wrap">
    <Button
      v-for="key in keys"
      @mousedown="() => functionKeyHandler('keydown', key.code)"
      @mouseup="() => functionKeyHandler('keyup', key.code)"
      variant="outline"
      class="text-xs p-2 h-8 w-9"
      >{{ key.text }}</Button
    >
  </div>
</template>
