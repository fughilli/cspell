#!/usr/bin/env node

const assert = require('assert');
const { gatherIssues } = require('./dist/index.cjs');

assert(gatherIssues('hello').length === 1);