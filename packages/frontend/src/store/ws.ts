import { useWebSocket } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useWsStore = defineStore("ws", () => {
  const wsURL =
    import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;
  const error = ref<string | null>();

  const {
    status,
    data,
    send: wsSend,
    open,
    close,
  } = useWebSocket(wsURL, {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        error.value = `Failed to connect "${wsURL}" after 3 retries`;
      },
    },
    heartbeat: {
      message: "ping",
      interval: 5000,
      pongTimeout: 1000,
    },
  });

  function send(data: any) {
    wsSend(JSON.stringify(data));
  }

  return { status, data, send, open, close, error };
});
