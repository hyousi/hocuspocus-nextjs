import { SQLite } from "@hocuspocus/extension-sqlite";
import { Hocuspocus } from "@hocuspocus/server";

// Configure the server …
const server = new Hocuspocus({
  port: 1234,
  extensions: [
    new SQLite({
      database: "prisma/db.sqlite",
    }),
  ],
});

// … and run it!
server.listen();
