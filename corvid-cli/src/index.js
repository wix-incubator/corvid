#!/usr/bin/env node
process.env.NODE_ENV = "production";
require("corvid-local-logger");
require("./cli");
