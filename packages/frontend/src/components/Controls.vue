<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import FunctionKeys from "@/components/KeyboardControls.vue";
import ControlKeys from "@/components/DeviceControls.vue";
import KeySimulator from "@/components/KeySimulator.vue";
import Devices from "@/components/ui/icons/Devices.vue";

const [showFnKeys, toggleShowFnKeys] = useToggle(false);
const [showCtrlKeys, toggleShowCtrlKeys] = useToggle(false);
</script>

<template>
  <div v-if="showFnKeys || showCtrlKeys" class="bg-secondary p-2 rounded-md">
    <FunctionKeys v-if="showFnKeys" />
    <div
      v-if="showCtrlKeys && showFnKeys"
      class="w-full border-b border-gray-500 my-2"
    ></div>
    <ControlKeys v-if="showCtrlKeys" />
  </div>
  <div class="flex justify-center items-center gap-2">
    <div class="relative">
      <Button
        variant="secondary"
        @click="toggleShowFnKeys()"
        :class="['text-xs w-14', { 'rounded-b-md rounded-t-none': showFnKeys }]"
        ><span>Fn</span>
      </Button>
      <div v-if="showFnKeys">
        <div class="absolute top-[-0.5rem] w-14 h-2 bg-secondary"></div>
        <div
          class="absolute top-[-0.5rem] left-[-3.5rem] w-14 h-2 bg-secondary"
        >
          <div class="h-2 w-full bg-background rounded-tr-lg"></div>
        </div>
        <div
          class="absolute top-[-0.5rem] right-[-3.5rem] w-14 h-2 bg-secondary"
        >
          <div class="h-2 w-full bg-background rounded-tl-lg"></div>
        </div>
      </div>
    </div>
    <div class="flex gap-2">
      <KeySimulator
        v-for="key in ['left', 'middle', 'right']"
        :value="{ code: key, render: '' }"
        type="mouse"
        :class="{ 'w-6': key === 'middle', 'w-20': key !== 'middle' }"
      />
    </div>
    <div class="relative">
      <Button
        variant="secondary"
        @click="toggleShowCtrlKeys()"
        :class="[
          'text-xs w-14',
          { 'rounded-b-md rounded-t-none': showCtrlKeys },
        ]"
        ><Devices class="text-lg" />
      </Button>
      <div v-if="showCtrlKeys">
        <div class="absolute top-[-0.5rem] w-14 h-2 bg-secondary"></div>
        <div
          class="absolute top-[-0.5rem] left-[-3.5rem] w-14 h-2 bg-secondary"
        >
          <div class="h-2 w-full bg-background rounded-tr-lg"></div>
        </div>
        <div
          class="absolute top-[-0.5rem] right-[-3.5rem] w-14 h-2 bg-secondary"
        >
          <div class="h-2 w-full bg-background rounded-tl-lg"></div>
        </div>
      </div>
    </div>
  </div>
</template>
