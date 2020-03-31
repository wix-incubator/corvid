const { app, session } = require("electron");
const yargs = require("yargs");

app.on("ready", async () => {
  const args = yargs.argv;
  const cookies = JSON.parse(args.cookies);
  await Promise.all(
    cookies.map(cookie => session.defaultSession.cookies.set(cookie))
  );
  session.defaultSession.cookies.flushStore();
  app.quit();
});
