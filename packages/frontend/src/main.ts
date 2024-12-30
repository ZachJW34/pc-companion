import { createApp } from "vue";
import "./index.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { requestWakeLock } from "./lib/screen-lock";

createApp(App).use(createPinia()).mount("#app");

let wakeLock = await requestWakeLock();

if (wakeLock) {
  setTimeout(async () => {
    console.log("[Screen Wake Lock] 30 minutes expired, releasing lock...");
    await wakeLock.release();
  }, 1000 * 60 * 30);
}
