import { useWebSocket } from "@vueuse/core";
import { defineStore } from "pinia";

export const useWsStore = defineStore("ws", () => {
  const {
    status,
    data,
    send: wsSend,
    open,
    close,
  } = useWebSocket(import.meta.env.VITE_WS_URL);

  function send(data: any) {
    wsSend(JSON.stringify(data));
  }

  return { status, data, send, open, close };
});
