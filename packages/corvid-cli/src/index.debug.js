#!/usr/bin/env node

require("./ensureNodeVersion")();

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.LOG_LEVEL = process.env.LOG_LEVEL || "debug";
process.env.CORVID_CLI_DISABLE_HEADLESS = true;
process.env.CORVID_CLI_DEVTOOLS = true;
process.env.FORCE_COLOR = true;

require("corvid-local-logger");
require("./cli");
