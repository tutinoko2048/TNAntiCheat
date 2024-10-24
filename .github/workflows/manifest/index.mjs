import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';

try {
  const json = fs.readFileSync('manifest.json').toString();
  const manifest = JSON.parse(json);
  const name = manifest.header.name.split(' ')[0];
  const version = typeof manifest.header.version == 'string'
    ? manifest.header.version.join('.')
    : manifest.header.version;
  const fileName = `${name}_v${version}.mcpack`;
  core.setOutput("fileName", fileName);
  
} catch (error) {
  core.setFailed(error.message + error.stack);
}
