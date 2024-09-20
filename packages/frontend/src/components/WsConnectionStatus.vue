<script setup lang="ts">
import { useWsStore } from "../store/ws";

const ws = useWsStore();
</script>

<template>
  <template v-if="ws.status === 'CLOSED' || ws.status === 'CONNECTING'">
    <div
      class="absolute inset-0 w-full h-svh bg-secondary opacity-80 z-20"
    ></div>
    <div
      class="absolute inset-0 w-full h-svh z-10 flex items-center justify-center"
    >
      <div
        v-if="ws.status === 'CLOSED' && ws.error"
        class="bg-background p-4 border border-red-500 rounded flex items-center justify-center text-sm"
      >
        WS Connection Failed: {{ ws.error }}
      </div>
      <div
        v-else
        class="bg-background p-4 border border-primary rounded flex items-center justify-center text-sm"
      >
        WS Connection Pending...
      </div>
    </div>
  </template>
</template>
