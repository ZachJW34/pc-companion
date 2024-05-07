<script setup lang="ts">
import KeySimulator from "./KeySimulator.vue";

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
</script>

<template>
  <div class="flex gap-2 justify-center flex-wrap">
    <KeySimulator v-for="key in keys" :value="key" type="keyboard" />
  </div>
</template>
