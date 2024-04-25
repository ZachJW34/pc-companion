<script setup lang="ts">
import { useWsStore } from "@/store/ws";
import { Button } from "./ui/button";

const { send } = useWsStore();
const keys = [
  {
    text: "F1",
    code: "F1",
  },
  {
    text: "F2",
    code: "F2",
  },
  {
    text: "F3",
    code: "F3",
  },
  {
    text: "F4",
    code: "F4",
  },
  {
    text: "F5",
    code: "F5",
  },
  {
    text: "F6",
    code: "F6",
  },
  {
    text: "F7",
    code: "F7",
  },
  {
    text: "F8",
    code: "F8",
  },
  {
    text: "F9",
    code: "F9",
  },
  {
    text: "F10",
    code: "F10",
  },
  {
    text: "F11",
    code: "F11",
  },
  {
    text: "F12",
    code: "F12",
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
