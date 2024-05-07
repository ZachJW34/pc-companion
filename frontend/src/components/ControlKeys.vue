<script setup lang="ts">
import KeySimulator from "./KeySimulator.vue";

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
</script>

<template>
  <div class="flex gap-2 justify-center flex-wrap items-center">
    <KeySimulator v-for="key in keys" :value="key" type="keyboard" />
  </div>
</template>
