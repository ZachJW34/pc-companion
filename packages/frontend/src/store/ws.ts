import { requestWakeLock } from "@/lib/screen-lock";
import { useWebSocket } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

requestWakeLock().then((wakeLock) => {
  if (wakeLock) {
    setTimeout(async () => {
      console.log("[Screen Wake Lock] 30 minutes expired, releasing lock...");
      await wakeLock.release();
    }, 1000 * 60 * 30);
  }
});

export const useWsStore = defineStore("ws", () => {
  let wakeLock: WakeLockSentinel | null = null;
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
    onConnected() {
      requestWakeLock().then((wl) => {
        wakeLock = wl;
        if (wl) {
          setTimeout(() => {
            console.log(
              "[Screen Wake Lock] 30 minutes expired, releasing lock..."
            );
            wl.release();
          }, 1000 * 60 * 30);
        }
      });
    },
    onDisconnected() {
      if (wakeLock) {
        console.log("[Screen Wake Lock] WS disconnected, releasing lock...");
        wakeLock.release();
      }
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
