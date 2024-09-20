import type { RestResponse } from ".";
import { URL } from "url";
import { createLogger, getPlatform, JsonResponse } from "../utils";

const logger = createLogger("AUDIO");

type AudioDevice = { name: string; id: string };
type AudioHandler = {
  cmd: (...args: string[]) => string[];
  parse: (raw: string) => AudioDevice[];
};
type AudioCommands = {
  listOutput: AudioHandler;
  currentOutput: AudioHandler;
  setOutput: AudioHandler;
};

const defaultListParse = (raw: string) => {
  const parsedDevices = [];
        for (const rawDev of raw.split("\n")) {
          if (rawDev) {
            try {
              parsedDevices.push(JSON.parse(rawDev));
            } catch (e) {
              logger.debug(`Failed to parse ${rawDev} with err: ${e}`);
            }
          }
        }

        return parsedDevices;
}

const PlatformAudioHandlers: Record<string, AudioCommands> = {
  mac: {
    listOutput: {
      cmd: () => ["SwitchAudioSource", "-a", "-f", "json", "-t", "output"],
      parse: defaultListParse,
    },
    currentOutput: {
      cmd: () => ["SwitchAudioSource", "-c", "-f", "json", "-t", "output"],
      parse(raw: string) {
        return [JSON.parse(raw.trim())];
      },
    },
    setOutput: {
      cmd: (id: string) => ["SwitchAudioSource", "-i", id],
      parse: (_raw: string) => [],
    },
  },
  windows: {
    listOutput: {
      cmd: () => [
        "powershell.exe",
        "-Command",
        "Get-AudioDevice",
        "-List",
        "|",
        "ConvertTo-Json",
        "-Depth",
        "1",
      ],
      parse(raw: string) {
        return (JSON.parse(raw) as any[]).filter((val) => val.Type === 'Playback').map((val) => ({id: val.Index, name: val.Name}))
      },
    },
    currentOutput: {
      cmd: () => [
        "powershell.exe",
        "-Command",
        "Get-AudioDevice",
        "-Playback",
        "|",
        "ConvertTo-Json",
        "-Depth",
        "1",
      ],
      parse(raw: string) {
        const {Index: id, Name: name} = JSON.parse(raw);
        return [{id, name}];
      },
    },
    setOutput: {
      cmd: (id: string) => [
        "powershell.exe",
        "-Command",
        "Set-AudioDevice",
        "-Index",
        `${id}`,
        "-DefaultOnly",
      ],
      parse: (_raw: string) => [],
    },
  },
};

export async function getOutputAudioDevices(
  _request: Request,
  _url: URL
): RestResponse {
  const platform = getPlatform();
  const audioHandlers = PlatformAudioHandlers[getPlatform()];

  if (!audioHandlers) {
    return new JsonResponse(
      JSON.stringify({
        message: `No Audio Device Handler for platform= ${platform}`,
      })
    );
  }

  try {
    const devices = await executeAudioHandler(audioHandlers.listOutput);
    const [current] = await executeAudioHandler(audioHandlers.currentOutput);

    const payload = { devices, current: current.id };

    return new JsonResponse(JSON.stringify(payload), {
      status: 200,
      statusText: "ok",
    });
  } catch (e) {
    logger.debug(`Bun.spawn() failed with error: ${e}`);
    if (e instanceof TypeError) {
      return new JsonResponse(JSON.stringify({ message: e.message }), {
        status: 400,
      });
    } else {
      return new JsonResponse(
        JSON.stringify({ message: `Unknown error: ${e}` }),
        {
          status: 400,
        }
      );
    }
  }
}

export async function setOutputAudioDevice(
  request: Request,
  _url: URL
): RestResponse {
  if (!request.body) {
    return new JsonResponse(
      JSON.stringify({ message: "Invalid request, body not found." }),
      { status: 400 }
    );
  }
  const { id } = await Bun.readableStreamToJSON(request.body);

  if (!id) {
    return new JsonResponse(
      JSON.stringify({
        message: "Invalid request, malformed body. Expected { id: string }",
      }),
      { status: 400 }
    );
  }

  const platform = getPlatform();
  const audioHandlers = PlatformAudioHandlers[getPlatform()];

  if (!audioHandlers) {
    return new JsonResponse(
      JSON.stringify({
        message: `No Audio Device Handler for platform = ${platform}`,
      })
    );
  }

  try {
    await executeAudioHandler(audioHandlers.setOutput, [id]);

    return new JsonResponse(JSON.stringify({}), {
      status: 200,
      statusText: "ok",
    });
  } catch (e) {
    if (e instanceof TypeError) {
      return new JsonResponse(JSON.stringify({ message: e.message }), {
        status: 400,
      });
    } else {
      return new JsonResponse(
        JSON.stringify({ message: `Unknown error: ${e}` }),
        {
          status: 400,
        }
      );
    }
  }
}

async function executeAudioHandler(
  handler: AudioHandler,
  cmdArgs: string[] = []
) {
  logger.debug(`Executing Bun.spawn(${handler.cmd(...cmdArgs)})`);

  const subprocess = Bun.spawn({
    cmd: handler.cmd(...cmdArgs),
    stdout: "pipe",
    stderr: "pipe",
    onExit(_subprocess, exitCode, signalCode, error) {
      logger.debug("Bun.spawn exit info:", { exitCode, signalCode, error });
    },
  });
  const raw = await Bun.readableStreamToText(subprocess.stdout);
  logger.debug(`Raw shell result: ${raw}`);
  return handler.parse(raw);
}
