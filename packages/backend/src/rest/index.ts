import { getOutputAudioDevices, setOutputAudioDevice } from "./audio-devices";

export type RestResponse = Promise<Response>;

export async function restApiHandler(request: Request, url: URL): RestResponse {
  if (url.pathname.startsWith("/api/audio/list-output")) {
    return getOutputAudioDevices(request, url);
  }
  if (url.pathname.startsWith("/api/audio/set-output")) {
    return setOutputAudioDevice(request, url);
  }

  return new Response("", {
    status: 404,
    statusText: "Endpoint does not exist",
  });
}
