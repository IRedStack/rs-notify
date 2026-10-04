import { cp, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await cp("client/index.html", "dist/index.html");
