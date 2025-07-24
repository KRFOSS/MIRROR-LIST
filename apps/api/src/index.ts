import { Elysia } from "elysia";

import mirrorlist from "./routes/mirrorlist";
import swagger from "@elysiajs/swagger";

const app = new Elysia({ prefix: "/api" })
  .use(swagger({
    documentation: {
      info: {
        title: "MIRROR-LIST API",
        description: "API for KRFOSS Mirror List",
        version: "1.0.0",
      }
    },
  }))

  .get("/", () => Date.now(), {
    detail: {
      summary: "Get current timestamp",
      description: "Returns the current timestamp in milliseconds since epoch.",
      tags: ["Health Check"],
    }
  })
  .use(mirrorlist)
  .listen(6210);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
