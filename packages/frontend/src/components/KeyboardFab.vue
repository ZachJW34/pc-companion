<script setup lang="ts">
import { ref } from "vue";
import { Button } from "./ui/button";
import OutlineKeyboard from "./ui/icons/OutlineKeyboard.vue";

const emit = defineEmits<{
  (e: "keyPress", payload: KeyboardEvent): void;
}>();

function click(e: Event) {
  e.stopPropagation();
  input.value?.focus();
}
const input = ref<HTMLInputElement>();
</script>

<template>
  <Button
    variant="outline"
    class="flex justify-center items-center h-14 w-14 bg-background rounded-full"
    @click="click"
    @touchmove="(e) => e.stopPropagation()"
    @touchstart="(e) => e.stopPropagation()"
    @touchend="(e) => e.stopPropagation()"
  >
    <OutlineKeyboard class="h-10 w-10" />
    <input
      @keydown="(e) => emit('keyPress', e)"
      @keyup="(e) => emit('keyPress', e)"
      ref="input"
      class="h-0 w-0"
    />
  </Button>
</template>
