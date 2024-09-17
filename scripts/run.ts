import { networkInterfaces } from "os";
import { join } from "path";

function getIpAddress() {
  for (const interfaces of Object.values(networkInterfaces())) {
    const ip = (interfaces || []).find(
      (x) => x.family === "IPv4" && !x.internal
    );

    if (ip) return ip.address;
  }
}

const ROOT_DIR = join(import.meta.dirname, "..");
const BACKEND_LOG = join(ROOT_DIR, "backend.log");
const BACKEND_ERROR_LOG = join(ROOT_DIR, "backend-error.log");
const CADDY_LOG = join(ROOT_DIR, "caddy.log");
const CADDY_ERROR_LOG = join(ROOT_DIR, "caddy-error.log");
const ipAddress = getIpAddress();

if (!ipAddress) {
  console.error("Could not find IP Address. Exiting...");
  process.exit(1);
}

const bunServer = Bun.spawn({
  cmd: ["bun", "run", "start"],
  cwd: ROOT_DIR,
  stdout: Bun.file(BACKEND_LOG),
  stderr: Bun.file(BACKEND_ERROR_LOG),
  env: { ...Bun.env, NODE_ENV: "production" },
});

const caddyServer = Bun.spawn({
  cmd: ["caddy", "run"],
  cwd: ROOT_DIR,
  stdout: Bun.file(CADDY_LOG),
  stderr: Bun.file(CADDY_ERROR_LOG),
  env: { ...Bun.env, IP_ADDRESS: ipAddress },
});

await Promise.race([bunServer.exited, caddyServer.exited]);

if (bunServer.exitCode) {
  console.error(
    `Bun server exited with error code ${bunServer.exitCode}. Exiting...`
  );
}
if (caddyServer.exitCode) {
  console.error(
    `Bun server exited with error code ${bunServer.exitCode}. Exiting...`
  );
}

bunServer.kill();
caddyServer.kill();
