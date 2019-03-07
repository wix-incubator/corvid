#!/usr/bin/env node

require("yargs")
  .usage("Usage: $0 <command> [options]")
  .command(require("./commands/clone"))
  .help("help")
  .demandCommand().argv;
