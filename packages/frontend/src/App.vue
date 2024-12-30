<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useWsStore } from "./store/ws";
import { useThrottleFn } from "@vueuse/core";
import WsConnectionStatus from "@/components/WsConnectionStatus.vue";
import { logger } from "./lib/utils";
import KeyboardFab from "./components/KeyboardFab.vue";
import Controls from "./components/Controls.vue";

const divInteractive = ref<HTMLDivElement>();

nextTick(() => {
  divInteractive.value?.focus();
});

const ws = useWsStore();

function mouseEventHandler(e: MouseEvent) {
  logger(`Mouse event (${e.type}): `, e);
  ws.send({ type: e.type, click: "left" });
}

function keyboardEventHandler(e: KeyboardEvent) {
  logger(`Keyboard event (${e.type}):`, e);
  ws.send({ type: e.type, key: e.key, code: e.code });
}

function touchEventHandler(e: TouchEvent) {
  if (e.type == "touchmove") {
    e.preventDefault();
  }
  logger(`TouchEvent (${e.type}): `, e);
  const { clientX, clientY } = e.targetTouches[0] || {};

  ws.send({ type: e.type, clientX, clientY, timestamp: Date.now() });
}

const throttledEventTouchHandler = useThrottleFn(touchEventHandler, 1);
</script>

<template>
  <WsConnectionStatus />
  <div class="p-4 container flex flex-col gap-2">
    <div
      ref="divInteractive"
      class="main focus:border focus:border-blue-500 w-full bg-gray-900 border border-gray-500 rounded-sm h-full relative"
      @click="mouseEventHandler"
      @touchmove="throttledEventTouchHandler"
      @touchstart="touchEventHandler"
      @touchend="touchEventHandler"
    >
      <div class="absolute bottom-0 right-0 text-sm opacity-50 p-2">
        __DATE__
      </div>
      <KeyboardFab
        class="absolute bottom-4 left-4 z-5"
        @key-press="keyboardEventHandler"
      />
    </div>
    <Controls />
  </div>
</template>

<style scoped>
.container {
  height: 100svh;
}
.main {
  background-image: url("/logo.png");
  background-size: 20%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
}
</style>
