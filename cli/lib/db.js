const path = require('path');
const uuid = require('node-uuid');
const mkdirp = require('mkdirp');
const Datastore = require('nedb');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

class DB {
  constructor(dataStorePath) {
    this.fs = fs;
    const nedbPath = path.join(dataStorePath, 'hearth.nedb.json');

    mkdirp.sync(dataStorePath, {fs: this.fs});

    try {
      this.fs.statSync(nedbPath);
      console.log(`using store at ${nedbPath}`);
    } catch (e) {
      this.fs.writeFileSync(nedbPath, '');
      console.log(`created and using store at ${nedbPath}`);
    }

    this.store = {
      projects: Promise.promisifyAll(new Datastore({
        filename: path.join(nedbPath),
        autoload: true
      }))
    };
  }

  findProjectById(projectId) {
    return this.store.projects.findOneAsync({'id': projectId});
  }

  findProjectByPath(projectPath) {
    return this.store.projects.findOneAsync({"path": projectPath});
  }

  findAllProjects() {
    return this.store.projects.findAsync({});
  }

  insertProjectByPath(projectPath) {
    return this.store.projects.insertAsync({
      id: uuid.v4(),
      path: projectPath,
      name: path.basename(projectPath)
    });
  }

  removeProjectById(projectId) {
    return this.store.projects.removeAsync({'id': projectId})
  }
}

module.exports = DB;
