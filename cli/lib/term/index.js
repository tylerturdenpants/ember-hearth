'use strict';

const spawn = require('child_process').spawn;
const cp = require('child_process');
const fs = require('fs');
const temp = require('temp');

temp.track();

class Term {
  constructor(){

  }

  fixSpawnArguments(node, args) {
    if (node === undefined) {
      // if no custom node path, use the first arg as script
      node = args.shift();
    }
    return [node, args];
  }

  spawn(node, args, spawnOptions) {
    const fixed = this.fixSpawnArguments(node, args);
    console.log('term.spawn', ...fixed, spawnOptions);
    return spawn(...fixed, spawnOptions);
  }

  buildTermLaunchArgs(/*scriptPath*/) {
    throw 'not implemented';
  }

  buildRunScript(/*bin, args, projectDir, hasFullBinaryPath*/) {
    throw 'not implemented';
  }

  buildCommandScript(node, args, projectDir) {
    const fixed = this.fixSpawnArguments(node, args);
    let script = this.buildRunScript(...fixed, projectDir, node !== undefined);
    const content = script.content;
    const suffix = script.suffix;

    return new Promise((resolve, reject) => {
      temp.open({prefix: "ember-hearth", suffix}, function (err, info) {
        if (!err) {
          fs.write(info.fd, content);
          fs.close(info.fd, function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(info.path);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  }

  launchTermCommand(bin, args, spawnOptions) {
    return this.buildCommandScript(bin, args, spawnOptions.cwd)
      .then(scriptPath =>
        cp.spawn.apply(cp, this.buildTermLaunchArgs(scriptPath), spawnOptions));
  }

  static forPlatform(platform) {
    // gief default params :(
    platform = platform || process.platform;
    const platformTerm = {
      'win32': './win32',
      'darwin': './darwin',
      'linux': './linux'
    };

    let term;
    if (platformTerm.hasOwnProperty(platform)) {
      term = new (require(platformTerm[platform]))();
    } else {
      throw `Unsupported process platform. Please open an issue to add support for ${platform}`;
    }
    return term;
  }
}

module.exports = Term;
