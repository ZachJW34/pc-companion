<script setup lang="ts">
import { cn, logger } from "@/lib/utils";
import { useWsStore } from "@/store/ws";
import type { Component } from "vue";
import { ref, computed } from "vue";
import { ControlButtonClasses } from "./ui/classes";

const ws = useWsStore();
const isPressed = ref(false);

const props = defineProps<{
  value: SimulatedKey;
  type: "keyboard" | "mouse";
}>();

const emulatedEvents = computed(() => ({
  down: props.type === "keyboard" ? "keydown" : "mousedown",
  up: props.type === "keyboard" ? "keyup" : "mouseup",
}));

function clickEventHandler(e: MouseEvent | TouchEvent, code: string) {
  e.preventDefault();
  logger(`KeySimulator (${e.type}): `, { type: e.type, code });

  switch (e.type) {
    case "touchstart":
    case "mousedown": {
      isPressed.value = true;
      return ws.send({ type: emulatedEvents.value.down, code });
    }
    case "touchend":
    case "mouseup": {
      isPressed.value = false;
      return ws.send({ type: emulatedEvents.value.up, code });
    }
  }
}

export type SimulatedKey = { code: string; render: string | Component };
</script>

<template>
  <div
    @mousedown="(e) => clickEventHandler(e, value.code)"
    @mouseup="(e) => clickEventHandler(e, value.code)"
    @touchstart="(e) => clickEventHandler(e, value.code)"
    @touchend="(e) => clickEventHandler(e, value.code)"
    :class="[
      cn(ControlButtonClasses, 'min-w-10 min-h-8 text-xs'),
      { 'bg-secondary': isPressed },
    ]"
  >
    <template v-if="typeof value.render === 'string'">
      {{ value.render }}
    </template>
    <template v-else>
      <component :is="value.render"></component>
    </template>
    <slot></slot>
  </div>
</template>
