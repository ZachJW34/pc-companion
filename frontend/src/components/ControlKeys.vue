<script setup lang="ts">
import { useWsStore } from "@/store/ws";
import { Button } from "./ui/button";
import { useToggle } from "@vueuse/core";

const { send } = useWsStore();
const [useMutli, toggleUseMulti] = useToggle(false);
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
    text: "Cmd",
    code: "MetaLeft",
  },
  {
    text: "Esc",
    code: "Escape",
  },
  {
    text: "Tab",
    code: "Tab",
  },
];

function handleMulti() {
  toggleUseMulti();
  if (useMutli.value) {
    send({ type: "enable-multi" });
  } else {
    send({ type: "disable-multi" });
  }
}

function functionKeyHandler(type: "keyup" | "keydown", code: string) {
  console.log(`FunctionKey event (${type}):`, code);
  send({ type, code, multi: useMutli.value });
}
</script>

<template>
  <div class="flex gap-2 justify-center flex-wrap items-center">
    <Button
      variant="default"
      :class="['p-0 w-8 h-7', { 'bg-green-500 hover:bg-green-400': useMutli }]"
      @click="handleMulti()"
    >
      <div class="bg-[url('assets/hold.png')] w-8 h-8 bg-cover"></div>
    </Button>
    <Button
      v-for="key in keys"
      @mousedown="() => functionKeyHandler('keydown', key.code)"
      @mouseup="() => functionKeyHandler('keyup', key.code)"
      variant="outline"
      class="text-xs p-2 h-8 w-9 hover:border border-background"
      >{{ key.text }}</Button
    >
  </div>
</template>
