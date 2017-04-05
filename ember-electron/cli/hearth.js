const path = require('path');
const {Tray, Menu, MenuItem} = require('electron');
const DB = require('./lib/db');
const Commander = require('./lib/commander');
const Config = require('./lib/config');
const Serializer = require('./lib/serializer');
const Messenger = require('./lib/messenger');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const files = Promise.promisify(require('node-dir').files);
const jsonminify = require("jsonminify");
const NodeInstaller = require('./lib/installer/node');

class Hearth {
  constructor(app, window, ipc) {
    this.fs = fs;
    this.app = app;
    this.window = window;
    this.tray = new Tray(path.join(__dirname, 'assets', 'hearth-tray@2x.png'));
    this.projects = [];
    this.processes = {};

    this.db = new DB(app.getPath('userData'));
    this.config = new Config(app.getPath('userData'));
    this.nodeInstaller = new NodeInstaller(this.app.getPath('userData'));
    this.serializer = new Serializer();
    this.messenger = new Messenger(ipc);
    this.commander = new Commander(this.db, this.messenger, this.config);
    this.resetTray();
    this.attachListeners();
    this.updateMenu();
  }

  updateMenu() {
    let applicationMenu = Menu.getApplicationMenu();
    if (applicationMenu === null) {
      applicationMenu = new Menu()
    }

    const submenu = [];

    if (process.platform === 'darwin') {
      submenu.push({
        role: 'about'
      }, {
        type: 'separator'
      }, {
        label: 'Preferences',
        click: () => this.window.webContents.send('open-route', 'settings')
      }, {
        type: 'separator'
      }, {
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        role: 'hide'
      }, {
        role: 'hideothers'
      }, {
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        role: 'quit'
      });
    } else {
      submenu.push({
        label: 'Settings',
        click: () => this.window.webContents.send('open-route', 'settings')
      });
    }

    const menuItem = new MenuItem({
      label: this.app.getName(),
      submenu: submenu
    });
    applicationMenu.insert(0, menuItem);
    Menu.setApplicationMenu(applicationMenu);
  }

  updateConfig(fields) {
    this.config.fields = fields;
    this.config.save();
  }

  attachListeners() {
    this.messenger.on('hearth-init-project', (message) => {
      const data = message.data;

      console.log('init', message.data);
      const ember = this.commander.term.spawn(
        this.commander.pathToBinary('ember'),
        ['init', '--name', path.basename(data.path)], {
          cwd: path.normalize(data.path)
        }
      );

      ember.stdout.on('data', (stdoutData) => {
        console.log(`${data.path} stdout: ${stdoutData.toString('utf8')}`);
        this.messenger.reply(message, 'project-init-stdout', stdoutData.toString('utf8'));
      });
      ember.stderr.on('data', (stderrData) => {
        console.log(`${data.path} stderr: ${stderrData.toString('utf8')}`);
        this.messenger.reply(message, 'project-init-stderr', stderrData.toString('utf8'));
      });
      ember.on('close', (code) => {
        console.log(`${data.path} child process exited with code ${code}`);
        this.addProject(data.path).then(project => {
          return this.refreshProjects()
            .then(projects => this.messenger.replySerialized(message, 'project-list', 'project', projects))
            .then(() => this.messenger.replySerialized(message, 'project-init-end', 'project', project));
        }).catch(() => this.messenger.reply(message, 'project-not-ember-app', data.path))
      });
      this.messenger.reply(message, 'project-init-start', data);
    });

    this.messenger.onDeserialized('hearth-ready', 'project', (message) => {
      this.db.findAllProjects()
        .filter(project => this.validProject(project.path).catch(() => false))
        .map(project => this.addMetadata(project))
        .then(projects => {
          this.projects = projects;
          return this.messenger.replySerialized(message, 'project-list', 'project', projects);
        })
        .finally(() => this.resetTray())
        .catch(e => console.error(e));
    });

    this.messenger.on('hearth-add-project', (message) => {
      const projectPath = message.data;
      console.log('hearth-add-project', projectPath);
      this.addProject(projectPath)
        .then(project => this.refreshProjects()
          .then(projects => this.messenger.replySerialized(message, 'project-list', 'project', projects))
          .then(() => this.messenger.replySerialized(message, 'open-project', 'project', project)))
        .catch(() => this.messenger.reply(message, 'project-not-ember-app', projectPath));
    });

    this.messenger.on('hearth-emit-config', message => {
      this.messenger.reply(message, 'hearth-config', this.config.fields);
    });
    this.messenger.on('hearth-update-config', message => {
      this.updateConfig(message.data);
    });

    this.messenger.onDeserialized('hearth-remove-project', 'project', (message) => {
      const project = message.data;
      console.log('hearth-remove-project', project);

      project.commands.forEach(command => this.commander.killCommand(message, command.id));
      this.db.removeProjectById(project.id)
        .then(() => this.refreshProjects())
        .then(projects => this.messenger.replySerialized(message, 'project-list', 'project', projects));
    });

    this.messenger.on('hearth-installer-node-install', (message) => {
      if (!this.nodeInstaller.installing) {
        this.messenger.reply(message, 'hearth-installer-node-install-started');
        this.nodeInstaller.on('progress',
          ev => this.messenger.reply(message, 'hearth-installer-node-install-progress', ev.message));

        this.nodeInstaller.install()
          .then(node => this.messenger.reply(message, 'hearth-installer-node-install-finished', {node, path: this.nodeInstaller.nodePath}))
          .catch(e => {
            this.messenger.reply(message, 'hearth-installer-node-install-failed', e);
            console.error('installation error', e);
          })
          .finally(() => this.nodeInstaller.removeAllListeners());
      }
    });

    this.messenger.onDeserialized('hearth-run-cmd', 'command', (message) => {
      console.log('hearth-run-cmd', message);
      this.commander.runCommand(message, message.data);
    });
    this.messenger.onDeserialized('hearth-kill-cmd', 'command', (message) => {
      console.log('hearth-kill-cmd', message.data);
      this.commander.killCommand(message, message.data);
    });
    this.messenger.onDeserialized('hearth-sync-project', 'project', (message) => {
      this.refreshProjects()
        .then(projects => this.messenger.replySerialized(message, 'project-list', 'project', projects));
    });
    this.messenger.onDeserialized('hearth-update-project', 'project', (message) => {
      this.updateProject(message.data)
        .then(() => this.refreshProjects())
        .then(projects => this.messenger.replySerialized(message, 'project-list', 'project', projects));
    });
  }

  resetTray() {
    let tpl = this.projects.map(project => {
      return {
        label: project.name,
        type: 'normal',
        click: () => {
          this.messenger.serializer.serialize('project', project)
            .then(serialized => this.window.webContents.send('open-project', serialized))
            .then(() => this.window.show());
        }
      };
    }).concat([
      {type: 'separator'},
      {label: 'Exit Hearth', type: 'normal', click: () => this.app.quit()}
    ]);

    this.tray.setToolTip(`Ember Hearth v${this.app.getVersion()}`);
    this.tray.setContextMenu(Menu.buildFromTemplate(tpl));
  }

  updateProject(project) {
    const cli = project.cli;
    const cliPath = path.resolve(project.path, '.ember-cli');

    console.log(`updating project config at ${cliPath}`);
    return fs.writeFileAsync(cliPath, JSON.stringify(cli, null, ' '));
  }

  addMetadata(project) {
    // get some app metadata (could probably be cached, but avoids old entries if stored in db on add)
    console.log('addMetadata', project.path);
    const packagePath = path.resolve(project.path, 'package.json');
    const cliPath = path.resolve(project.path, '.ember-cli');
    const appPath = path.resolve(project.path, 'app');

    return Promise.props({
      'package': this.fs.statAsync(packagePath),
      'cli': this.fs.statAsync(cliPath),
      'app': files(appPath)
    }).then((stats) => {
      return Promise.props({
        'package': stats.package.isFile() && fs.readFileAsync(packagePath),
        cli: stats.cli.isFile() && fs.readFileAsync(cliPath)
      }).then(data => {
        if (data.package) project.package = JSON.parse(data.package);
        if (data.cli) project.cli = JSON.parse(jsonminify(data.cli.toString('utf8')));

        // TODO: read default ports
        if (!project.cli) project.cli = {};
        if (!project.cli.testPort) project.cli.testPort = 7357;
        if (!project.cli.port) project.cli.port = 4200;

        project.transforms = stats.app.map(path => path.substring(project.path.length))
          .filter((path) => path.indexOf('/app/transforms/') !== -1);

        return project;
      });
    });
  }

  validProject(projectPath) {
    console.log('validProject', projectPath);
    const packagePath = path.join(projectPath, 'package.json');

    return this.fs.statAsync(packagePath)
      .then((stat) => stat.isFile() ? this.fs.readFileAsync(packagePath) : Promise.reject())
      .then((data) => {
        const pkg = JSON.parse(data);

        const isEmberProject = pkg.devDependencies.hasOwnProperty('ember-cli') ||
          pkg.dependencies.hasOwnProperty('ember-cli') ||
          pkg.optionalDependencies.hasOwnProperty('ember-cli') ||
          pkg.bundleDependencies.hasOwnProperty('ember-cli') ||
          pkg.peerDependencies.hasOwnProperty('ember-cli');

        return isEmberProject ? projectPath : Promise.reject('Not a valid ember project');
      });
  }

  refreshProjects() {
    return this.db.findAllProjects()
      .filter(project => this.validProject(project.path).catch(() => false))
      .map(project => this.addMetadata(project))
      .then(projects => this.projects = projects)
      .finally(() => this.resetTray());
  }

  addProject(projectPath) {
    console.log('addProject', projectPath);
    return this.validProject(projectPath)
      .then((projectPath) => this.db.findProjectByPath(projectPath))
      .then(project => {
        if (project) {
          return project;
        } else {
          return this.db.insertProjectByPath(projectPath);
        }
      });
  }

  destroy() {
    this.commander.killAllProcesses();
  }
}


module.exports = Hearth;
