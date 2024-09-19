<script setup lang="ts">
import { useAudioDeviceStore } from "@/store/audio-devices";
import { onBeforeMount } from "vue";
import Speakers from "@/components/ui/icons/Speakers.vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { SelectTrigger as SelectTriggerRaw } from "radix-vue";
import { ControlButtonClasses } from "./ui/classes";
import { cn } from "@/lib/utils";
import { storeToRefs } from "pinia";

const audioDeviceStore = useAudioDeviceStore();
const { state: audioState } = storeToRefs(audioDeviceStore);

onBeforeMount(() => {
  audioDeviceStore.getOutputDevices();
});

function setOutputAudioDevice(id: string) {
  audioDeviceStore.switchOutputDevice(id);
}
</script>

<template>
  <div class="flex justify-center">
    <div
      v-if="audioState.status === 'pending'"
      :class="cn(ControlButtonClasses, 'h-16 w-16')"
    >
      <Speakers height="2rem" width="2rem" />
    </div>
    <div
      v-else-if="audioState.status === 'error'"
      :class="cn(ControlButtonClasses, 'h-16 w-16')"
    >
      <Speakers height="2rem" width="2rem" />shiz
    </div>
    <Select
      v-else
      :model-value="audioState.current"
      @update:model-value="setOutputAudioDevice"
    >
      <SelectTriggerRaw>
        <div :class="cn(ControlButtonClasses, 'h-16 w-16')">
          <Speakers height="2rem" width="2rem" />
        </div>
      </SelectTriggerRaw>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Audio Devices</SelectLabel>
          <SelectItem v-for="device in audioState.devices" :value="device.id">{{
            device.name
          }}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>
