import { Emulator } from "./emulator";
import path from "node:path";

const FRONTEND_ASSETS_BASE = path.join(process.cwd(), "..", "frontend", "dist");
const emulator = await Emulator.NEW();

const server = Bun.serve({
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response("Upgrade failed", { status: 400 });
      }

      return new Response("WS available");
    }

    // assume static content;
    const filePath = FRONTEND_ASSETS_BASE + new URL(req.url).pathname;

    const file = Bun.file(filePath);
    const exists = await file.exists();

    if (!exists) {
      const index = Bun.file(path.join(FRONTEND_ASSETS_BASE, "index.html"));
      return new Response(index);
    } else {
      return new Response(file);
    }
  },
  websocket: {
    async message(ws, message) {
      if (message === "ping") {
        ws.send("pong");
        return;
      }
      await emulator.handleEvent(message);
    },
  },
  port: Number(process.env.PORT) || 3000,
});

console.log(`PC-Companion is running on ${server.url.origin}`);
