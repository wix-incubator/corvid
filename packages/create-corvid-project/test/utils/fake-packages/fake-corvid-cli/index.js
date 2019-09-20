#!/usr/bin/env node

/* eslint-disable */

console.log(`fake corvid-cli called in [${process.cwd()}] with [${process.argv.slice(2).join(' ')}]`)

if (process.env.FAKE_CORVID_CLI_FAILURE) {
    throw new Error("fake error from corvid-cli")
}
