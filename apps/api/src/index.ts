import { Elysia } from "elysia";
//import { $ } from "bun";

import mirrorlist from "./routes/mirrorlist";
import swagger from "@elysiajs/swagger";
import rokfoss from "./routes/rokfoss";

const app = new Elysia({ prefix: "/api" })
  // .get("/whois", async ({query}) => {
  //   const { domain } = query;
  //   return await $`whois ${domain}`.text();
  // }, {
  //   detail: {
  //     summary: "Whois Lookup",
  //     description: "Performs a whois lookup for the specified domain.",
  //     tags: ["Utilities"],
  //     query: {
  //       domain: {
  //         type: "string",
  //         description: "The domain to look up."
  //       }
  //     }
  //   }
  // })
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
  .use(rokfoss)
  .listen(6210);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
