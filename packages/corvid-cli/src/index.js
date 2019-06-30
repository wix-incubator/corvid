#!/usr/bin/env node
require("./ensureNodeVersion")();

process.env.NODE_ENV = process.env.NODE_ENV || "production";
require("corvid-local-logger");
require("./cli");
