import { FetchError, fetchJson } from "@/lib/utils";
import { defineStore } from "pinia";
import { ref } from "vue";

type AudioDevice = { name: string; id: string };

type AudioDeviceStatus =
  | {
      status: "ok";
      devices: AudioDevice[];
      current: AudioDevice["id"];
      setOutputError?: string;
    }
  | { status: "error"; message: string }
  | { status: "pending" };

export const useAudioDeviceStore = defineStore("audioDeviceStore", () => {
  const state = ref<AudioDeviceStatus>({ status: "pending" });

  async function getOutputDevices() {
    try {
      const { devices, current } = await fetchJson("api/audio/list-output");
      state.value = { status: "ok", devices, current };
    } catch (e) {
      if (e instanceof FetchError) {
        state.value = { status: "error", message: e.message };
      }
    }
  }

  async function switchOutputDevice(id: AudioDevice["id"]) {
    if (state.value.status !== "ok") {
      return;
    }
    try {
      await fetchJson("api/audio/set-output", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      console.log("Setting id to", id);
      state.value.current = id;
    } catch (e) {
      console.log(e);
      if (e instanceof FetchError) {
        state.value.setOutputError = e.message;
      }
    }
  }

  return {
    state,
    getOutputDevices,
    switchOutputDevice,
  };
});
