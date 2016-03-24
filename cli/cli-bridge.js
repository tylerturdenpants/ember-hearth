'use strict';

const cli = require("ember-cli/lib/cli");
const through = require('through');
// const Project = require('ember-cli/lib/models/project');
// const HelpCommand = require('ember-cli/lib/commands/help');
// const EmberApp = require('ember-cli/lib/broccoli/ember-app');
//
// let options = {
//   json: true
// };
//
// let project = Project.projectOrnullProject('/Users/locks/src/ember-hearth');
// let app = new EmberApp({ project: project });
// let help = new HelpCommand(app);
//
let output = "";

function cleanOutput(input) {
  let split = input.split("\n");
  let head = split[0];

  if (head.startsWith('version')) {
    split = split.slice(1, -1);
  }

  return JSON.parse(split.join(""));
}

module.exports {
  cli: function() {
    return cli({
        inputStream: through(),
        outputStream: through(function(data) {
          output += data;
        }.bind(this)),
        errorStream: through(function(data) {
          this.errors += data;
        }.bind(this)),
        cliArgs: ['help', '--json']
    }).then(function(exitCode) {
      console.log(output);
      return cleanOutput(output);
    });
  }
}
