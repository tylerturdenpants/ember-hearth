const path = require('path');
const Promise = require('bluebird');
const fs = require('fs');
const semver = require('semver');
const got = require('got');
const crypto = require('crypto');
const temp = require('temp');
const {EventEmitter} = require('events');
const mkdirp = require('mkdirp');

const tarExtract = require('./utils/targz-extract');

const _NODE = 'hearth-node';

temp.track();

class LocalNode extends EventEmitter {
  constructor(directory) {
    super();

    this.RELEASES = 'https://nodejs.org/download/release';
    this.RELEASES_INDEX = 'https://nodejs.org/dist/index.json';

    this.installing = false;
    this.directory = directory;
    this.nodePath = path.join(directory, _NODE);
    this.versionPath = path.join(this.directory, 'hearth-node-version.json');
  }

  didPreviouslyInstallNode() {
    this.emit('progress', {message: `checking for previous installed local node`});

    try {
      const previusNodeStat = fs.statSync(this.versionPath);
      if (previusNodeStat) {
        this.emit('progress', {message: 'could locate previously installed local node'});

        try {
          const node = JSON.parse(fs.readFileSync(this.versionPath));
          this.emit('progress', {message: 'could parse previously installed local node'});
          return Promise.resolve(node);
        } catch (e) {
          // error in version file, nuke node path and reject
          // TODO: rm -rf versionPath, nodePath
          return Promise.reject(new Error('could\'t JSON parse previous nodes version file, nuking.'));
        }
      }
    } catch (e) {
      this.emit('progress', {message: 'couldn\'t locate previously installed local node'});
    }
    return Promise.reject();
  }

  findRecentLTSNode() {
    this.emit('progress', {message: 'loading released node versions'});
    return got(this.RELEASES_INDEX).then(response => {
      const lts = JSON.parse(response.body)
        .filter(v => v.lts !== false)
        .sort((a, b) => semver.compare(a.version, b.version));
      const recentNode = lts[lts.length - 1];

      fs.writeFileSync(this.versionPath, JSON.stringify(recentNode));
      this.emit('progress', {message: `picking node version from index: ${recentNode.version}`});
      return recentNode;
    });
  }

  verifyArchive(node, archive, signature) {
    var shasum = crypto.createHash('sha256');
    return new Promise((resolve, reject) => {
      this.emit('progress', {message: `verifying archive ${archive} shasum with ${signature}`});

      const hasher = fs.createReadStream(archive).pipe(shasum);
      let hashed = '';

      hasher.on('data', data => hashed += data.toString('hex'));
      hasher.on('error', e => reject(e));
      hasher.on('end', () => {
        if (hashed === signature) {
          resolve([archive, signature]);
        }
        reject('Calculated hash doesn\'t equal given hash');
      });
    });
  }

  extractArchive(node, archive, destination) {
    this.emit('progress', {message: `extracting archive ${archive} to ${destination} (${node.version})`});

    return tarExtract(archive, destination, {strip: 1})
      .then(() => node)
      .catch(e => console.error('error extracting archive', e));
  }

  shasumForNode(node) {
    const url = `${this.RELEASES}/${node.version}/SHASUMS256.txt`;
    const matcher = new RegExp(`[0-9a-z]{64}  ${this.nodeFilename(node)}`);

    return got(url).then(response => {
      return response.body
        .split('\n')
        .find(line => matcher.test(line))
        .substring(0, 64)
    });
  }

  nodeFilename(node, {arch, platform} = process) {
    if (!['win32', 'darwin', 'linux'].includes(platform)) {
      throw new Error(`Unsupported platform: ${platform}, please install node manually`);
    }
    if (!['ia32', 'x64'].includes(arch)) {
      throw new Error(`Unsupported architecture: ${arch}, please install node manually`);
    }

    if (platform === 'win32') {
      platform = 'win'
    }
    if (arch === 'ia32') {
      arch = 'x86'
    }

    return `node-${node.version}-${platform}-${arch}.tar.gz`;
  }

  download(url, destination) {
    return new Promise((resolve, reject) => {
      got.stream(url).pipe(fs.createWriteStream(destination))
        .on('close', () => resolve(destination))
        .on('error', (e) => reject(e));
    })
  }

  downloadAndExtractNode(node) {
    const directory = this.nodePath;
    const nodeFile = this.nodeFilename(node);
    const url = `${this.RELEASES}/${node.version}/${nodeFile}`;
    const tempNodeTar = temp.mkdirSync('node-tar-gz');

    this.emit('progress', {message: `downloading, extracting and verifying node ${node.version}`});

    return Promise.all([
      this.download(url, path.join(tempNodeTar, 'node.tar.gz')),
      this.shasumForNode(node)
    ]).then(([archive, signature]) =>
      this.verifyArchive(node, archive, signature)
        .then(() => this.extractArchive(node, archive, directory))
        .catch(e => new Error(`Error verifying archive signature. Time to equip your tinfoil hat. (Node ${node.version})`, e)))
  }

  localNodeIsRecentNode(localNode) {
    this.emit('progress', {message: 'checking if local node is recent node'});
    return this.findRecentLTSNode().then(recentNode => {
      if (semver.lt(localNode.version, recentNode.version)) {
        return Promise.reject();
      } else {
        return Promise.resolve(localNode);
      }
    });
  }

  install() {
    this.installing = true;
    this.emit('progress', {message: 'starting local node installation process'});

    mkdirp.sync(this.nodePath);

    return this.didPreviouslyInstallNode()
      .then((node) => this.localNodeIsRecentNode(node))
      .catch(() => this.findRecentLTSNode()
        .then(node => this.downloadAndExtractNode(node)))
      .then(node => {
        this.installing = false;
        this.emit('progress', {message: `"installed" local node ${node.version} at ${this.nodePath}`});
        return node;
      })
  }
}

module.exports = LocalNode;
