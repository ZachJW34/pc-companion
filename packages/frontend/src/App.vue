<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useWsStore } from "./store/ws";
import { useThrottleFn, useToggle } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FunctionKeys from "@/components/FunctionKeys.vue";
import ControlKeys from "@/components/ControlKeys.vue";
import KeySimulator from "./components/KeySimulator.vue";

const divInteractive = ref<HTMLDivElement>();
const [showFnKeys, toggleShowFnKeys] = useToggle(false);
const [showCtrlKeys, toggleShowCtrlKeys] = useToggle(false);

nextTick(() => {
  divInteractive.value?.focus();
});

const ws = useWsStore();

function mouseEventHandler(e: MouseEvent) {
  console.log(`Mouse event (${e.type}): `, e);
  ws.send({ type: e.type, click: "left" });
}

function keyboardEventHandler(e: KeyboardEvent) {
  console.log(`Keyboard event (${e.type}):`, e);
  ws.send({ type: e.type, key: e.key, code: e.code });
}

function touchEventHandler(e: TouchEvent) {
  if (e.type == "touchmove") {
    e.preventDefault();
  }
  console.log(`TouchEvent (${e.type}): `, e);
  const { clientX, clientY } = e.targetTouches[0] || {};

  ws.send({ type: e.type, clientX, clientY });
}

const throttledEventTouchHandler = useThrottleFn(touchEventHandler, 8);
</script>

<template>
  <div class="p-4 container flex flex-col gap-2">
    <div class="flex justify-center items-center gap-2">
      <div class="relative">
        <Button
          variant="secondary"
          @click="toggleShowFnKeys()"
          :class="[
            'text-xs w-14',
            { 'rounded-t-md rounded-b-none': showFnKeys },
          ]"
          ><span>Fn</span>
        </Button>
        <div v-if="showFnKeys">
          <div class="absolute bottom-[-0.5rem] w-14 h-2 bg-secondary"></div>
          <div
            class="absolute bottom-[-0.5rem] left-[-3.5rem] w-14 h-2 bg-secondary"
          >
            <div class="h-2 w-full bg-background rounded-br-lg"></div>
          </div>
          <div
            class="absolute bottom-[-0.5rem] right-[-3.5rem] w-14 h-2 bg-secondary"
          >
            <div class="h-2 w-full bg-background rounded-bl-lg"></div>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <KeySimulator
          v-for="key in ['left', 'middle', 'right']"
          :value="{ code: key, text: '' }"
          type="mouse"
          :class="{ 'min-w-6': key === 'middle', 'min-w-20': key !== 'middle' }"
        />
      </div>
      <div class="relative">
        <Button
          variant="secondary"
          @click="toggleShowCtrlKeys()"
          :class="[
            'text-xs w-14',
            { 'rounded-t-md rounded-b-none': showCtrlKeys },
          ]"
          ><span>Ctrl</span>
        </Button>
        <div v-if="showCtrlKeys">
          <div class="absolute bottom-[-0.5rem] w-14 h-2 bg-secondary"></div>
          <div
            class="absolute bottom-[-0.5rem] left-[-3.5rem] w-14 h-2 bg-secondary"
          >
            <div class="h-2 w-full bg-background rounded-br-lg"></div>
          </div>
          <div
            class="absolute bottom-[-0.5rem] right-[-3.5rem] w-14 h-2 bg-secondary"
          >
            <div class="h-2 w-full bg-background rounded-bl-lg"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showFnKeys || showCtrlKeys" class="bg-secondary p-2 rounded-md">
      <FunctionKeys v-if="showFnKeys" />
      <div
        v-if="showCtrlKeys && showFnKeys"
        class="w-full border-b border-gray-500 my-2"
      ></div>
      <ControlKeys v-if="showCtrlKeys" />
    </div>
    <div
      ref="divInteractive"
      class="main focus:border focus:border-blue-500 w-full bg-gray-900 border border-gray-500 rounded-sm h-full"
      @click="mouseEventHandler"
      @touchmove="throttledEventTouchHandler"
      @touchstart="touchEventHandler"
      @touchend="touchEventHandler"
    ></div>
    <Input @keydown="keyboardEventHandler" @keyup="keyboardEventHandler" />
    <!-- <div>WS State: {{ ws.wsState.state }}; DidError: {{ ws.didError }}</div> -->
  </div>
</template>

<style scoped>
.container {
  height: 100svh;
}
.main {
  background-image: url("/pc-companion-logo.png");
  background-size: 20%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
}
</style>
