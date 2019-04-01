#!/usr/bin/env node
process.env.DEBUG = [process.env.DEBUG, "*corvid*"].join(",");
process.env.CORVID_CLI_DISABLE_HEADLESS = true;
process.env.CORVID_CLI_DEVTOOLS = true;
process.env.FORCE_COLOR = true;

require("./cli");
