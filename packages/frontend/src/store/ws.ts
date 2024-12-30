import { useWebSocket } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useWsStore = defineStore("ws", () => {
  const { protocol, host } = window.location;
  const wsURL = `${protocol === "http:" ? "ws" : "wss"}://${host}/ws`;
  const error = ref<string | null>();

  const {
    status,
    data,
    send: wsSend,
    open: wsOpen,
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

  function open() {
    error.value = null;
    wsOpen();
  }

  function send(data: any) {
    wsSend(JSON.stringify(data));
  }

  return { status, data, send, open, close, error };
});
