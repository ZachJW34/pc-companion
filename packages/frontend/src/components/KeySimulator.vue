<script setup lang="ts">
import { logger } from "@/lib/utils";
import { useWsStore } from "@/store/ws";
import { ref, computed } from "vue";

const ws = useWsStore();
const isPressed = ref(false);

const props = defineProps<{
  value: { code: string; text: string };
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
</script>

<template>
  <div
    @mousedown="(e) => clickEventHandler(e, value.code)"
    @mouseup="(e) => clickEventHandler(e, value.code)"
    @touchstart="(e) => clickEventHandler(e, value.code)"
    @touchend="(e) => clickEventHandler(e, value.code)"
    variant="outline"
    :class="[
      'bg-gray-900 border border-gray-500 min-w-16 h-10 rounded select-none flex items-center justify-center',
      { 'bg-secondary': isPressed },
    ]"
  >
    {{ value.text }}
  </div>
</template>
