export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  try {
    let wakeLock = await navigator.wakeLock.request();
    wakeLock.addEventListener("release", () => {
      console.log("Screen Wake Lock released:", wakeLock.released);
    });
    console.log("Screen Wake Lock preventing app from sleeping.");
    return wakeLock;
  } catch (err: any) {
    console.error(`${err.name}, ${err.message}`);
    return null;
  }
}
