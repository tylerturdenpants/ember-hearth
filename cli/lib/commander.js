const path = require('path');
const term = require('./term');
const Promise = require('bluebird');

const binaries = {
  ember: path.join(__dirname, '..', '..', 'node_modules', 'ember-cli', 'bin', 'ember'),
  npm: path.join(__dirname, '..', '..', 'node_modules', 'npm', 'bin', 'npm-cli.js')
};

class Commander {
  constructor(db, messenger) {
    this.db = db;
    this.messenger = messenger;
    this.processes = {};
    this.term = term.forPlatform();
  }

  pathToBinary(bin) {
    return binaries[bin];
  }

  runCommand(message, command) {
    console.log('run command', command);
    return this.db.findProjectById(command.project.id).then(project => {
      const args = [command.name].concat(command.args);
      let cmdPromise;

      if (command.options) {
        Object.keys(command.options).forEach(optionName =>
          args.push(`--${optionName}`, command.options[optionName]));
      }

      if (command.inTerm) {
        cmdPromise = this.term.launchTermCommand(this.pathToBinary(command.bin), args, {
          cwd: path.normalize(project.path)
        });
      } else {
        cmdPromise = Promise.resolve(this.term.spawn(this.pathToBinary(command.bin), args, {
          cwd: path.normalize(project.path)
        }));
      }

      return cmdPromise.then((cmd) => {
        cmd.stdout.on('data', (data) => {
          this.messenger.replySerialized(message, 'cmd-stdout', 'command', command, data.toString('utf8'));
          console.log(`cmd ${args} stdout: ${data}`);
        });
        cmd.stderr.on('data', (data) => {
          this.messenger.replySerialized(message, 'cmd-stderr', 'command', command, data.toString('utf8'));
          console.log(`cmd ${args} stderr: ${data}`);
        });
        cmd.on('close', (code) => {
          delete this.processes[command.id];
          this.messenger.replySerialized(message, 'cmd-close', 'command', command, code);
          console.log(`cmd ${args} child process exited with code ${code}`);
        });
        this.messenger.replySerialized(message, 'cmd-start', 'command', command);
        this.processes[command.id] = cmd;
      });
    });
  }

  killCommand(message, command) {
    if (this.processes[command.id]) {
      this.processes[command.id].kill();
    }
  }

  killAllProcesses() {
    Object.keys(this.processes).forEach(processId =>
      this.processes[processId].kill());
  }
}

module.exports = Commander;
