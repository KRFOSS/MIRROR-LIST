import { Elysia } from "elysia";
import mirrorlist from "./routes/mirrorlist";

const app = new Elysia({ prefix: "/api" })
  .get("/", () => Date.now())
  .use(mirrorlist)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
