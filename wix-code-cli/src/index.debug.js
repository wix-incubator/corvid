#!/usr/bin/env node
process.env.DEBUG = [process.env.DEBUG, "*wix*"].join(",");
process.env.WIXCODE_CLI_DISABLE_HEADLESS = true;
process.env.WIXCODE_CLI_DEVTOOLS = true;
process.env.FORCE_COLOR = true;

require("./cli");
