import { Elysia } from "elysia";

import archlinux from "./archlinux";
import ubuntu from "./ubuntu";

const mirrorlist = new Elysia({ prefix: "/mirrorlist" })
    .use(archlinux)
    .use(ubuntu)

export default mirrorlist;