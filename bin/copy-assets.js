#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');

program
  .option('--js [path]', 'js output path', 'assets/js/nb-base.js')
  .option('--css [path]', 'css output path', 'assets/css/nb-base.css')
  .parse(process.argv);

const jsSrcFile = path.join(__dirname, '../dist/nb-base.js');
const cssSrcFile = path.join(__dirname, '../dist/nb-base.css');

const jsOutFile = path.join(process.cwd(), program.js);
const cssOutFile = path.join(process.cwd(), program.css);

fs.copyFileSync(jsSrcFile, jsOutFile);
fs.copyFileSync(cssSrcFile, cssOutFile);
