import { Elysia } from "elysia";
import { fetchMirrorList } from "../../lib/fetch";
import archlinux from "./archlinux";

const mirrorlist = new Elysia({ prefix: "/mirrorlist" })
    .use(archlinux)

export default mirrorlist;