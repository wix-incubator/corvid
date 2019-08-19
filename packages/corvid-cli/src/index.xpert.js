#!/usr/bin/env node

require("./ensureNodeVersion")();

process.env.XPERT = true;

require("corvid-local-logger");
require("./cli");
